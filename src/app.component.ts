import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, RouterLink } from '@angular/router';
import { LeftNavComponent } from './components/left-nav/left-nav.component';
import { PatientContextComponent } from './components/patient-context/patient-context.component';
import { HeaderComponent } from './components/header/header.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    LeftNavComponent,
    PatientContextComponent,
    RouterOutlet,
    HeaderComponent,
    RouterLink
  ],
})
export class AppComponent {
  isNavCollapsed = signal(true);
  isPatientContextVisible = signal(false);

  private router = inject(Router);

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Show patient context only on patient-specific pages, hide on global pages like patient-list
      if (event.urlAfterRedirects.startsWith('/pacientes')) {
        this.isPatientContextVisible.set(false);
      } else {
        this.isPatientContextVisible.set(true);
      }
    });
  }

  toggleNav(): void {
    this.isNavCollapsed.update(collapsed => !collapsed);
  }
}