import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { PatientDataService, Patient, ObstetricHistory } from '../../services/patient-data.service';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-general-data',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './general-data.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralDataComponent {
  private patientDataService = inject(PatientDataService);
  
  patient = this.patientDataService.getCurrentPatient();
  
  isPatientInfoEditing = signal(false);
  isCalculatorEditing = signal(false);
  isHistoryModalOpen = signal(false);
  editingHistoryIndex = signal<number | null>(null);
  historyToDelete = signal<number | null>(null);

  patientInfoForm = new FormGroup({
    name: new FormControl('', Validators.required),
    birth_date: new FormControl(''),
    profession: new FormControl(''),
    phone: new FormControl(''),
    email: new FormControl('', [Validators.email]),
    address: new FormControl(''),
    parity: new FormGroup({
      gestations: new FormControl(null),
      parities: new FormControl(null),
      abortions: new FormControl(null)
    }),
    allergies: new FormControl(''),
    medications_in_use: new FormControl(''),
    chronic_diseases: new FormControl(''),
  });

  calculatorForm = new FormGroup({
    dum: new FormControl('', Validators.required),
    dum_is_reliable: new FormControl(false),
    first_ultrasound_date: new FormControl('', Validators.required),
    first_ultrasound_ga: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d+s\s\d+d$/) // e.g., "8s 1d"
    ]),
  });
  
  calculatorFormValues = toSignal(this.calculatorForm.valueChanges.pipe(
    startWith(this.calculatorForm.value)
  ));

  historyForm = new FormGroup({
    baby_name: new FormControl('', Validators.required),
    gestational_age_at_birth: new FormControl('', Validators.required),
    baby_weight: new FormControl('', Validators.required),
    delivery_type: new FormControl('Parto Normal', Validators.required)
  });

  constructor() {
    effect(() => {
      const p = this.patient();
      if (p) {
        this.patchFormsWithPatientData(p);
      }
    });
  }

  private patchFormsWithPatientData(p: Patient): void {
    this.patientInfoForm.patchValue({
        name: p.name,
        birth_date: p.birth_date,
        profession: p.profession,
        phone: p.phone,
        email: p.email,
        address: p.address,
        parity: p.parity,
        allergies: p.allergies,
        medications_in_use: p.medications_in_use,
        chronic_diseases: p.chronic_diseases
    });
    this.calculatorForm.patchValue(p.gestational_calculator);
  }
  
  private calculateGestationalData(startDate: Date): { dpp: string; ig: string } {
    if (!startDate || isNaN(startDate.getTime())) {
      return { dpp: 'N/A', ig: 'N/A' };
    }

    const dpp = new Date(startDate.getTime());
    dpp.setDate(dpp.getDate() + 280); 

    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;

    return {
      dpp: dpp.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
      ig: `${weeks} Semanas e ${days} Dias`
    };
  }

  // --- Computations ---
  calculationBasis = computed(() => this.patient()?.gestational_calculator.official_calculation_basis);

  dumResult = computed(() => {
    const dum = this.patient()?.gestational_calculator.dum;
    if (!dum) return { dpp: 'N/A', ig: 'N/A' };
    const dumDate = new Date(dum + 'T00:00:00');
    return this.calculateGestationalData(dumDate);
  });

  usgResult = computed(() => {
    const usgData = this.patient()?.gestational_calculator;
    if (!usgData?.first_ultrasound_date || !usgData?.first_ultrasound_ga) {
      return { dpp: 'N/A', ig: 'N/A' };
    }
    
    const gaParts = usgData.first_ultrasound_ga.match(/(\d+)s.*?(\d+)d/);
    if (!gaParts) return { dpp: 'N/A', ig: 'N/A' };

    const weeks = parseInt(gaParts[1], 10);
    const days = parseInt(gaParts[2], 10);
    const totalDaysGA = (weeks * 7) + days;

    const usgDate = new Date(usgData.first_ultrasound_date + 'T00:00:00');
    const startDate = new Date(usgDate.getTime());
    startDate.setDate(startDate.getDate() - totalDaysGA);

    return this.calculateGestationalData(startDate);
  });

  // --- Real-time Preview Computations ---
  dumPreviewResult = computed(() => {
    const formValues = this.calculatorFormValues();
    if (!formValues?.dum) return { dpp: 'N/A', ig: 'N/A' };
    const dumDate = new Date(formValues.dum + 'T00:00:00');
    return this.calculateGestationalData(dumDate);
  });

  usgPreviewResult = computed(() => {
    const formValues = this.calculatorFormValues();
    if (!formValues?.first_ultrasound_date || !formValues?.first_ultrasound_ga) {
      return { dpp: 'N/A', ig: 'N/A' };
    }

    const gaParts = formValues.first_ultrasound_ga.match(/(\d+)s.*?(\d+)d/);
    if (!gaParts) return { dpp: 'N/A', ig: 'N/A' };

    const weeks = parseInt(gaParts[1], 10);
    const days = parseInt(gaParts[2], 10);
    const totalDaysGA = (weeks * 7) + days;

    const usgDate = new Date(formValues.first_ultrasound_date + 'T00:00:00');
    const startDate = new Date(usgDate.getTime());
    startDate.setDate(startDate.getDate() - totalDaysGA);

    return this.calculateGestationalData(startDate);
  });


  // --- Edit Methods ---
  enablePatientInfoEdit(): void {
    if (this.patient()) {
        this.patchFormsWithPatientData(this.patient()!);
        this.isPatientInfoEditing.set(true);
    }
  }

  cancelPatientInfoEdit(): void {
    this.isPatientInfoEditing.set(false);
  }

  async savePatientInfo(): Promise<void> {
    if (this.patientInfoForm.invalid || !this.patient()) return;
    await this.patientDataService.updatePatient(this.patient()!.id, this.patientInfoForm.value);
    this.isPatientInfoEditing.set(false);
  }

  enableCalculatorEdit(): void {
    if(this.patient()) {
        this.calculatorForm.patchValue(this.patient()!.gestational_calculator);
        this.isCalculatorEditing.set(true);
    }
  }

  cancelCalculatorEdit(): void {
    this.isCalculatorEditing.set(false);
  }

  async saveCalculator(): Promise<void> {
    if (this.calculatorForm.invalid || !this.patient()) return;
    await this.patientDataService.updatePatient(this.patient()!.id, {
      gestational_calculator: this.calculatorForm.value
    });
    this.isCalculatorEditing.set(false);
  }

  async setCalculationBasis(basis: 'DUM' | 'USG'): Promise<void> {
    if (!this.patient()) return;
    await this.patientDataService.updatePatient(this.patient()!.id, {
        gestational_calculator: { 
            ...this.patient()!.gestational_calculator, 
            official_calculation_basis: basis 
        }
    });
  }

  // --- History Modal Methods ---
  openHistoryModal(): void {
    this.editingHistoryIndex.set(null);
    this.historyForm.reset({ delivery_type: 'Parto Normal' });
    this.isHistoryModalOpen.set(true);
  }

  closeHistoryModal(): void {
    this.isHistoryModalOpen.set(false);
    this.editingHistoryIndex.set(null);
  }

  saveHistory(): void {
    if (this.historyForm.invalid) return;
    // TODO: Implement Supabase call for add/update history
    console.log("Saving history", this.historyForm.value);
    this.closeHistoryModal();
  }

  editHistory(index: number): void {
    const historyItem = this.patient()?.obstetric_histories[index];
    if (historyItem) {
      this.editingHistoryIndex.set(index);
      this.historyForm.patchValue(historyItem);
      this.isHistoryModalOpen.set(true);
    }
  }

  requestDeleteHistory(index: number): void {
    this.historyToDelete.set(index);
  }
  
  confirmDeleteHistory(): void {
    const index = this.historyToDelete();
    if (index !== null) {
      // TODO: Implement Supabase call for delete
      console.log("Deleting history at index", index);
    }
    this.cancelDeleteHistory();
  }
  
  cancelDeleteHistory(): void {
    this.historyToDelete.set(null);
  }
}