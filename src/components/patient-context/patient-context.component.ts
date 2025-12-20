import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PatientDataService } from '../../services/patient-data.service';

interface ContextNavItem {
  label: string;
  path: string;
}

@Component({
  selector: 'app-patient-context',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './patient-context.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientContextComponent {
  private patientDataService = inject(PatientDataService);
  patient = this.patientDataService.getCurrentPatient();

  contextNavItems = signal<ContextNavItem[]>([
    { label: 'Dashboard', path: 'dashboard' },
    { label: 'Dados Gerais', path: 'dados-gerais' },
    { label: 'Exames', path: 'exames' },
    { label: 'ECOs', path: 'ecos' },
    { label: 'Consultas', path: 'consultas' },
    { label: 'Parto', path: '#' },
  ]);
}