import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation, Routes } from '@angular/router';
import { AppComponent } from './src/app.component';
import { PregnancyDashboardComponent } from './src/components/pregnancy-dashboard/pregnancy-dashboard.component';
import { ConsultasComponent } from './src/components/consultas/consultas.component';
import { GeneralDataComponent } from './src/components/general-data/general-data.component';
import { ExamsComponent } from './src/components/exames/exames.component';
import { EcosComponent } from './src/components/ecos/ecos.component';
import { PatientListComponent } from './src/components/patient-list/patient-list.component';

const routes: Routes = [
  { path: 'dashboard', component: PregnancyDashboardComponent },
  { path: 'consultas', component: ConsultasComponent },
  { path: 'dados-gerais', component: GeneralDataComponent },
  { path: 'exames', component: ExamsComponent },
  { path: 'ecos', component: EcosComponent },
  { path: 'pacientes', component: PatientListComponent },
  { path: '', redirectTo: 'pacientes', pathMatch: 'full' },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation()),
  ],
}).catch((err) => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.