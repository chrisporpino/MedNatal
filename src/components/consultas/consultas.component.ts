import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { PatientDataService, Consulta } from '../../services/patient-data.service';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-consultas',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './consultas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsultasComponent {
  private patientDataService = inject(PatientDataService);
  private toastService = inject(ToastService);
  patient = this.patientDataService.getPatientData();

  consultas = computed(() => this.patient().consultas);

  // State management signals
  expandedConsultaId = signal<number | null>(null);
  isSidePanelOpen = signal(false);
  editingConsulta = signal<Consulta | null>(null);
  consultaToDelete = signal<Consulta | null>(null);
  isSaving = signal(false);

  // Form for adding/editing consultas
  consultaForm = new FormGroup({
    date: new FormControl('', Validators.required),
    weight: new FormControl<number | null>(null, Validators.required),
    bloodPressure: new FormControl('', [Validators.required, Validators.pattern(/^\d{2,3}\/\d{2,3}$/)]),
    uterineHeight: new FormControl<number | null>(null, Validators.required),
    fetalHeartRate: new FormControl<number | null>(null, Validators.required),
    fetalMovements: new FormControl<'Presente' | 'Ausente'>('Presente', Validators.required),
    notes: new FormControl(''),
  });

  toggleConsulta(id: number) {
    this.expandedConsultaId.update(currentId => (currentId === id ? null : id));
  }

  openSidePanel(consulta: Consulta | null = null) {
    if (consulta) {
      this.editingConsulta.set(consulta);
      this.consultaForm.patchValue({
        date: consulta.date,
        weight: parseFloat(consulta.details.weight.replace(' kg', '')),
        bloodPressure: consulta.details.bloodPressure.replace(' mmHg', ''),
        uterineHeight: consulta.details.uterineHeight,
        fetalHeartRate: consulta.details.fetalHeartRate,
        fetalMovements: consulta.details.fetalMovements,
        notes: consulta.notes,
      });
    } else {
      this.editingConsulta.set(null);
      this.consultaForm.reset({
        date: new Date().toISOString().split('T')[0], // Today's date
        fetalMovements: 'Presente'
      });
    }
    this.isSidePanelOpen.set(true);
  }

  closeSidePanel() {
    this.isSidePanelOpen.set(false);
  }

  saveConsulta() {
    if (this.consultaForm.invalid) {
      this.consultaForm.markAllAsTouched();
      return;
    }
    
    this.isSaving.set(true);

    setTimeout(() => {
      const formValue = this.consultaForm.value;
      const currentConsulta = this.editingConsulta();
      const allConsultas = this.consultas();
      const previousConsulta = allConsultas.length > 0 ? allConsultas[0] : null;
      const previousWeight = previousConsulta ? parseFloat(previousConsulta.details.weight) : formValue.weight!;
      const weightChange = (formValue.weight! - previousWeight).toFixed(1);

      const consultaData: Omit<Consulta, 'id'> = {
        date: formValue.date!,
        gestationalAge: `IG ${this.patient().gestationalAge.weeks} Semanas e ${this.patient().gestationalAge.days} Dias`, // Example, should be calculated based on date
        summary: {
          fetalHeartRate: formValue.fetalHeartRate!,
          bloodPressure: formValue.bloodPressure!,
          weightChange: `${weightChange.startsWith('-') ? '' : '+'}${weightChange} kg`
        },
        details: {
          weight: `${formValue.weight} kg`,
          bloodPressure: `${formValue.bloodPressure} mmHg`,
          uterineHeight: formValue.uterineHeight!,
          fetalHeartRate: formValue.fetalHeartRate!,
          fetalMovements: formValue.fetalMovements!,
        },
        notes: formValue.notes!
      };
      
      if (currentConsulta) {
        this.patientDataService.updateConsulta({ ...consultaData, id: currentConsulta.id });
      } else {
        this.patientDataService.addConsulta(consultaData);
      }
      
      this.toastService.show('Consulta Salva!', 'O registro da consulta foi salvo com sucesso.');
      this.isSaving.set(false);
      this.closeSidePanel();
    }, 800);
  }
  
  // --- Delete Methods ---
  requestDeleteConsulta(consulta: Consulta) {
    this.consultaToDelete.set(consulta);
  }

  confirmDeleteConsulta() {
    const consulta = this.consultaToDelete();
    if (consulta) {
      this.patientDataService.deleteConsulta(consulta.id);
      this.toastService.show('Exclusão Concluída', `A consulta de ${new Date(consulta.date + 'T00:00:00').toLocaleDateString('pt-BR')} foi removida.`, 'success');
    }
    this.cancelDeleteConsulta();
  }

  cancelDeleteConsulta() {
    this.consultaToDelete.set(null);
  }
}