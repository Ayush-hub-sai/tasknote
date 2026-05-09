import { Injectable, signal } from '@angular/core';

export type Theme = 'obsidian-dark' | 'arctic-light' | 'solar-warm' | 'forest-deep' | 'neon-synthwave';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme = signal<Theme>('obsidian-dark');

  themes: Record<Theme, { name: string; description: string }> = {
    'obsidian-dark': { name: 'Obsidian Dark', description: 'Deep blacks, neon cyan accents, glass cards' },
    'arctic-light': { name: 'Arctic Light', description: 'Pure whites, frost blur, soft blue shadows' },
    'solar-warm': { name: 'Solar Warm', description: 'Amber gradients, warm neutrals, tan accents' },
    'forest-deep': { name: 'Forest Deep', description: 'Dark greens, moss tones, earthy textures' },
    'neon-synthwave': { name: 'Neon Synthwave', description: 'Purple/pink gradients, glowing borders, retro grid' }
  };

  constructor() {
    const savedTheme = localStorage.getItem('tasknote-theme') as Theme | null;
    if (savedTheme && Object.prototype.hasOwnProperty.call(this.themes, savedTheme)) {
      this.currentTheme.set(savedTheme);
      this.applyTheme(savedTheme);
    } else {
      this.applyTheme(this.currentTheme());
    }
  }

  getCurrentTheme() {
    return this.currentTheme();
  }

  setTheme(theme: Theme) {
    this.currentTheme.set(theme);
    localStorage.setItem('tasknote-theme', theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme) {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    // CSS variables are defined via the imported theme styles
  }

  getAllThemes() {
    return Object.keys(this.themes) as Theme[];
  }
}