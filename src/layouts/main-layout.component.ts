import { Component, ChangeDetectionStrategy, signal, inject, viewChild, ElementRef } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, RouterLink } from '@angular/router';
import { LeftNavComponent } from '../components/left-nav/left-nav.component';
import { PatientContextComponent } from '../components/patient-context/patient-context.component';
import { HeaderComponent } from '../components/header/header.component';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    LeftNavComponent,
    PatientContextComponent,
    RouterOutlet,
    HeaderComponent,
    RouterLink
  ],
})
export class MainLayoutComponent {
  isNavCollapsed = signal(true);
  isPatientContextVisible = signal(false);

  private router = inject(Router);
  
  scrollableContent = viewChild.required<ElementRef>('scrollableContent');

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Show patient context only on patient-specific pages, hide on global pages like patient-list
      if (event.urlAfterRedirects.includes('/pacientes')) {
        this.isPatientContextVisible.set(false);
      } else {
        this.isPatientContextVisible.set(true);
      }
      
      // Reset scroll position on navigation
      try {
        this.scrollableContent().nativeElement.scrollTop = 0;
      } catch (err) {
        console.error('Could not reset scroll position:', err);
      }
    });
  }

  toggleNav(): void {
    this.isNavCollapsed.update(collapsed => !collapsed);
  }
}
