import { Component, ChangeDetectionStrategy, inject, signal, computed, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PatientDataService, PatientListItem } from '../../services/patient-data.service';
import { Subject, debounceTime, takeUntil, tap } from 'rxjs';
import { ReactiveFormsModule, Validators, FormGroup, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

type SortColumn = 'name' | 'gestationalAge' | 'edd' | 'risk' | 'id';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './patient-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientListComponent implements OnDestroy {
  private patientDataService = inject(PatientDataService);
  private router = inject(Router);
  
  // --- State Signals ---
  patientList = this.patientDataService.getPatientList();
  activeFilter = signal<'Todas' | 'Alto Risco' | 'DPP Próxima'>('Todas');
  searchTerm = signal('');
  isSearching = signal(false);

  // Sorting signals
  sortColumn = signal<SortColumn>('name');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Pagination signals
  currentPage = signal(1);
  itemsPerPage = signal(10); 

  // Modal signals
  isAddPatientModalOpen = signal(false);
  showSuccessToast = signal(false);

  newPatientForm: FormGroup;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor() {
    this.newPatientForm = new FormGroup({
      fullName: new FormControl('', Validators.required),
      cpf: new FormControl('', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]),
      birthDate: new FormControl(''),
      contact: new FormControl(''),
      dum: new FormControl(''),
      g: new FormControl(null),
      p: new FormControl(null),
      a: new FormControl(null)
    });

    this.searchSubject.pipe(
      tap(() => this.isSearching.set(true)),
      debounceTime(1000),
      takeUntil(this.destroy$)
    ).subscribe(searchValue => {
      this.searchTerm.set(searchValue);
      this.isSearching.set(false);
      this.currentPage.set(1); // Reset to first page on new search
    });
  }

  // --- Computed Data ---
  paginatedList = computed(() => {
    const list = this.patientList();
    const filter = this.activeFilter();
    const term = this.searchTerm().toLowerCase();
    const column = this.sortColumn();
    const direction = this.sortDirection();
    const page = this.currentPage();
    const perPage = this.itemsPerPage();

    // 1. Filtering
    let filtered = list;
    if (filter === 'Alto Risco') {
      filtered = list.filter(p => p.risk === 'Alto Risco');
    } else if (filter === 'DPP Próxima') {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      filtered = list.filter(p => {
        if (p.edd === 'N/A') return false;
        const [day, month, year] = p.edd.split('/').map(Number);
        const eddDate = new Date(year, month - 1, day);
        return eddDate >= today && eddDate <= thirtyDaysFromNow;
      });
    }

    if (term) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term)
      );
    }
    
    // 2. Sorting
    filtered.sort((a, b) => {
        const aVal = a[column];
        const bVal = b[column];
        let comparison = 0;
        if (aVal > bVal) comparison = 1;
        else if (aVal < bVal) comparison = -1;
        return direction === 'asc' ? comparison : -comparison;
    });

    // 3. Pagination
    const start = (page - 1) * perPage;
    const end = start + perPage;
    
    return {
      data: filtered.slice(start, end),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / perPage)
    };
  });
  
  // --- Event Handlers ---
  setFilter(filter: 'Todas' | 'Alto Risco' | 'DPP Próxima') {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  sortBy(column: SortColumn): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.currentPage.set(1);
  }

  changePage(page: number): void {
    this.currentPage.set(page);
  }

  openAddPatientModal(): void { this.isAddPatientModalOpen.set(true); }
  closeAddPatientModal(): void {
    this.isAddPatientModalOpen.set(false);
    this.newPatientForm.reset();
  }

  handleRegisterPatient(): void {
    if (this.newPatientForm.invalid) {
      this.newPatientForm.markAllAsTouched();
      return;
    }
    const formValue = this.newPatientForm.value;
    const newPatient: PatientListItem = {
      id: formValue.cpf,
      name: formValue.fullName,
      gestationalAge: '0s 0d',
      edd: 'N/A',
      risk: 'Baixo Risco',
    };
    this.patientDataService.addPatient(newPatient);
    this.closeAddPatientModal();
    this.showSuccessToast.set(true);
    setTimeout(() => this.showSuccessToast.set(false), 3000);
  }

  navigateToPatient(patientId: string): void {
    this.patientDataService.setActivePatient(patientId);
    this.router.navigate(['/app/dashboard']);
  }
  
  // --- UI Helpers ---
  getRiskClass(risk: 'Alto Risco' | 'Baixo Risco'): string {
    return risk === 'Alto Risco' ? 'bg-red-100 text-red-800' : 'bg-teal-100 text-teal-800';
  }

  formatCpf(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    if (value.length > 14) value = value.substring(0, 14);
    this.newPatientForm.get('cpf')?.setValue(value, { emitEvent: false });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}