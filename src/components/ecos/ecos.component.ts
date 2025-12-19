import { Component, ChangeDetectionStrategy, inject, signal, AfterViewInit, ElementRef, viewChild, OnDestroy, effect } from '@angular/core';
import { PatientDataService, EcoData } from '../../services/patient-data.service';
import { D3Service } from '../../services/d3.service';
import * as d3 from 'd3';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ecos',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  providers: [D3Service],
  templateUrl: './ecos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EcosComponent implements AfterViewInit, OnDestroy {
  private patientDataService = inject(PatientDataService);
  private d3Service = inject(D3Service);

  patient = this.patientDataService.getPatientData();
  
  // State management signals
  isModalOpen = signal(false);
  editingEco = signal<EcoData | null>(null);
  ecoToDelete = signal<EcoData | null>(null);

  growthChart = viewChild.required<ElementRef>('growthChart');

  // Form for adding/editing ECOs
  ecoForm = new FormGroup({
    date: new FormControl('', Validators.required),
    gestationalAge: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    estimatedFetalWeight: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    fetalHeartRate: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    placentaPresentation: new FormControl(''),
    // These are extra fields from the modal that are not in the EcoData interface yet
    // For now, they are just for show in the UI.
    abdominalCircumference: new FormControl<number | null>(null),
    amnioticFluidIndex: new FormControl<number | null>(null),
    presentation: new FormControl('Cefálica'),
    observations: new FormControl(''),
  });

  constructor() {
    // Effect to re-render the chart whenever the patient's ECO data changes
    effect(() => {
      const patientData = this.patient();
      // This effect runs once initially, but ngAfterViewInit might not have run yet.
      // So we check if the viewChild is ready.
      if (this.growthChart()) {
         this.renderChart(patientData.ecos, patientData.fetalGrowthPercentiles);
      }
    });
  }

  ngAfterViewInit(): void {
    // Initial chart render
    this.renderChart(this.patient().ecos, this.patient().fetalGrowthPercentiles);
  }

  ngOnDestroy(): void {
    // Clean up the D3 tooltip to prevent memory leaks
    d3.select('.d3-tooltip').remove();
  }

  private renderChart(ecos: EcoData[], percentiles: any[]): void {
    const chartEl = this.growthChart().nativeElement;
    if (chartEl) {
      this.d3Service.createGrowthChart(chartEl, ecos, percentiles);
    }
  }

  openModal(eco: EcoData | null = null): void {
    if (eco) {
      this.editingEco.set(eco);
      this.ecoForm.patchValue({
        ...eco,
        presentation: 'Cefálica', // default as it is not in the model
        abdominalCircumference: null,
        amnioticFluidIndex: null,
        observations: eco.placentaPresentation,
      });
    } else {
      this.editingEco.set(null);
      this.ecoForm.reset({ presentation: 'Cefálica'});
    }
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveEco(): void {
    if (this.ecoForm.invalid) {
      this.ecoForm.markAllAsTouched();
      return;
    }

    const formValue = this.ecoForm.value;
    const ecoData = {
      date: formValue.date!,
      gestationalAge: formValue.gestationalAge!,
      estimatedFetalWeight: formValue.estimatedFetalWeight!,
      fetalHeartRate: formValue.fetalHeartRate!,
      placentaPresentation: `${formValue.presentation}, ${formValue.observations}`
    };

    const currentEco = this.editingEco();
    if (currentEco) {
      this.patientDataService.updateEco({ ...currentEco, ...ecoData });
    } else {
      this.patientDataService.addEco(ecoData);
    }

    this.closeModal();
  }
  
  // --- Delete ECO Methods ---
  requestDeleteEco(eco: EcoData): void {
    this.ecoToDelete.set(eco);
  }

  confirmDeleteEco(): void {
    const eco = this.ecoToDelete();
    if (eco) {
      this.patientDataService.deleteEco(eco.id);
    }
    this.cancelDeleteEco();
  }

  cancelDeleteEco(): void {
    this.ecoToDelete.set(null);
  }
}