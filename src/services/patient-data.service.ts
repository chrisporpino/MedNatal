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

export interface PendingItem {
  id: number;
  text: string;
  urgent: boolean;
  status: 'pending' | 'completed';
  link?: string;
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
  pendingItems: PendingItem[];
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
  private readonly mockPatients: Patient[] = [
     {
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
      { week: 8, weight: 60.5 }, { week: 12, weight: 61.2 }, { week: 16, weight: 62.5 },
      { week: 20, weight: 64.0 }, { week: 24, weight: 66.1 }, { week: 28, weight: 68.3 },
      { week: 32, weight: 70.2 },
    ],
    uterineHeightData: [
      { week: 20, height: 20 }, { week: 22, height: 22 }, { week: 24, height: 24 },
      { week: 26, height: 26 }, { week: 28, height: 29 }, { week: 30, height: 31 },
      { week: 32, height: 32 },
    ],
    pendingItems: [
        { id: 1, text: 'Resultado Ecografia Morfológica', urgent: true, status: 'pending', link: '/exames' },
        { id: 2, text: 'Agendar Curva Glicêmica', urgent: true, status: 'pending' },
        { id: 3, text: 'Revisar resultado de urocultura', urgent: false, status: 'completed' },
        { id: 4, text: 'Administrar Imunoglobulina Anti-D', urgent: false, status: 'pending' },
    ],
    latestMeasurements: {
      weight: '70.2 kg',
      bloodPressure: '130/85 mmHg',
      fetalHeartRate: '145 bpm',
      date: '10 de Julho de 2024',
    },
    consultas: [
       { id: 3, date: '2024-07-10', gestationalAge: 'IG 32 Semanas e 5 Dias', summary: { fetalHeartRate: 145, bloodPressure: '130/85', weightChange: '+0.9 kg' }, details: { weight: '70.2 kg', bloodPressure: '130/85 mmHg', uterineHeight: 32, fetalHeartRate: 145, fetalMovements: 'Presente' }, notes: 'Paciente refere edema em membros inferiores no final do dia. Pressão arterial em limite superior, orientada a monitorar em casa e retornar caso apresente cefaleia ou escotomas. Solicitado perfil pressórico.' },
       { id: 2, date: '2024-06-26', gestationalAge: 'IG 30 Semanas e 5 Dias', summary: { fetalHeartRate: 150, bloodPressure: '125/80', weightChange: '+1.1 kg' }, details: { weight: '69.3 kg', bloodPressure: '125/80 mmHg', uterineHeight: 31, fetalHeartRate: 150, fetalMovements: 'Presente' }, notes: 'Exames do 3º trimestre apresentados, sem alterações significativas. Paciente segue com queixas de azia. Reforçada orientação dietética.' },
       { id: 1, date: '2024-06-12', gestationalAge: 'IG 28 Semanas e 5 Dias', summary: { fetalHeartRate: 148, bloodPressure: '120/75', weightChange: '+1.2 kg' }, details: { weight: '68.2 kg', bloodPressure: '120/75 mmHg', uterineHeight: 29, fetalHeartRate: 148, fetalMovements: 'Presente' }, notes: 'Realizado teste de Glicemia de jejum, resultado normal. Paciente orientada sobre sinais de trabalho de parto prematuro. Segue em acompanhamento de rotina.' },
    ],
    exams: [
      { id: 1, date: '2024-07-05', type: 'Glicemia de Jejum', status: 'Alterado', mainResult: '105 mg/dL', reportUrl: '#', gestationalAgeAtCollection: 'IG 31 Semanas' },
      { id: 2, date: '2024-07-05', type: 'Urocultura', status: 'Normal', mainResult: 'Negativo', reportUrl: '#', gestationalAgeAtCollection: 'IG 31 Semanas' },
      { id: 3, date: '2024-06-20', type: 'Ecografia Morfológica', status: 'Pendente', mainResult: 'Aguardando laudo', gestationalAgeAtCollection: 'IG 29 Semanas' },
    ],
    examAlert: { message: 'ALERTA: Glicemia de Jejum Elevada na Semana 31.' },
    ecos: [
      { id: 1, date: '2024-01-15', gestationalAge: 8, estimatedFetalWeight: 15, fetalHeartRate: 170, placentaPresentation: 'N/A' },
      { id: 4, date: '2024-07-08', gestationalAge: 32, estimatedFetalWeight: 1850, fetalHeartRate: 145, placentaPresentation: 'Cefálica' },
    ],
    fetalGrowthPercentiles: [ { week: 14, p10: 80, p50: 100, p90: 120 }, { week: 40, p10: 2700, p50: 3500, p90: 4300 } ]
  },
  {
    id: '123.456.789-01', name: 'Ana Beatriz Souza', age: 28, profession: 'Designer', contact: { phone: '(21) 91234-5678', email: 'ana.souza@email.com' },
    address: 'Avenida Copacabana, 456, Rio de Janeiro, RJ', parity: { gestations: 1, parities: 0, abortions: 0 },
    allergies: 'Nenhuma conhecida', medicationsInUse: 'Ácido fólico', chronicDiseases: 'Nenhuma', obstetricHistory: [],
    gestationalCalculator: { dum: '2024-01-01', dumIsReliable: true, firstUltrasoundDate: '2024-02-26', firstUltrasoundGA: '8s 0d', officialCalculationBasis: 'DUM' },
    avatarUrl: 'https://picsum.photos/seed/ab_souza/200/200', gestationalAge: { weeks: 28, days: 1 }, edd: '22 de Setembro de 2024',
    riskStatus: 'Baixo Risco', maternalWeightData: [{ week: 8, weight: 55 }, { week: 12, weight: 56 }, { week: 16, weight: 57.5 }, { week: 20, weight: 59 }, { week: 24, weight: 61 }, { week: 28, weight: 63 }],
    uterineHeightData: [{ week: 20, height: 19 }, { week: 22, height: 21 }, { week: 24, height: 23 }, { week: 26, height: 25 }, { week: 28, height: 27 }],
    pendingItems: [{ id: 1, text: 'Agendar ecografia morfológica do 2º trimestre', urgent: false, status: 'pending', link: '/ecos' }],
    latestMeasurements: { weight: '63 kg', bloodPressure: '110/70 mmHg', fetalHeartRate: '150 bpm', date: '01 de Julho de 2024' },
    consultas: [], exams: [], ecos: [], fetalGrowthPercentiles: []
  },
  {
    id: '987.654.321-02', name: 'Juliana Pereira Lima', age: 35, profession: 'Advogada', contact: { phone: '(31) 99876-5432', email: 'juliana.lima@email.com' },
    address: 'Rua da Bahia, 789, Belo Horizonte, MG', parity: { gestations: 3, parities: 2, abortions: 0 },
    allergies: 'AAS (Ácido acetilsalicílico)', medicationsInUse: 'Nenhum', chronicDiseases: 'Nenhuma',
    obstetricHistory: [ { babyName: 'Lucas', gestationalAgeAtBirth: '40s 1d', babyWeight: '3.800g', deliveryType: 'Parto Cesárea' }, { babyName: 'Sofia', gestationalAgeAtBirth: '38s 5d', babyWeight: '3.200g', deliveryType: 'Parto Normal' } ],
    gestationalCalculator: { dum: '2023-11-10', dumIsReliable: true, firstUltrasoundDate: '2024-01-05', firstUltrasoundGA: '8s 1d', officialCalculationBasis: 'USG' },
    avatarUrl: 'https://picsum.photos/seed/jp_lima/200/200', gestationalAge: { weeks: 35, days: 0 }, edd: '04 de Agosto de 2024',
    riskStatus: 'Baixo Risco', maternalWeightData: [], uterineHeightData: [], pendingItems: [],
    latestMeasurements: { weight: '75 kg', bloodPressure: '120/80 mmHg', fetalHeartRate: '140 bpm', date: '12 de Julho de 2024' },
    consultas: [], exams: [], ecos: [], fetalGrowthPercentiles: []
  },
  {
    id: '456.789.123-03', name: 'Camila Rodrigues Alves', age: 29, profession: 'Enfermeira', contact: { phone: '(41) 98765-1234', email: 'camila.alves@email.com' },
    address: 'Rua das Araucárias, 321, Curitiba, PR', parity: { gestations: 2, parities: 0, abortions: 1 },
    allergies: 'Nenhuma', medicationsInUse: 'Metformina', chronicDiseases: 'Diabetes Mellitus tipo 2',
    obstetricHistory: [],
    gestationalCalculator: { dum: '2023-10-25', dumIsReliable: false, firstUltrasoundDate: '2023-12-20', firstUltrasoundGA: '8s 2d', officialCalculationBasis: 'USG' },
    avatarUrl: 'https://picsum.photos/seed/cr_alves/200/200', gestationalAge: { weeks: 38, days: 2 }, edd: '18 de Julho de 2024',
    riskStatus: 'Alto Risco', maternalWeightData: [], uterineHeightData: [],
    pendingItems: [
        { id: 1, text: 'Avaliar necessidade de indução do parto', urgent: true, status: 'pending' }, 
        { id: 2, text: 'Monitorar perfil glicêmico', urgent: true, status: 'pending' }
    ],
    latestMeasurements: { weight: '80 kg', bloodPressure: '135/88 mmHg', fetalHeartRate: '142 bpm', date: '15 de Julho de 2024' },
    consultas: [], exams: [{ id: 1, date: '2024-07-10', type: 'Glicemia de Jejum', status: 'Alterado', mainResult: '110 mg/dL', reportUrl: '#', gestationalAgeAtCollection: 'IG 37 Semanas' }],
    examAlert: { message: 'ALERTA: Diabetes Gestacional descompensado.' },
    ecos: [], fetalGrowthPercentiles: []
  },
  {
    id: '321.654.987-04', name: 'Fernanda Costa Oliveira', age: 22, profession: 'Estudante', contact: { phone: '(51) 91234-9876', email: 'fernanda.oliveira@email.com' },
    address: 'Avenida Ipiranga, 678, Porto Alegre, RS', parity: { gestations: 1, parities: 0, abortions: 0 },
    allergies: 'Nenhuma', medicationsInUse: 'Suplemento de ferro', chronicDiseases: 'Anemia leve',
    obstetricHistory: [],
    gestationalCalculator: { dum: '2024-04-01', dumIsReliable: true, firstUltrasoundDate: '2024-05-27', firstUltrasoundGA: '8s 0d', officialCalculationBasis: 'DUM' },
    avatarUrl: 'https://picsum.photos/seed/fc_oliveira/200/200', gestationalAge: { weeks: 15, days: 4 }, edd: '15 de Dezembro de 2024',
    riskStatus: 'Baixo Risco', maternalWeightData: [], uterineHeightData: [],
    pendingItems: [{ id: 1, text: 'Aguardando resultado de sorologias do 1º trimestre', urgent: false, status: 'pending', link: '/exames' }],
    latestMeasurements: { weight: '58 kg', bloodPressure: '100/60 mmHg', fetalHeartRate: '155 bpm', date: '10 de Julho de 2024' },
    consultas: [], exams: [], ecos: [], fetalGrowthPercentiles: []
  }
];

  private readonly mockPatientList: PatientListItem[] = [
    { id: '893.452.129-00', name: 'Maria Clara da Silva', gestationalAge: '32s 5d', edd: '25/08/2024', risk: 'Alto Risco' },
    { id: '123.456.789-01', name: 'Ana Beatriz Souza', gestationalAge: '28s 1d', edd: '22/09/2024', risk: 'Baixo Risco' },
    { id: '987.654.321-02', name: 'Juliana Pereira Lima', gestationalAge: '35s 0d', edd: '04/08/2024', risk: 'Baixo Risco' },
    { id: '456.789.123-03', name: 'Camila Rodrigues Alves', gestationalAge: '38s 2d', edd: '18/07/2024', risk: 'Alto Risco' },
    { id: '321.654.987-04', name: 'Fernanda Costa Oliveira', gestationalAge: '15s 4d', edd: '15/12/2024', risk: 'Baixo Risco' },
  ];
  
  private patientListSignal = signal<PatientListItem[]>(this.mockPatientList);
  private patientSignal = signal<Patient>(this.mockPatients[0]);

  // --- UTILITY METHODS ---

  public getGestationStartDate(patient: Patient): Date {
    const calc = patient.gestationalCalculator;
    if (calc.officialCalculationBasis === 'USG' && calc.firstUltrasoundDate && calc.firstUltrasoundGA) {
      const gaParts = calc.firstUltrasoundGA.match(/(\d+)s.*?(\d+)d/);
      if (gaParts) {
        const weeks = parseInt(gaParts[1], 10);
        const days = parseInt(gaParts[2], 10);
        const totalDaysGA = (weeks * 7) + days;
        const usgDate = new Date(calc.firstUltrasoundDate + 'T00:00:00');
        const startDate = new Date(usgDate.getTime());
        startDate.setDate(startDate.getDate() - totalDaysGA);
        return startDate;
      }
    }
    // Fallback to DUM
    return new Date(calc.dum + 'T00:00:00');
  }

  public calculateGestationalAgeOnDate(startDate: Date, targetDate: Date): { weeks: number, days: number } {
    if (!startDate || isNaN(startDate.getTime()) || !targetDate || isNaN(targetDate.getTime())) {
      return { weeks: 0, days: 0 };
    }
    const diffTime = targetDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    return { weeks, days };
  }
  
  public calculateEdd(startDate: Date): string {
    if (!startDate || isNaN(startDate.getTime())) return 'N/A';
    const dpp = new Date(startDate.getTime());
    dpp.setDate(dpp.getDate() + 280); // 40 weeks
    return dpp.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  // --- DATA ACCESSORS ---

  setActivePatient(id: string): void {
    const selectedPatient = this.mockPatients.find(p => p.id === id);
    if (selectedPatient) {
      this.patientSignal.set(selectedPatient);
    } else {
      console.error(`Paciente com id ${id} não encontrado.`);
      this.patientSignal.set(this.mockPatients[0]);
    }
  }

  getPatientData(): Signal<Patient> {
    return this.patientSignal.asReadonly();
  }
  
  getPatientList(): Signal<PatientListItem[]> {
    return this.patientListSignal.asReadonly();
  }

  // --- DATA MUTATION ---

  updatePatient(updatedData: Partial<Patient>): void {
    this.patientSignal.update(currentPatient => {
      const newPatient = { ...currentPatient, ...updatedData };
      if (updatedData.parity) newPatient.parity = { ...currentPatient.parity, ...updatedData.parity };
      if (updatedData.contact) newPatient.contact = { ...currentPatient.contact, ...updatedData.contact };
      if (updatedData.gestationalCalculator) newPatient.gestationalCalculator = { ...currentPatient.gestationalCalculator, ...updatedData.gestationalCalculator };
      return newPatient;
    });

    // Also update the summary in the patient list
    this.patientListSignal.update(list => {
        const index = list.findIndex(p => p.id === this.patientSignal().id);
        if (index > -1 && updatedData.gestationalAge && updatedData.edd) {
            const updatedList = [...list];
            updatedList[index] = {
                ...updatedList[index],
                gestationalAge: `${updatedData.gestationalAge.weeks}s ${updatedData.gestationalAge.days}d`,
                edd: new Date(updatedData.edd).toLocaleDateString('pt-BR')
            };
            return updatedList;
        }
        return list;
    });
  }
  
  addPatient(patient: PatientListItem): void {
    this.patientListSignal.update(list => [patient, ...list]);
    // In a real app, you would also create a full patient object in `mockPatients`
  }

  // --- History Management ---
  
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

  // --- Exam Management ---

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

  // --- ECO Management ---
  addEco(eco: Omit<EcoData, 'id'>): void {
    this.patientSignal.update(p => {
      const newId = p.ecos.length > 0 ? Math.max(...p.ecos.map(e => e.id)) + 1 : 1;
      const newEco: EcoData = { ...eco, id: newId };
      const sortedEcos = [...p.ecos, newEco].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return { ...p, ecos: sortedEcos };
    });
  }

  updateEco(updatedEco: EcoData): void {
    this.patientSignal.update(p => {
      const index = p.ecos.findIndex(e => e.id === updatedEco.id);
      if (index > -1) {
        const updatedEcos = [...p.ecos];
        updatedEcos[index] = updatedEco;
        const sortedEcos = updatedEcos.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return { ...p, ecos: sortedEcos };
      }
      return p;
    });
  }

  deleteEco(ecoId: number): void {
    this.patientSignal.update(p => ({
      ...p,
      ecos: p.ecos.filter(e => e.id !== ecoId)
    }));
  }

  // --- Consulta Management ---

  private _recalculateWeightChanges(consultas: Consulta[]): Consulta[] {
    const sorted = [...consultas].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.map((consulta, index) => {
      if (index === 0) {
        return { ...consulta, summary: { ...consulta.summary, weightChange: 'N/A' } };
      }
      const previousWeight = parseFloat(sorted[index - 1].details.weight);
      const currentWeight = parseFloat(consulta.details.weight);
      const change = (currentWeight - previousWeight).toFixed(1);
      const weightChange = `${parseFloat(change) >= 0 ? '+' : ''}${change} kg`;
      return { ...consulta, summary: { ...consulta.summary, weightChange } };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort back to descending for display
  }

  addConsulta(consulta: Omit<Consulta, 'id'>): void {
    this.patientSignal.update(p => {
      const newId = p.consultas.length > 0 ? Math.max(...p.consultas.map(c => c.id)) + 1 : 1;
      const newConsulta: Consulta = { ...consulta, id: newId };
      const recalculatedConsultas = this._recalculateWeightChanges([...p.consultas, newConsulta]);
      return { ...p, consultas: recalculatedConsultas };
    });
  }

  updateConsulta(updatedConsulta: Consulta): void {
    this.patientSignal.update(p => {
      const index = p.consultas.findIndex(c => c.id === updatedConsulta.id);
      if (index > -1) {
        const updatedConsultas = [...p.consultas];
        updatedConsultas[index] = updatedConsulta;
        const recalculatedConsultas = this._recalculateWeightChanges(updatedConsultas);
        return { ...p, consultas: recalculatedConsultas };
      }
      return p;
    });
  }

  deleteConsulta(consultaId: number): void {
    this.patientSignal.update(p => ({
      ...p,
      consultas: this._recalculateWeightChanges(p.consultas.filter(c => c.id !== consultaId))
    }));
  }

  // --- Pending Items ---
  togglePendingItemStatus(itemId: number): void {
    this.patientSignal.update(p => {
      const updatedItems = p.pendingItems.map(item => {
        if (item.id === itemId) {
          return { ...item, status: item.status === 'pending' ? 'completed' : 'pending' as 'pending' | 'completed' };
        }
        return item;
      });
      return { ...p, pendingItems: updatedItems };
    });
  }
}