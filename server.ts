import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server, Socket } from "socket.io";

// Extend Socket interface to include custom properties
interface ExtendedSocket extends Socket {
  userId?: string;
}

// Types pour le status manager
type UserStatus = 'ONLINE' | 'IDLE' | 'DND' | 'OFFLINE' | 'INVISIBLE';

interface StatusData {
  userId: string;
  status: UserStatus;
  lastSeen: Date;
}

// Status Manager simplifié inline
class StatusManager {
  private static instance: StatusManager;
  private statusMap: Map<string, StatusData> = new Map();
  private heartbeatIntervals: Map<string, NodeJS.Timeout> = new Map();
  private readonly HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly OFFLINE_TIMEOUT = 15 * 60 * 1000; // 15 minutes without heartbeat

  static getInstance(): StatusManager {
    if (!StatusManager.instance) {
      StatusManager.instance = new StatusManager();
    }
    return StatusManager.instance;
  }

  registerUser(userId: string, initialStatus: UserStatus = 'ONLINE'): void {
    const statusData: StatusData = {
      userId,
      status: initialStatus,
      lastSeen: new Date()
    };
    this.statusMap.set(userId, statusData);
    this.startHeartbeat(userId);
  }

  unregisterUser(userId: string): void {
    this.stopHeartbeat(userId);
    this.updateStatus(userId, 'OFFLINE');
  }

  updateStatus(userId: string, status: UserStatus): void {
    const current = this.statusMap.get(userId);
    if (current) {
      current.status = status;
      current.lastSeen = new Date();
      this.statusMap.set(userId, current);
    }
  }

  recordActivity(userId: string): void {
    const current = this.statusMap.get(userId);
    if (current && current.status !== 'DND' && current.status !== 'INVISIBLE') {
      current.status = 'ONLINE';
      current.lastSeen = new Date();
      this.statusMap.set(userId, current);
    }
  }

  getStatus(userId: string): UserStatus | null {
    const statusData = this.statusMap.get(userId);
    if (!statusData) return null;

    const timeSinceLastSeen = Date.now() - statusData.lastSeen.getTime();
    if (timeSinceLastSeen > this.OFFLINE_TIMEOUT && statusData.status !== 'INVISIBLE') {
      statusData.status = 'OFFLINE';
      this.statusMap.set(userId, statusData);
    }

    return statusData.status;
  }

  getAllStatuses(): Map<string, UserStatus> {
    const result = new Map<string, UserStatus>();
    this.statusMap.forEach((statusData, userId) => {
      result.set(userId, this.getStatus(userId) || 'OFFLINE');
    });
    return result;
  }

  private startHeartbeat(userId: string): void {
    this.stopHeartbeat(userId);
    const interval = setInterval(() => {
      this.updateStatus(userId, this.getStatus(userId) || 'OFFLINE');
    }, this.HEARTBEAT_INTERVAL);
    this.heartbeatIntervals.set(userId, interval);
  }

  private stopHeartbeat(userId: string): void {
    const interval = this.heartbeatIntervals.get(userId);
    if (interval) {
      clearInterval(interval);
      this.heartbeatIntervals.delete(userId);
    }
  }
}

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const statusManager = StatusManager.getInstance();

  io.on("connection", (socket: ExtendedSocket) => {
    console.log("A user connected:", socket.id);

    // Handle user authentication and status registration
    socket.on("authenticate", (userData) => {
      console.log(`User ${userData.userId} authenticated with socket ${socket.id}`);
      socket.userId = userData.userId;
      socket.join(`user-${userData.userId}`);
      
      // Register user for status tracking
      statusManager.registerUser(userData.userId, userData.status || 'ONLINE');
      
      // Broadcast status to all users
      io.emit("user-status-update", {
        userId: userData.userId,
        status: statusManager.getStatus(userData.userId)
      });
    });

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.userId} joined room ${roomId}`);
    });

    socket.on("send-message", (data) => {
      // Only send to users in the specific channel
      io.to(data.channelId).emit("new-message", data.message);
    });

    socket.on("typing", (data) => {
      // Send typing indicator only to users in the same channel
      socket.to(data.channelId).emit("user-typing", data);
    });

    // Handle status updates
    socket.on("status-update", (status: UserStatus) => {
      if (socket.userId) {
        statusManager.updateStatus(socket.userId, status);
        io.emit("user-status-update", {
          userId: socket.userId,
          status: status
        });
      }
    });

    // Handle activity tracking
    socket.on("activity", () => {
      if (socket.userId) {
        statusManager.recordActivity(socket.userId);
        const currentStatus = statusManager.getStatus(socket.userId);
        if (currentStatus && currentStatus !== statusManager.getStatus(socket.userId)) {
          io.emit("user-status-update", {
            userId: socket.userId,
            status: currentStatus
          });
        }
      }
    });

    // Handle heartbeat
    socket.on("heartbeat", () => {
      if (socket.userId) {
        const currentStatus = statusManager.getStatus(socket.userId);
        if (currentStatus) {
          statusManager.updateStatus(socket.userId, currentStatus);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      if (socket.userId) {
        // Mark user as offline and broadcast
        statusManager.unregisterUser(socket.userId);
        io.emit("user-status-update", {
          userId: socket.userId,
          status: 'OFFLINE'
        });
      }
    });
  });

  // Periodic status broadcast and cleanup
  setInterval(() => {
    const allStatuses = statusManager.getAllStatuses();
    allStatuses.forEach((status, userId) => {
      io.emit("user-status-update", {
        userId,
        status
      });
    });
  }, 30000); // Broadcast every 30 seconds

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
