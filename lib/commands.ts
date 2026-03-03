
export interface Command {
  name: string;
  description: string;
  execute: (args: string[], context: any) => Promise<string | void | { type: string, content: any }>;
}

export const commands: Command[] = [
  {
    name: 'help',
    description: 'List all available commands',
    execute: async () => {
      const commandList = commands.map(c => `/${c.name} - ${c.description}`).join('\n');
      return `**Available Commands:**\n${commandList}`;
    }
  },
  {
    name: 'clear',
    description: 'Clear your local chat history',
    execute: async (_, { setMessages }) => {
      setMessages([]);
      return { type: 'system', content: 'Chat history cleared locally.' };
    }
  },
  {
    name: 'roll',
    description: 'Roll a dice (d6 by default, or /roll [sides])',
    execute: async (args) => {
      const sides = parseInt(args[0]) || 6;
      const result = Math.floor(Math.random() * sides) + 1;
      return `🎲 You rolled a **${result}** (1-${sides})`;
    }
  },
  {
    name: 'flip',
    description: 'Flip a coin',
    execute: async () => {
      const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
      return `🪙 You flipped **${result}**`;
    }
  },
  {
    name: 'echo',
    description: 'Echo a message',
    execute: async (args) => {
      return args.join(' ');
    }
  },
  {
    name: 'shrug',
    description: '¯\\_(ツ)_/¯',
    execute: async () => {
      return '¯\\_(ツ)_/¯';
    }
  },
  {
    name: 'tableflip',
    description: '(╯°□°）╯︵ ┻━┻',
    execute: async () => {
      return '(╯°□°）╯︵ ┻━┻';
    }
  },
  {
    name: 'unflip',
    description: '┬─┬ ノ( ゜-゜ノ)',
    execute: async () => {
      return '┬─┬ ノ( ゜-゜ノ)';
    }
  }
];

export const processCommand = async (input: string, context: any) => {
  const [commandName, ...args] = input.slice(1).split(' ');
  const command = commands.find(c => c.name === commandName.toLowerCase());

  if (command) {
    return await command.execute(args, context);
  }
  return null;
};
