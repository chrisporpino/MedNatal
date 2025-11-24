import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { PatientDataService, Exam } from '../../services/patient-data.service';

@Component({
  selector: 'app-exames',
  standalone: true,
  imports: [],
  templateUrl: './exames.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamsComponent {
  private patientDataService = inject(PatientDataService);
  patient = this.patientDataService.getPatientData();

  isUploadModalOpen = signal(false);
  
  exams = computed(() => this.patient().exams);
  alert = computed(() => this.patient().examAlert);

  openUploadModal() {
    this.isUploadModalOpen.set(true);
  }

  closeUploadModal() {
    this.isUploadModalOpen.set(false);
  }

  getStatusClass(status: 'Normal' | 'Alterado' | 'Pendente'): string {
    switch (status) {
      case 'Normal':
        return 'bg-green-100 text-green-800';
      case 'Alterado':
        return 'bg-red-100 text-red-800';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
