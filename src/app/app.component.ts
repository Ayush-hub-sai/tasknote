import { Component } from '@angular/core';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard.component';
import { RouterOutlet } from "../../node_modules/@angular/router/router_module.d-Bx9ArA6K";

@Component({
  selector: 'app-root',
  imports: [DashboardComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'TaskNote';
}
