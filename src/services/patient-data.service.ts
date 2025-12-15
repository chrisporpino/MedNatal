import { Injectable, signal, Signal } from '@angular/core';

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

export interface Parity {
  gestations: number;
  parities: number;
  abortions: number;
}

export interface ObstetricHistory {
  babyName: string;
  gestationalAgeAtBirth: string;
  babyWeight: string;
  deliveryType: string;
}

export interface Exam {
  id: number;
  date: string;
  type: string;
  status: 'Normal' | 'Alterado' | 'Pendente';
  mainResult: string;
  reportUrl?: string;
  gestationalAgeAtCollection: string;
}

export interface EcoData {
  id: number;
  date: string;
  gestationalAge: number; // in weeks
  estimatedFetalWeight: number; // in grams
  fetalHeartRate: number;
  placentaPresentation: string;
  reportUrl?: string;
}

export interface FetalGrowthPercentile {
  week: number;
  p10: number;
  p50: number;
  p90: number;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  profession: string;
  contact: {
    phone: string;
    email: string;
  },
  address: string;
  parity: Parity;
  allergies: string;
  medicationsInUse: string;
  chronicDiseases: string;
  obstetricHistory: ObstetricHistory[];
  gestationalCalculator: {
    dum: string;
    dumIsReliable: boolean;
    firstUltrasoundDate: string;
    firstUltrasoundGA: string; // Gestational age in weeks/days
    officialCalculationBasis: 'DUM' | 'USG';
  };
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
  exams: Exam[];
  examAlert?: { message: string };
  ecos: EcoData[];
  fetalGrowthPercentiles: FetalGrowthPercentile[];
}

export interface PatientListItem {
  id: string;
  name: string;
  gestationalAge: string;
  edd: string; // Expected date of delivery
  risk: 'Alto Risco' | 'Baixo Risco';
}


@Injectable({
  providedIn: 'root',
})
export class PatientDataService {
  private readonly mockPatient: Patient = {
    id: '893.452.129-00',
    name: 'Maria Clara da Silva',
    age: 31,
    profession: 'Arquiteta',
    contact: {
      phone: '(11) 98765-4321',
      email: 'maria.clara@email.com'
    },
    address: 'Rua das Flores, 123, São Paulo, SP',
    parity: {
      gestations: 2,
      parities: 1,
      abortions: 0,
    },
    allergies: 'Penicilina',
    medicationsInUse: 'Vitamina pré-natal',
    chronicDiseases: 'Hipotireoidismo (controlado)',
    obstetricHistory: [
      { babyName: 'João Pedro', gestationalAgeAtBirth: '39s 2d', babyWeight: '3.450g', deliveryType: 'Parto Normal' }
    ],
    gestationalCalculator: {
      dum: '2023-11-20',
      dumIsReliable: true,
      firstUltrasoundDate: '2024-01-15',
      firstUltrasoundGA: '8s 1d',
      officialCalculationBasis: 'DUM'
    },
    avatarUrl: 'https://lh3.googleusercontent.com/rd-d/ALs6j_GTgGrj5OgGxWadGarNIQXFDNQIpno0IdGal0RBOawaQrBi3T2x_xG51kAqnKm3SW_KMsyU0fQx2iJWVRIqIgZjeXpLjrA_XBUQzp9QvLoTDh4ab81ZPeFi3uJHqRUs4dOaOlua8T6triPmfrregZILgDaTtGEdxCsk_2C35RUaTjE6S_zv6djMVohrX4x5UvXemPrO4Kx9TsEZqjV1ugKE0ZAY5udeb4SxMBzwcJXPlR_QIVdhz5O34voaP91qnR1hZ4-Z6cwR2TiSGNx8xDBt8wxySq6YUoomRyDhQ7DaRWsSQiKDNxqWN5GUm11mBGgNJo03aHQK43WpsB5HYWaDseblWETLfbQath4MgqT1Kzm-T-nBAsBqQyL8bMEVjSkZUABlxDNerGgYMXyqKkHPdT-nCKPZQu4cmC3XhGwhB9ixvVOVlDtyz7XbBY4fdI28fhrG2LqiQroLdef6s-iYkBqbhQEWBkeK41l2BmvqVBQRJtE2fLRqROk4NcXlCG_CtEw__M2NIZVIghbxY5YY18JkZ6vjbOQYTRjev_zo61RrDP79q0qadIVCM2ew2erTLH5EroYRjZx_M0gdGkOh0whcPn0mv0xv93mbFjsruMEEt2VSFge3pXkVFE95QEUVM25CAQrb0yWyDvHXqvk5MOAUIjSmDe7SZnkQQrIo-YIck2WoBEpjfhMnvPfhrdzBKwmRPrxhgfAHugXs2rlc1k96J_vdumSWLBjmS1Iv9MW3kBBo3O50uATwfPQX5zNX4JLCS86Cg2MHF3SsaP9pGXY0qrl-AKNITA7g_cK3QaDhLrux4MO6tgmnz_RzaffVqD7J0x37Y5WROu1AZhfydStoby2aM2wLnRzNmHMXhlombPMd7nZU1FfZWbzQO99bUIKeuEi7USpyrXmL0hq4c0GTjvVfAfQvQULbdWj8Yrfu0oEWIUvw-FY0JfoCZ5w4WKwRaNWypoKFP0sNN-MGqGGpaMFKLtioSvXIDYswD_zg20dSE9YeD71ERqg6hj1eqbnV26Y72MEL9wXCaT6ZLvqftSOwIew-82Up_gMdUXQ3SqRzUiXASQKVAbYGGtRPv09foU_oxIGRo_2CGa8_dQpYEeQoo9ytERWqRe5tCx2thYtfiKc0kzx4S3tvQtE5yawSfiHjxrplLOVYd6__eypsATHtoLWZIx6GNrQJcxmwGxx6BRhBFYyifcx0XSy7ZgfzoF1LcZla34xD9Q36iR0gwC5uaA=w1920-h912?auditContext=thumbnail&auditContext=prefetch',
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
    ],
    exams: [
      { id: 1, date: '2024-07-05', type: 'Glicemia de Jejum', status: 'Alterado', mainResult: '105 mg/dL', reportUrl: '#', gestationalAgeAtCollection: 'IG 31 Semanas' },
      { id: 2, date: '2024-07-05', type: 'Urocultura', status: 'Normal', mainResult: 'Negativo', reportUrl: '#', gestationalAgeAtCollection: 'IG 31 Semanas' },
      { id: 3, date: '2024-06-20', type: 'Ecografia Morfológica', status: 'Pendente', mainResult: 'Aguardando laudo', gestationalAgeAtCollection: 'IG 29 Semanas' },
      { id: 4, date: '2024-05-15', type: 'Sorologia (HIV, VDRL, Hep B/C)', status: 'Normal', mainResult: 'Não Reagente', reportUrl: '#', gestationalAgeAtCollection: 'IG 24 Semanas' },
      { id: 5, date: '2024-03-10', type: 'Hemograma Completo', status: 'Normal', mainResult: 'Hb: 12.1 g/dL', reportUrl: '#', gestationalAgeAtCollection: 'IG 15 Semanas' },
    ],
    examAlert: {
      message: 'ALERTA: Glicemia de Jejum Elevada na Semana 31.'
    },
    ecos: [
      { id: 1, date: '2024-01-15', gestationalAge: 8, estimatedFetalWeight: 15, fetalHeartRate: 170, placentaPresentation: 'N/A' },
      { id: 2, date: '2024-03-25', gestationalAge: 18, estimatedFetalWeight: 240, fetalHeartRate: 155, placentaPresentation: 'Cefálica' },
      { id: 3, date: '2024-05-20', gestationalAge: 26, estimatedFetalWeight: 900, fetalHeartRate: 148, placentaPresentation: 'Cefálica' },
      { id: 4, date: '2024-07-08', gestationalAge: 32, estimatedFetalWeight: 1850, fetalHeartRate: 145, placentaPresentation: 'Cefálica' },
    ],
    fetalGrowthPercentiles: [
      { week: 14, p10: 80, p50: 100, p90: 120 }, { week: 16, p10: 140, p50: 190, p90: 240 },
      { week: 18, p10: 220, p50: 280, p90: 340 }, { week: 20, p10: 320, p50: 400, p90: 480 },
      { week: 22, p10: 450, p50: 550, p90: 650 }, { week: 24, p10: 600, p50: 750, p90: 900 },
      { week: 26, p10: 780, p50: 980, p90: 1180 }, { week: 28, p10: 1000, p50: 1250, p90: 1500 },
      { week: 30, p10: 1250, p50: 1550, p90: 1850 }, { week: 32, p10: 1500, p50: 1900, p90: 2300 },
      { week: 34, p10: 1800, p50: 2300, p90: 2800 }, { week: 36, p10: 2100, p50: 2700, p90: 3300 },
      { week: 38, p10: 2400, p50: 3100, p90: 3800 }, { week: 40, p10: 2700, p50: 3500, p90: 4300 }
    ]
  };

  private readonly mockPatientList: PatientListItem[] = [
    { id: '893.452.129-00', name: 'Maria Clara da Silva', gestationalAge: '32s 5d', edd: '25/08/2024', risk: 'Alto Risco' },
    { id: '123.456.789-01', name: 'Ana Beatriz Souza', gestationalAge: '28s 1d', edd: '22/09/2024', risk: 'Baixo Risco' },
    { id: '987.654.321-02', name: 'Juliana Pereira Lima', gestationalAge: '35s 0d', edd: '04/08/2024', risk: 'Baixo Risco' },
    { id: '456.789.123-03', name: 'Camila Rodrigues Alves', gestationalAge: '38s 2d', edd: '18/07/2024', risk: 'Alto Risco' },
    { id: '321.654.987-04', name: 'Fernanda Costa Oliveira', gestationalAge: '15s 4d', edd: '15/12/2024', risk: 'Baixo Risco' },
  ];
  
  private patientListSignal = signal<PatientListItem[]>(this.mockPatientList);
  private patientSignal = signal<Patient>(this.mockPatient);

  getPatientData(): Signal<Patient> {
    return this.patientSignal.asReadonly();
  }

  updatePatient(updatedData: Partial<Patient>): void {
    this.patientSignal.update(currentPatient => {
      const newPatient = { ...currentPatient, ...updatedData };
      if (updatedData.parity) {
        newPatient.parity = { ...currentPatient.parity, ...updatedData.parity };
      }
       if (updatedData.contact) {
        newPatient.contact = { ...currentPatient.contact, ...updatedData.contact };
      }
      if (updatedData.gestationalCalculator) {
        newPatient.gestationalCalculator = { ...currentPatient.gestationalCalculator, ...updatedData.gestationalCalculator };
      }
      return newPatient;
    });
  }
  
  addObstetricHistory(history: ObstetricHistory): void {
    this.patientSignal.update(p => ({
      ...p,
      obstetricHistory: [...p.obstetricHistory, history]
    }));
  }

  updateObstetricHistory(index: number, history: ObstetricHistory): void {
    this.patientSignal.update(p => {
      const updatedHistory = [...p.obstetricHistory];
      updatedHistory[index] = history;
      return { ...p, obstetricHistory: updatedHistory };
    });
  }

  deleteObstetricHistory(index: number): void {
    this.patientSignal.update(p => ({
      ...p,
      obstetricHistory: p.obstetricHistory.filter((_, i) => i !== index)
    }));
  }

  addExam(exam: Omit<Exam, 'id'>): void {
    this.patientSignal.update(p => {
      const newId = p.exams.length > 0 ? Math.max(...p.exams.map(e => e.id)) + 1 : 1;
      const newExam: Exam = { ...exam, id: newId };
      return {
        ...p,
        exams: [newExam, ...p.exams].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      };
    });
  }

  updateExam(updatedExam: Exam): void {
    this.patientSignal.update(p => {
      const index = p.exams.findIndex(e => e.id === updatedExam.id);
      if (index > -1) {
        const updatedExams = [...p.exams];
        updatedExams[index] = updatedExam;
        return { 
          ...p, 
          exams: updatedExams.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        };
      }
      return p;
    });
  }

  deleteExam(examId: number): void {
    this.patientSignal.update(p => ({
      ...p,
      exams: p.exams.filter(e => e.id !== examId)
    }));
  }

  getPatientList(): Signal<PatientListItem[]> {
    return this.patientListSignal.asReadonly();
  }

  addPatient(patient: PatientListItem): void {
    this.patientListSignal.update(list => [patient, ...list]);
  }
}