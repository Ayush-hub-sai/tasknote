import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ThemeService, Theme } from '../../../core/services/theme/theme.service';

interface ThemeOption {
  key: Theme;
  name: string;
  description: string;
}

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.scss']
})
export class ThemeSwitcherComponent {
  currentTheme = computed(() => this.themeService.getCurrentTheme());

  themes = computed<ThemeOption[]>(() => {
    const allThemes = this.themeService.getAllThemes();
    return allThemes.map((key: Theme) => ({
      key,
      ...this.themeService.themes[key]
    }));
  });

  constructor(private themeService: ThemeService) {}

  setTheme(theme: Theme) {
    this.themeService.setTheme(theme);
  }
}