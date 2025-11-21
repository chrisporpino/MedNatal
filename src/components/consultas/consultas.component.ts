import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { PatientDataService } from '../../services/patient-data.service';

@Component({
  selector: 'app-consultas',
  standalone: true,
  imports: [],
  templateUrl: './consultas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsultasComponent {
  private patientDataService = inject(PatientDataService);
  patient = this.patientDataService.getPatientData();

  consultas = computed(() => this.patient().consultas);

  expandedConsultaId = signal<number | null>(null);
  isSidePanelOpen = signal(false);

  toggleConsulta(id: number) {
    this.expandedConsultaId.update(currentId => (currentId === id ? null : id));
  }

  openSidePanel() {
    this.isSidePanelOpen.set(true);
  }

  closeSidePanel() {
    this.isSidePanelOpen.set(false);
  }
}