import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { PatientDataService, Exam } from '../../services/patient-data.service';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exames',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './exames.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamsComponent {
  private patientDataService = inject(PatientDataService);
  patient = this.patientDataService.getCurrentPatient();

  // Modal and state management signals
  isExamModalOpen = signal(false);
  editingExam = signal<Exam | null>(null);
  examToDelete = signal<Exam | null>(null);
  selectedFile = signal<File | null>(null);
  isAlertVisible = signal(true);

  // Filter signals
  searchTerm = signal('');
  selectedFilter = signal('Todos'); // 'Todos', '1', '2', '3'

  alert = computed(() => this.patient()?.examAlert);
  exams = computed(() => this.patient()?.exams ?? []);

  // Form for adding/editing exams
  examForm = new FormGroup({
    type: new FormControl('', Validators.required),
    date: new FormControl('', Validators.required),
    status: new FormControl<'Normal' | 'Alterado' | 'Pendente'>('Pendente', Validators.required),
    main_result: new FormControl(''),
    gestational_age_at_collection: new FormControl(''),
  });

  // Computed signal for filtered exams
  filteredExams = computed(() => {
    const allExams = this.exams();
    const term = this.searchTerm().toLowerCase();
    const filter = this.selectedFilter();

    let filtered = allExams;

    // Filter by trimester
    if (filter !== 'Todos') {
      const trimester = parseInt(filter, 10);
      filtered = allExams.filter(exam => {
        const match = exam.gestational_age_at_collection.match(/(\d+)/);
        if (!match) return false;
        const weeks = parseInt(match[0], 10);
        if (trimester === 1) return weeks <= 13;
        if (trimester === 2) return weeks > 13 && weeks <= 27;
        if (trimester === 3) return weeks > 27;
        return false;
      });
    }

    // Filter by search term
    if (term) {
      filtered = filtered.filter(exam =>
        exam.type.toLowerCase().includes(term) ||
        (exam.main_result && exam.main_result.toLowerCase().includes(term))
      );
    }

    return filtered;
  });

  // --- Filter Methods ---
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  onFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedFilter.set(value);
  }

  // --- Modal and Form Methods ---
  openExamModal(exam: Exam | null = null): void {
    this.selectedFile.set(null);
    if (exam) {
      this.editingExam.set(exam);
      this.examForm.patchValue(exam);
    } else {
      this.editingExam.set(null);
      this.examForm.reset({ status: 'Pendente' });
    }
    this.isExamModalOpen.set(true);
  }

  closeExamModal(): void {
    this.isExamModalOpen.set(false);
  }

  saveExam(): void {
    if (this.examForm.invalid) {
      this.examForm.markAllAsTouched();
      return;
    }

    // TODO: Implement Supabase call
    console.log('Saving exam:', this.examForm.value);

    this.closeExamModal();
  }

  // --- File Handling ---
  triggerFileInput(fileInput: HTMLInputElement): void {
    fileInput.click();
  }
  
  handleFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedFile.set(event.dataTransfer.files[0]);
      event.dataTransfer.clearData();
    }
  }
  
  removeSelectedFile(): void {
    this.selectedFile.set(null);
  }

  dismissAlert(): void {
    this.isAlertVisible.set(false);
  }

  // --- Delete Methods ---
  requestDeleteExam(exam: Exam): void {
    this.examToDelete.set(exam);
  }

  confirmDeleteExam(): void {
    const exam = this.examToDelete();
    if (exam) {
      // TODO: Implement Supabase call
      console.log('Deleting exam:', exam.id);
    }
    this.cancelDeleteExam();
  }

  cancelDeleteExam(): void {
    this.examToDelete.set(null);
  }
  
  // --- UI Helpers ---
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