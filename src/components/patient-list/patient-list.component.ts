import { Component, ChangeDetectionStrategy, inject, signal, computed, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PatientDataService, PatientListItem } from '../../services/patient-data.service';
import { Subject, debounceTime, takeUntil, tap } from 'rxjs';
// FIX: Removed FormBuilder and added FormControl to bypass FormBuilder injection issues.
import { ReactiveFormsModule, Validators, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './patient-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientListComponent implements OnDestroy {
  private patientDataService = inject(PatientDataService);
  // FIX: Removed FormBuilder injection.
  private router = inject(Router);
  
  patientList = this.patientDataService.getPatientList();
  activeFilter = signal<'Todas' | 'Alto Risco' | 'DPP Próxima'>('Todas');
  searchTerm = signal('');
  isSearching = signal(false);

  isAddPatientModalOpen = signal(false);
  showSuccessToast = signal(false);

  newPatientForm: FormGroup;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor() {
    // FIX: Replaced FormBuilder.group with new FormGroup() and new FormControl() to avoid injection issues.
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
      p.id.toLowerCase().includes(term)
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

  handleRegisterPatient(): void {
    if (this.newPatientForm.invalid) {
      return;
    }

    const formValue = this.newPatientForm.value;
    
    // Create a new patient object
    const newPatient: PatientListItem = {
      id: formValue.cpf,
      name: formValue.fullName,
      gestationalAge: '0s 0d', // Default value, would be calculated in a real app
      edd: 'N/A', // Default value
      risk: 'Baixo Risco', // Default value
    };

    // Call the service to add the patient to the central state
    this.patientDataService.addPatient(newPatient);

    this.closeAddPatientModal();
    this.showSuccessToast.set(true);
    setTimeout(() => {
      this.showSuccessToast.set(false);
      // Here you would navigate to the new patient's page, e.g., this.router.navigate(['/dados-gerais', newPatientId]);
    }, 3000);
  }

  navigateToPatient(patientId: string): void {
    // In a real app, you would pass the patient ID in the route
    // For this mock, we always navigate to the same dashboard.
    this.router.navigate(['/dashboard']);
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}