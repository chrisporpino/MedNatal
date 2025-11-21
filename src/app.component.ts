import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LeftNavComponent } from './components/left-nav/left-nav.component';
import { PatientContextComponent } from './components/patient-context/patient-context.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    LeftNavComponent,
    PatientContextComponent,
    RouterOutlet
  ],
})
export class AppComponent {
  isNavCollapsed = signal(false);

  toggleNav(): void {
    this.isNavCollapsed.update(collapsed => !collapsed);
  }
}