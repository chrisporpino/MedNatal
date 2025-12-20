import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { LeftNavComponent } from './components/left-nav/left-nav.component';
import { PatientContextComponent } from './components/patient-context/patient-context.component';
import { HeaderComponent } from './components/header/header.component';
import { PatientDataService } from './services/patient-data.service';

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
  private patientDataService = inject(PatientDataService);

  isNavCollapsed = signal(true);
  isPatientContextVisible = computed(() => !!this.patientDataService.getCurrentPatient()());

  toggleNav(): void {
    this.isNavCollapsed.update(collapsed => !collapsed);
  }
}