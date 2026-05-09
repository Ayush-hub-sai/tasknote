import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ThemeSwitcherComponent } from '../../../settings/theme-switcher/theme-switcher.component';

@Component({
  selector: 'app-theme-page',
  standalone: true,
  imports: [MatCardModule, MatIconModule, ThemeSwitcherComponent],
  templateUrl: './theme-page.component.html',
  styleUrls: ['./theme-page.component.scss']
})
export class ThemePageComponent {}
