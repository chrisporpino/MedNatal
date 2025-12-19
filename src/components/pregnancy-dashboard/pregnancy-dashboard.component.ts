import { Component, ChangeDetectionStrategy, inject, AfterViewInit, ElementRef, viewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PatientDataService } from '../../services/patient-data.service';
import { D3Service } from '../../services/d3.service';

@Component({
  selector: 'app-pregnancy-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pregnancy-dashboard.component.html',
  providers: [D3Service],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PregnancyDashboardComponent implements AfterViewInit {
  private patientDataService = inject(PatientDataService);
  private d3Service = inject(D3Service);

  patient = this.patientDataService.getPatientData();

  weightChart = viewChild<ElementRef>('weightChart');
  uterineHeightChart = viewChild<ElementRef>('uterineHeightChart');

  chartsRendered = signal(false);

  ngAfterViewInit(): void {
    // We use a small timeout to ensure the view is fully initialized
    // before trying to render the D3 charts.
    setTimeout(() => this.renderCharts(), 0);
  }

  renderCharts() {
    if (this.chartsRendered()) return;

    const weightChartEl = this.weightChart();
    if (weightChartEl) {
      this.d3Service.createLineChart(
        weightChartEl.nativeElement,
        this.patient().maternalWeightData,
        'week',
        'weight',
        '#0d9488' // teal-600
      );
    }
    
    const uterineHeightChartEl = this.uterineHeightChart();
    if (uterineHeightChartEl) {
      this.d3Service.createLineChart(
        uterineHeightChartEl.nativeElement,
        this.patient().uterineHeightData,
        'week',
        'height',
        '#22d3ee' // cyan-400
      );
    }

    this.chartsRendered.set(true);
  }

  togglePendingItem(itemId: number): void {
    this.patientDataService.togglePendingItemStatus(itemId);
  }
}