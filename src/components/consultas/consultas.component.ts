import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { PatientDataService } from '../../services/patient-data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consultas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consultas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsultasComponent {
  private patientDataService = inject(PatientDataService);
  patient = this.patientDataService.getCurrentPatient();

  consultas = computed(() => this.patient()?.consultas ?? []);

  expandedConsultaId = signal<string | null>(null);
  isSidePanelOpen = signal(false);

  toggleConsulta(id: string) {
    this.expandedConsultaId.update(currentId => (currentId === id ? null : id));
  }

  openSidePanel() {
    this.isSidePanelOpen.set(true);
  }

  closeSidePanel() {
    this.isSidePanelOpen.set(false);
  }
}