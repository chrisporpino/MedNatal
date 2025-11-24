import { Component, ChangeDetectionStrategy, inject, signal, AfterViewInit, ElementRef, viewChild } from '@angular/core';
import { PatientDataService } from '../../services/patient-data.service';
import { D3Service } from '../../services/d3.service';

@Component({
  selector: 'app-ecos',
  standalone: true,
  imports: [],
  providers: [D3Service],
  templateUrl: './ecos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EcosComponent implements AfterViewInit {
  private patientDataService = inject(PatientDataService);
  private d3Service = inject(D3Service);

  patient = this.patientDataService.getPatientData();
  isModalOpen = signal(false);
  
  growthChart = viewChild<ElementRef>('growthChart');
  chartRendered = signal(false);

  ngAfterViewInit(): void {
    setTimeout(() => this.renderChart(), 0);
  }

  renderChart(): void {
    if (this.chartRendered()) return;

    const chartEl = this.growthChart();
    if (chartEl) {
      this.d3Service.createGrowthChart(
        chartEl.nativeElement,
        this.patient().ecos,
        this.patient().fetalGrowthPercentiles
      );
      this.chartRendered.set(true);
    }
  }

  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }
}