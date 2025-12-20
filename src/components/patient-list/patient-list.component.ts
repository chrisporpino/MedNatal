import { Component, ChangeDetectionStrategy, inject, signal, computed, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PatientDataService, PatientListItem } from '../../services/patient-data.service';
import { Subject, debounceTime, takeUntil, tap } from 'rxjs';
import { ReactiveFormsModule, Validators, FormGroup, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './patient-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientListComponent implements OnInit, OnDestroy {
  private patientDataService = inject(PatientDataService);
  private router = inject(Router);
  
  patientList = this.patientDataService.getPatientList();
  isLoading = this.patientDataService.isLoadingList;
  
  activeFilter = signal<'Todas' | 'Alto Risco' | 'DPP Próxima'>('Todas');
  searchTerm = signal('');
  isSearching = signal(false);

  isAddPatientModalOpen = signal(false);
  showSuccessToast = signal(false);

  newPatientForm: FormGroup;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor() {
    this.newPatientForm = new FormGroup({
      fullName: new FormControl('', Validators.required),
      cpf: new FormControl('', Validators.required),
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
    });
  }

  ngOnInit(): void {
    // Clear any previously selected patient when returning to the list
    this.patientDataService.setCurrentPatient('');
    this.patientDataService.loadPatientList();
  }

  filteredList = computed(() => {
    const list = this.patientList();
    const filter = this.activeFilter();
    const term = this.searchTerm().toLowerCase();

    let filteredByStatus = list;
    if (filter === 'Alto Risco') {
      filteredByStatus = list.filter(p => p.risk === 'Alto Risco');
    }
    // Add logic for 'DPP Próxima' if needed
    
    if (!term) {
      return filteredByStatus;
    }

    return filteredByStatus.filter(p => 
      p.name.toLowerCase().includes(term) ||
      p.cpf.toLowerCase().includes(term)
    );
  });
  
  setFilter(filter: 'Todas' | 'Alto Risco' | 'DPP Próxima') {
    this.activeFilter.set(filter);
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  getRiskClass(risk: 'Alto Risco' | 'Baixo Risco'): string {
    return risk === 'Alto Risco' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-teal-100 text-teal-800';
  }

  openAddPatientModal(): void {
    this.isAddPatientModalOpen.set(true);
  }

  closeAddPatientModal(): void {
    this.isAddPatientModalOpen.set(false);
    this.newPatientForm.reset();
  }

  async handleRegisterPatient(): Promise<void> {
    if (this.newPatientForm.invalid) {
      this.newPatientForm.markAllAsTouched();
      return;
    }
    
    const newPatient = await this.patientDataService.addPatient(this.newPatientForm.value);

    this.closeAddPatientModal();
    
    if (newPatient) {
      this.showSuccessToast.set(true);
      setTimeout(async () => {
        this.showSuccessToast.set(false);
        await this.navigateToPatient(newPatient.id);
      }, 3000);
    } else {
      // Handle error case, e.g., show an error toast
    }
  }

  async navigateToPatient(patientId: string): Promise<void> {
    await this.patientDataService.setCurrentPatient(patientId);
    this.router.navigate(['/dashboard']);
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}