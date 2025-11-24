import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { PatientDataService } from '../../services/patient-data.service';

@Component({
  selector: 'app-general-data',
  standalone: true,
  imports: [],
  templateUrl: './general-data.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralDataComponent {
  private patientDataService = inject(PatientDataService);
  patient = this.patientDataService.getPatientData();

  calculationBasis = signal(this.patient().gestationalCalculator.officialCalculationBasis);

  // Dummy calculated values for display
  dumResult = computed(() => ({
    dpp: '27 de Agosto de 2024',
    ig: '32 Semanas e 0 Dias'
  }));

  usgResult = computed(() => ({
    dpp: '25 de Agosto de 2024',
    ig: '32 Semanas e 2 Dias'
  }));

  setCalculationBasis(basis: 'DUM' | 'USG') {
    this.calculationBasis.set(basis);
    // In a real app, you would also update the patient data signal
    // this.patient.update(p => ({ ...p, gestationalCalculator: { ...p.gestationalCalculator, officialCalculationBasis: basis } }));
  }
}
