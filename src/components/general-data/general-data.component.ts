import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
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
export class GeneralDataComponent implements OnInit {
  private patientDataService = inject(PatientDataService);
  
  patient = this.patientDataService.getPatientData();
  
  isPatientInfoEditing = signal(false);
  isCalculatorEditing = signal(false);
  isHistoryModalOpen = signal(false);
  editingHistoryIndex = signal<number | null>(null);
  historyToDelete = signal<number | null>(null); // For custom confirm modal

  // --- Form Initializations ---
  // Initialize forms as class properties to ensure injection context for `toSignal`.
  
  patientInfoForm = new FormGroup({
    name: new FormControl('', Validators.required),
    age: new FormControl(null),
    profession: new FormControl(''),
    contact: new FormGroup({
      phone: new FormControl(''),
      email: new FormControl('', [Validators.email])
    }),
    address: new FormControl(''),
    parity: new FormGroup({
      gestations: new FormControl(null),
      parities: new FormControl(null),
      abortions: new FormControl(null)
    }),
    allergies: new FormControl(''),
    medicationsInUse: new FormControl(''),
    chronicDiseases: new FormControl(''),
  });

  calculatorForm = new FormGroup({
    dum: new FormControl('', Validators.required),
    dumIsReliable: new FormControl(false),
    firstUltrasoundDate: new FormControl('', Validators.required),
    firstUltrasoundGA: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d+s\s\d+d$/) // e.g., "8s 1d"
    ]),
  });
  
  // Create a signal from the form's value changes for real-time preview.
  // This is now a property initializer and runs in the correct injection context.
  calculatorFormValues = toSignal(this.calculatorForm.valueChanges.pipe(
    startWith(this.calculatorForm.value)
  ));

  historyForm = new FormGroup({
    babyName: new FormControl('', Validators.required),
    gestationalAgeAtBirth: new FormControl('', Validators.required),
    babyWeight: new FormControl('', Validators.required),
    deliveryType: new FormControl('Parto Normal', Validators.required)
  });


  calculationBasis = computed(() => this.patient().gestationalCalculator.officialCalculationBasis);

  private calculateGestationalData(startDate: Date): { dpp: string; ig: string } {
    if (!startDate || isNaN(startDate.getTime())) {
      return { dpp: 'N/A', ig: 'N/A' };
    }

    const dpp = new Date(startDate.getTime());
    dpp.setDate(dpp.getDate() + 280); // 40 weeks

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

  // --- Saved Data Computations ---
  dumResult = computed(() => {
    const dumDate = new Date(this.patient().gestationalCalculator.dum + 'T00:00:00');
    return this.calculateGestationalData(dumDate);
  });

  usgResult = computed(() => {
    const usgData = this.patient().gestationalCalculator;
    if (!usgData.firstUltrasoundDate || !usgData.firstUltrasoundGA) {
      return { dpp: 'N/A', ig: 'N/A' };
    }
    
    const gaParts = usgData.firstUltrasoundGA.match(/(\d+)s.*?(\d+)d/);
    if (!gaParts) return { dpp: 'N/A', ig: 'N/A' };

    const weeks = parseInt(gaParts[1], 10);
    const days = parseInt(gaParts[2], 10);
    const totalDaysGA = (weeks * 7) + days;

    const usgDate = new Date(usgData.firstUltrasoundDate + 'T00:00:00');
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
    if (!formValues?.firstUltrasoundDate || !formValues?.firstUltrasoundGA) {
      return { dpp: 'N/A', ig: 'N/A' };
    }

    const gaParts = formValues.firstUltrasoundGA.match(/(\d+)s.*?(\d+)d/);
    if (!gaParts) return { dpp: 'N/A', ig: 'N/A' };

    const weeks = parseInt(gaParts[1], 10);
    const days = parseInt(gaParts[2], 10);
    const totalDaysGA = (weeks * 7) + days;

    const usgDate = new Date(formValues.firstUltrasoundDate + 'T00:00:00');
    const startDate = new Date(usgDate.getTime());
    startDate.setDate(startDate.getDate() - totalDaysGA);

    return this.calculateGestationalData(startDate);
  });


  ngOnInit(): void {
    this.patchFormsWithPatientData();
  }

  private patchFormsWithPatientData(): void {
    const p = this.patient();
    this.patientInfoForm.patchValue(p);
    this.calculatorForm.patchValue(p.gestationalCalculator);
  }

  // --- Patient Info Edit Methods ---
  enablePatientInfoEdit(): void {
    this.patientInfoForm.patchValue(this.patient());
    this.isPatientInfoEditing.set(true);
  }

  cancelPatientInfoEdit(): void {
    this.isPatientInfoEditing.set(false);
  }

  savePatientInfo(): void {
    if (this.patientInfoForm.invalid) {
      this.patientInfoForm.markAllAsTouched();
      return;
    }
    this.patientDataService.updatePatient(this.patientInfoForm.value as Partial<Patient>);
    this.isPatientInfoEditing.set(false);
  }

  // --- Calculator Edit Methods ---
  enableCalculatorEdit(): void {
    this.calculatorForm.patchValue(this.patient().gestationalCalculator);
    this.isCalculatorEditing.set(true);
  }

  cancelCalculatorEdit(): void {
    this.isCalculatorEditing.set(false);
  }

  saveCalculator(): void {
    if (this.calculatorForm.invalid) {
      this.calculatorForm.markAllAsTouched();
      return;
    }
    this.patientDataService.updatePatient({
      gestationalCalculator: this.calculatorForm.value
    });
    this.isCalculatorEditing.set(false);
  }

  setCalculationBasis(basis: 'DUM' | 'USG') {
    this.patientDataService.updatePatient({
      gestationalCalculator: { ...this.patient().gestationalCalculator, officialCalculationBasis: basis }
    });
  }

  // --- History Modal Methods ---
  openHistoryModal(): void {
    this.editingHistoryIndex.set(null);
    this.historyForm.reset({ deliveryType: 'Parto Normal' });
    this.isHistoryModalOpen.set(true);
  }

  closeHistoryModal(): void {
    this.isHistoryModalOpen.set(false);
    this.editingHistoryIndex.set(null);
  }

  saveHistory(): void {
    if (this.historyForm.invalid) {
      this.historyForm.markAllAsTouched();
      return;
    }

    const historyData = this.historyForm.value as ObstetricHistory;
    const index = this.editingHistoryIndex();

    if (index !== null) {
      this.patientDataService.updateObstetricHistory(index, historyData);
    } else {
      this.patientDataService.addObstetricHistory(historyData);
    }
    
    this.closeHistoryModal();
  }

  editHistory(index: number): void {
    const historyItem = this.patient().obstetricHistory[index];
    if (historyItem) {
      this.editingHistoryIndex.set(index);
      this.historyForm.patchValue(historyItem);
      this.isHistoryModalOpen.set(true);
    }
  }

  // --- Delete History Methods ---
  requestDeleteHistory(index: number): void {
    this.historyToDelete.set(index);
  }
  
  confirmDeleteHistory(): void {
    const index = this.historyToDelete();
    if (index !== null) {
      this.patientDataService.deleteObstetricHistory(index);
    }
    this.cancelDeleteHistory();
  }
  
  cancelDeleteHistory(): void {
    this.historyToDelete.set(null);
  }
}