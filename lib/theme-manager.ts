export type Theme = 'dark' | 'light' | 'auto';
export type AccentColor = string;

export interface ThemeConfig {
  theme: Theme;
  accentColor: AccentColor;
  customColors?: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
  };
}

export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: Theme = 'dark';
  private currentAccent: AccentColor = '#5865F2';
  private listeners: Set<(theme: Theme, accent: AccentColor) => void> = new Set();

  // Palettes de couleurs prédéfinies
  private static readonly COLOR_SCHEMES = {
    dark: {
      primary: '#5865F2',
      secondary: '#4752C4',
      background: '#36393F',
      surface: '#2F3136',
      text: '#DCDDDE',
      textSecondary: '#8E9297',
      border: '#202225'
    },
    light: {
      primary: '#5865F2',
      secondary: '#4752C4',
      background: '#FFFFFF',
      surface: '#F2F3F5',
      text: '#2E3338',
      textSecondary: '#747F8D',
      border: '#E3E5E8'
    }
  };

  // Couleurs d'accent Discord
  private static readonly ACCENT_COLORS = {
    '#ED4245': 'Discord Red',
    '#57F287': 'Discord Green', 
    '#FEE75C': 'Discord Yellow',
    '#EB459E': 'Discord Pink',
    '#5865F2': 'Discord Blurple',
    '#1F1F1F': 'Discord Black',
    '#FFFFFF': 'Discord White'
  };

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  constructor() {
    this.loadFromStorage();
    this.applyTheme();
  }

  /**
   * Définit le thème
   */
  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    this.applyTheme();
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Définit la couleur d'accent
   */
  setAccentColor(color: AccentColor): void {
    this.currentAccent = color;
    this.applyTheme();
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Définit le thème et la couleur d'accent
   */
  setThemeConfig(config: Partial<ThemeConfig>): void {
    if (config.theme !== undefined) this.currentTheme = config.theme;
    if (config.accentColor !== undefined) this.currentAccent = config.accentColor;
    
    this.applyTheme();
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Récupère le thème actuel
   */
  getTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * Récupère la couleur d'accent actuelle
   */
  getAccentColor(): AccentColor {
    return this.currentAccent;
  }

  /**
   * Récupère la configuration complète
   */
  getConfig(): ThemeConfig {
    const theme = this.currentTheme === 'auto' ? 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
      this.currentTheme;

    return {
      theme: this.currentTheme,
      accentColor: this.currentAccent,
      customColors: {
        ...ThemeManager.COLOR_SCHEMES[theme],
        primary: this.currentAccent
      }
    };
  }

  /**
   * Applique le thème au DOM
   */
  private applyTheme(): void {
    const config = this.getConfig();
    const root = document.documentElement;

    // Définir les variables CSS
    if (config.customColors) {
      root.style.setProperty('--color-primary', config.customColors.primary);
      root.style.setProperty('--color-secondary', config.customColors.secondary);
      root.style.setProperty('--color-background', config.customColors.background);
      root.style.setProperty('--color-surface', config.customColors.surface);
      root.style.setProperty('--color-text', config.customColors.text);
      root.style.setProperty('--color-text-secondary', config.customColors.textSecondary);
      root.style.setProperty('--color-border', config.customColors.border);
    }

    // Définir la classe de thème
    root.setAttribute('data-theme', config.theme === 'auto' ? 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
      config.theme);

    // Appliquer la couleur d'accent
    root.style.setProperty('--color-accent', config.accentColor);
  }

  /**
   * Sauvegarde la configuration dans localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const config = {
        theme: this.currentTheme,
        accentColor: this.currentAccent
      };
      localStorage.setItem('discord-clone-theme', JSON.stringify(config));
    } catch (error) {
      console.warn('Failed to save theme config:', error);
    }
  }

  /**
   * Charge la configuration depuis localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('discord-clone-theme');
      if (stored) {
        const config = JSON.parse(stored);
        this.currentTheme = config.theme || 'dark';
        this.currentAccent = config.accentColor || '#5865F2';
      }
    } catch (error) {
      console.warn('Failed to load theme config:', error);
    }
  }

  /**
   * Ajoute un écouteur de changements de thème
   */
  addListener(listener: (theme: Theme, accent: AccentColor) => void): void {
    this.listeners.add(listener);
  }

  /**
   * Supprime un écouteur de changements de thème
   */
  removeListener(listener: (theme: Theme, accent: AccentColor) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Notifie tous les écouteurs
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener(this.currentTheme, this.currentAccent);
    });
  }

  /**
   * Retourne les couleurs d'accent disponibles
   */
  getAccentColors(): Record<AccentColor, string> {
    return ThemeManager.ACCENT_COLORS;
  }

  /**
   * Bascule le thème (dark/light)
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Détecte le thème système
   */
  getSystemTheme(): 'dark' | 'light' {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * Applique le thème système
   */
  applySystemTheme(): void {
    this.setTheme('auto');
  }
}

/**
 * Hook React pour utiliser le gestionnaire de thème
 */
import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [config, setConfig] = useState<ThemeConfig>(() => 
    ThemeManager.getInstance().getConfig()
  );

  useEffect(() => {
    const themeManager = ThemeManager.getInstance();
    
    const handleThemeChange = (theme: Theme, accent: AccentColor) => {
      setConfig(themeManager.getConfig());
    };

    themeManager.addListener(handleThemeChange);

    // Écouter les changements de thème système
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (themeManager.getTheme() === 'auto') {
        handleThemeChange(themeManager.getTheme(), themeManager.getAccentColor());
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      themeManager.removeListener(handleThemeChange);
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  const themeManager = ThemeManager.getInstance();

  return {
    ...config,
    setTheme: (theme: Theme) => themeManager.setTheme(theme),
    setAccentColor: (color: AccentColor) => themeManager.setAccentColor(color),
    setThemeConfig: (config: Partial<ThemeConfig>) => themeManager.setThemeConfig(config),
    toggleTheme: () => themeManager.toggleTheme(),
    applySystemTheme: () => themeManager.applySystemTheme(),
    getSystemTheme: () => themeManager.getSystemTheme(),
    getAccentColors: () => themeManager.getAccentColors()
  };
};
