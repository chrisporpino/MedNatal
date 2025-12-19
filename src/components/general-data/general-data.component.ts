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
  historyToDelete = signal<number | null>(null); 

  patientInfoForm = new FormGroup({
    name: new FormControl('', Validators.required),
    id: new FormControl({ value: '', disabled: true }),
    age: new FormControl<number | null>(null),
    profession: new FormControl(''),
    contact: new FormGroup({
      phone: new FormControl(''),
      email: new FormControl('', [Validators.email])
    }),
    address: new FormControl(''),
    parity: new FormGroup({
      gestations: new FormControl<number | null>(null),
      parities: new FormControl<number | null>(null),
      abortions: new FormControl<number | null>(null)
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
      Validators.pattern(/^\d+s\s\d+d$/)
    ]),
  });
  
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

  private calculateGestationalData(startDate: Date): { dpp: string; ig: string; weeks: number; days: number } {
    if (!startDate || isNaN(startDate.getTime())) {
      return { dpp: 'N/A', ig: 'N/A', weeks: 0, days: 0 };
    }
    const today = new Date();
    const { weeks, days } = this.patientDataService.calculateGestationalAgeOnDate(startDate, today);
    const edd = this.patientDataService.calculateEdd(startDate);

    return {
      dpp: edd,
      ig: `${weeks} Semanas e ${days} Dias`,
      weeks,
      days
    };
  }

  private getStartDateFromUSG(usgDateStr: string, usgGaStr: string): Date | null {
    if (!usgDateStr || !usgGaStr) return null;
    const gaParts = usgGaStr.match(/(\d+)s.*?(\d+)d/);
    if (!gaParts) return null;
    const weeks = parseInt(gaParts[1], 10);
    const days = parseInt(gaParts[2], 10);
    const totalDaysGA = (weeks * 7) + days;
    const usgDate = new Date(usgDateStr + 'T00:00:00');
    const startDate = new Date(usgDate.getTime());
    startDate.setDate(startDate.getDate() - totalDaysGA);
    return startDate;
  }

  dumResult = computed(() => {
    const dumDate = new Date(this.patient().gestationalCalculator.dum + 'T00:00:00');
    return this.calculateGestationalData(dumDate);
  });

  usgResult = computed(() => {
    const { firstUltrasoundDate, firstUltrasoundGA } = this.patient().gestationalCalculator;
    const startDate = this.getStartDateFromUSG(firstUltrasoundDate, firstUltrasoundGA);
    return startDate ? this.calculateGestationalData(startDate) : { dpp: 'N/A', ig: 'N/A', weeks: 0, days: 0 };
  });

  dumPreviewResult = computed(() => {
    // FIX: Cast the unknown form values to a known type to resolve property access errors.
    const formValues = this.calculatorFormValues() as { dum?: string | null };
    if (!formValues?.dum) return { dpp: 'N/A', ig: 'N/A' };
    const dumDate = new Date(formValues.dum + 'T00:00:00');
    return this.calculateGestationalData(dumDate);
  });

  usgPreviewResult = computed(() => {
    // FIX: Cast the unknown form values and use nullish coalescing for safer property access.
    const formValues = this.calculatorFormValues() as { firstUltrasoundDate?: string | null; firstUltrasoundGA?: string | null; };
    const startDate = this.getStartDateFromUSG(formValues?.firstUltrasoundDate ?? '', formValues?.firstUltrasoundGA ?? '');
    return startDate ? this.calculateGestationalData(startDate) : { dpp: 'N/A', ig: 'N/A' };
  });

  ngOnInit(): void { this.patchFormsWithPatientData(); }

  private patchFormsWithPatientData(): void {
    const p = this.patient();
    this.patientInfoForm.patchValue({...p, id: this.formatCpf(p.id) });
    this.calculatorForm.patchValue(p.gestationalCalculator);
  }

  enablePatientInfoEdit(): void {
    this.patientInfoForm.patchValue({...this.patient(), id: this.formatCpf(this.patient().id) });
    this.isPatientInfoEditing.set(true);
  }
  cancelPatientInfoEdit(): void { this.isPatientInfoEditing.set(false); }

  savePatientInfo(): void {
    if (this.patientInfoForm.invalid) return;
    const formValue = this.patientInfoForm.getRawValue(); // Use getRawValue to include disabled fields like CPF
    this.patientDataService.updatePatient({ ...formValue, id: formValue.id?.replace(/\D/g, '') } as Partial<Patient>);
    this.isPatientInfoEditing.set(false);
  }

  enableCalculatorEdit(): void {
    this.calculatorForm.patchValue(this.patient().gestationalCalculator);
    this.isCalculatorEditing.set(true);
  }
  cancelCalculatorEdit(): void { this.isCalculatorEditing.set(false); }

  saveCalculator(): void {
    if (this.calculatorForm.invalid) return;
    const newCalculatorData = this.calculatorForm.value as Patient['gestationalCalculator'];
    this.patientDataService.updatePatient({ gestationalCalculator: { ...this.patient().gestationalCalculator, ...newCalculatorData } });
    this.updateOfficialPatientGA_EDD();
    this.isCalculatorEditing.set(false);
  }
  
  setCalculationBasis(basis: 'DUM' | 'USG') {
    this.patientDataService.updatePatient({ gestationalCalculator: { ...this.patient().gestationalCalculator, officialCalculationBasis: basis } });
    this.updateOfficialPatientGA_EDD();
  }

  private updateOfficialPatientGA_EDD() {
    const basis = this.patient().gestationalCalculator.officialCalculationBasis;
    const result = basis === 'DUM' ? this.dumResult() : this.usgResult();
    this.patientDataService.updatePatient({
      gestationalAge: { weeks: result.weeks, days: result.days },
      edd: result.dpp
    });
  }

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
    if (this.historyForm.invalid) return;
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

  requestDeleteHistory(index: number): void { this.historyToDelete.set(index); }
  confirmDeleteHistory(): void {
    const index = this.historyToDelete();
    if (index !== null) this.patientDataService.deleteObstetricHistory(index);
    this.cancelDeleteHistory();
  }
  cancelDeleteHistory(): void { this.historyToDelete.set(null); }
  
  // Input Formatters
  formatCpf(value: string): string {
    if (!value) return '';
    let cpf = value.replace(/\D/g, '');
    if (cpf.length > 11) cpf = cpf.substring(0, 11);
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return cpf;
  }

  formatPhone(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    this.patientInfoForm.get('contact.phone')?.setValue(value, { emitEvent: false });
  }

  onCpfInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = this.formatCpf(input.value);
    this.patientInfoForm.get('id')?.setValue(formatted, { emitEvent: false });
  }
}