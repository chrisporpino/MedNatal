import { Injectable, signal } from '@angular/core';

export interface Consulta {
  id: number;
  date: string;
  gestationalAge: string;
  summary: {
    fetalHeartRate: number; // BCF
    bloodPressure: string;
    weightChange: string;
  };
  details: {
    weight: string;
    bloodPressure: string;
    uterineHeight: number;
    fetalHeartRate: number;
    fetalMovements: 'Presente' | 'Ausente';
  };
  notes: string;
}

export interface Patient {
  name: string;
  avatarUrl: string;
  gestationalAge: {
    weeks: number;
    days: number;
  };
  edd: string; // Expected Date of Delivery
  riskStatus: 'Baixo Risco' | 'Alto Risco';
  maternalWeightData: { week: number; weight: number }[];
  uterineHeightData: { week: number; height: number }[];
  pendingItems: { text: string; urgent: boolean }[];
  latestMeasurements: {
    weight: string;
    bloodPressure: string;
    fetalHeartRate: string; // BCF
    date: string;
  };
  consultas: Consulta[];
}

@Injectable({
  providedIn: 'root',
})
export class PatientDataService {
  private readonly mockPatient: Patient = {
    name: 'Maria Clara da Silva',
    avatarUrl: 'https://picsum.photos/seed/patient1/100/100',
    gestationalAge: {
      weeks: 32,
      days: 5,
    },
    edd: '25 de Agosto de 2024',
    riskStatus: 'Alto Risco',
    maternalWeightData: [
      { week: 8, weight: 60.5 },
      { week: 12, weight: 61.2 },
      { week: 16, weight: 62.5 },
      { week: 20, weight: 64.0 },
      { week: 24, weight: 66.1 },
      { week: 28, weight: 68.3 },
      { week: 32, weight: 70.2 },
    ],
    uterineHeightData: [
      { week: 20, height: 20 },
      { week: 22, height: 22 },
      { week: 24, height: 24 },
      { week: 26, height: 26 },
      { week: 28, height: 29 },
      { week: 30, height: 31 },
      { week: 32, height: 32 },
    ],
    pendingItems: [
      { text: 'Resultado Ecografia Morfológica', urgent: true },
      { text: 'Agendar Curva Glicêmica', urgent: true },
      { text: 'Revisar resultado de urocultura', urgent: false },
      { text: 'Administrar Imunoglobulina Anti-D', urgent: false },
    ],
    latestMeasurements: {
      weight: '70.2 kg',
      bloodPressure: '130/85 mmHg',
      fetalHeartRate: '145 bpm',
      date: '10 de Julho de 2024',
    },
    consultas: [
       {
        id: 3,
        date: '10 de Julho de 2024',
        gestationalAge: 'IG 32 Semanas e 5 Dias',
        summary: { fetalHeartRate: 145, bloodPressure: '130/85', weightChange: '+0.9 kg' },
        details: { weight: '70.2 kg', bloodPressure: '130/85 mmHg', uterineHeight: 32, fetalHeartRate: 145, fetalMovements: 'Presente' },
        notes: 'Paciente refere edema em membros inferiores no final do dia. Pressão arterial em limite superior, orientada a monitorar em casa e retornar caso apresente cefaleia ou escotomas. Solicitado perfil pressórico.'
      },
      {
        id: 2,
        date: '26 de Junho de 2024',
        gestationalAge: 'IG 30 Semanas e 5 Dias',
        summary: { fetalHeartRate: 150, bloodPressure: '125/80', weightChange: '+1.1 kg' },
        details: { weight: '69.3 kg', bloodPressure: '125/80 mmHg', uterineHeight: 31, fetalHeartRate: 150, fetalMovements: 'Presente' },
        notes: 'Exames do 3º trimestre apresentados, sem alterações significativas. Paciente segue com queixas de azia. Reforçada orientação dietética.'
      },
       {
        id: 1,
        date: '12 de Junho de 2024',
        gestationalAge: 'IG 28 Semanas e 5 Dias',
        summary: { fetalHeartRate: 148, bloodPressure: '120/75', weightChange: '+1.2 kg' },
        details: { weight: '68.2 kg', bloodPressure: '120/75 mmHg', uterineHeight: 29, fetalHeartRate: 148, fetalMovements: 'Presente' },
        notes: 'Realizado teste de Glicemia de jejum, resultado normal. Paciente orientada sobre sinais de trabalho de parto prematuro. Segue em acompanhamento de rotina.'
      },
    ]
  };

  getPatientData() {
    return signal(this.mockPatient);
  }
}