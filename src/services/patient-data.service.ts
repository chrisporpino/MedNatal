import { Injectable, signal, Signal, inject, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';

// Interfaces alinhadas com o schema do Supabase
export interface Consulta {
  id: string; // UUID
  patient_id: string;
  date: string;
  gestational_age: string;
  weight_kg: number;
  blood_pressure: string;
  uterine_height_cm: number;
  fetal_heart_rate_bpm: number;
  fetal_movements: 'Presente' | 'Ausente';
  notes: string;
  created_at: string;
}

export interface Parity {
  gestations: number;
  parities: number;
  abortions: number;
}

export interface ObstetricHistory {
  id: string; // UUID
  patient_id: string;
  baby_name: string;
  gestational_age_at_birth: string;
  baby_weight: string;
  delivery_type: string;
  created_at: string;
}

export interface Exam {
  id: string; // UUID
  patient_id: string;
  date: string;
  type: string;
  status: 'Normal' | 'Alterado' | 'Pendente';
  main_result: string;
  report_url?: string;
  gestational_age_at_collection: string;
  created_at: string;
}

export interface EcoData {
  id: string; // UUID
  patient_id: string;
  date: string;
  gestational_age_weeks: number;
  estimated_fetal_weight_grams: number;
  fetal_heart_rate_bpm: number;
  placenta_presentation: string;
  report_url?: string;
  created_at: string;
}

export interface FetalGrowthPercentile {
  week: number;
  p10: number;
  p50: number;
  p90: number;
}

export interface Patient {
  id: string; // UUID
  name: string;
  cpf: string;
  birth_date: string;
  profession: string;
  phone: string;
  email: string;
  address: string;
  avatar_url: string;

  // Campos aninhados ou compostos
  parity: Parity;
  
  // Históricos
  allergies: string;
  medications_in_use: string;
  chronic_diseases: string;
  obstetric_histories: ObstetricHistory[]; // Renomeado para plural e alinhado com DB
  
  gestational_calculator: {
    dum: string;
    dum_is_reliable: boolean;
    first_ultrasound_date: string;
    first_ultrasound_ga: string; 
    official_calculation_basis: 'DUM' | 'USG';
  };
  
  // Dados calculados ou de estado
  risk_status: 'Baixo Risco' | 'Alto Risco';
  edd: string; // Expected Date of Delivery
  
  // Séries temporais para gráficos
  maternal_weight_entries: { week: number; weight: number }[];
  uterine_height_entries: { week: number; height: number }[];
  
  // Outros
  pending_items: { text: string; urgent: boolean }[];
  consultas: Consulta[];
  exams: Exam[];
  ultrasounds: EcoData[];

  // Dados que podem ser derivados ou são de UI
  age: number; // Será calculado a partir de birth_date
  gestationalAge: { weeks: number; days: number; }; // Calculado
  latestMeasurements: { weight: string; bloodPressure: string; fetalHeartRate: string; date: string; }; // Derivado da última consulta
  examAlert?: { message: string }; // Lógica de UI
  fetalGrowthPercentiles: FetalGrowthPercentile[]; // Isso pode ser um dado fixo/de configuração
}

export interface PatientListItem {
  id: string; // UUID
  name: string;
  gestational_age: string;
  edd: string;
  risk: 'Alto Risco' | 'Baixo Risco';
  cpf: string;
}


@Injectable({
  providedIn: 'root',
})
export class PatientDataService {
  private supabase = inject(SupabaseService).getSupabaseClient();
  
  private patientListSignal = signal<PatientListItem[]>([]);
  private patientSignal = signal<Patient | null>(null);
  
  isLoadingList = signal(false);
  isLoadingPatient = signal(false);

  // Expose signals as readonly to the outside world
  getPatientList(): Signal<PatientListItem[]> {
    return this.patientListSignal.asReadonly();
  }

  getCurrentPatient(): Signal<Patient | null> {
    return this.patientSignal.asReadonly();
  }

  // --- Data Fetching Methods ---

  async loadPatientList(): Promise<void> {
    this.isLoadingList.set(true);
    const { data, error } = await this.supabase
      .from('patients')
      .select('id, name, cpf, edd, risk_status, dum') // Select individual column `dum`
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching patient list:', error.message, error);
      this.patientListSignal.set([]);
    } else {
      const patientListItems = data.map(p => ({
        id: p.id,
        name: p.name,
        cpf: p.cpf,
        edd: p.edd ? new Date(p.edd).toLocaleDateString('pt-BR') : 'N/A',
        risk: p.risk_status,
        gestational_age: this.calculateGestationalAge(p.dum).ig, // Use p.dum directly
      }));
      this.patientListSignal.set(patientListItems);
    }
    this.isLoadingList.set(false);
  }
  
  async setCurrentPatient(id: string): Promise<void> {
    if (!id) {
      this.patientSignal.set(null);
      return;
    }
    this.isLoadingPatient.set(true);

    const { data, error } = await this.supabase
      .from('patients')
      .select(`
        *,
        obstetric_histories(*),
        consultations(*),
        exams(*),
        ultrasounds(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching patient data:', error.message, error);
      this.patientSignal.set(null);
    } else if (data) {
        const transformedPatient = this.transformDbToPatient(data);
        this.patientSignal.set(transformedPatient);
    }
    this.isLoadingPatient.set(false);
  }

  // --- Data Mutation Methods ---

  async addPatient(patientData: any): Promise<any> {
    const newPatientData = {
        name: patientData.fullName,
        cpf: patientData.cpf,
        birth_date: patientData.birthDate,
        phone: patientData.contact,
        // Flattened parity properties
        gestations: patientData.g,
        parities: patientData.p,
        abortions: patientData.a,
        // Flattened calculator properties
        dum: patientData.dum,
    };

    const { data, error } = await this.supabase
        .from('patients')
        .insert([newPatientData])
        .select()
        .single();
    
    if (error) {
        console.error('Error adding patient:', error.message, error);
        return null;
    }

    await this.loadPatientList(); // Refresh the list
    return data;
  }
  
  async updatePatient(patientId: string, updatedData: Partial<any>): Promise<void> {
    let dataToSend = { ...updatedData };

    // If gestational_calculator object exists, flatten it for the DB update
    if (dataToSend.gestational_calculator) {
      const calculatorData = dataToSend.gestational_calculator;
      delete dataToSend.gestational_calculator;
      dataToSend = { ...dataToSend, ...calculatorData };
    }

    // If parity object exists, flatten it for the DB update
    if (dataToSend.parity) {
        const parityData = dataToSend.parity;
        delete dataToSend.parity;
        dataToSend = { ...dataToSend, ...parityData };
    }
    
    const { error } = await this.supabase
      .from('patients')
      .update(dataToSend)
      .eq('id', patientId);

    if (error) {
      console.error("Error updating patient:", error.message, error);
    } else {
      await this.setCurrentPatient(patientId);
    }
  }
  
  // --- Helpers ---
  private calculateGestationalAge(dum: string | null): { ig: string; edd: string } {
    if (!dum) return { ig: 'N/A', edd: 'N/A' };
    
    const startDate = new Date(dum + 'T00:00:00');
    if (isNaN(startDate.getTime())) return { ig: 'N/A', edd: 'N/A' };
    
    const dpp = new Date(startDate.getTime());
    dpp.setDate(dpp.getDate() + 280);

    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { ig: '0s 0d', edd: dpp.toLocaleDateString('pt-BR') };

    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;

    return {
      ig: `${weeks}s ${days}d`,
      edd: dpp.toLocaleDateString('pt-BR'),
    };
  }

  private transformDbToPatient(dbData: any): Patient {
    // Re-construct the gestational_calculator object from individual DB columns
    const gestational_calculator = {
      dum: dbData.dum,
      dum_is_reliable: dbData.dum_is_reliable,
      first_ultrasound_date: dbData.first_ultrasound_date,
      first_ultrasound_ga: dbData.first_ultrasound_ga,
      official_calculation_basis: dbData.official_calculation_basis
    };

    const { ig, edd } = this.calculateGestationalAge(gestational_calculator.dum);
    const age = dbData.birth_date ? new Date().getFullYear() - new Date(dbData.birth_date).getFullYear() : 0;
    const lastConsulta = dbData.consultations?.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    return {
      id: dbData.id,
      name: dbData.name,
      cpf: dbData.cpf,
      birth_date: dbData.birth_date,
      profession: dbData.profession,
      phone: dbData.phone,
      email: dbData.email,
      address: dbData.address,
      avatar_url: dbData.avatar_url || `https://i.pravatar.cc/150?u=${dbData.id}`,
      // Re-construct the parity object from individual DB columns
      parity: {
        gestations: dbData.gestations,
        parities: dbData.parities,
        abortions: dbData.abortions,
      },
      allergies: dbData.allergies,
      medications_in_use: dbData.medications_in_use,
      chronic_diseases: dbData.chronic_diseases,
      obstetric_histories: dbData.obstetric_histories || [],
      gestational_calculator: gestational_calculator, // Use the constructed object
      risk_status: dbData.risk_status,
      edd: edd,
      gestationalAge: {
        weeks: parseInt(ig.split('s')[0], 10) || 0,
        days: parseInt(ig.split('s')[1]?.replace('d','') || '0', 10),
      },
      latestMeasurements: lastConsulta ? {
          weight: `${lastConsulta.weight_kg} kg`,
          bloodPressure: `${lastConsulta.blood_pressure} mmHg`,
          fetalHeartRate: `${lastConsulta.fetal_heart_rate_bpm} bpm`,
          date: new Date(lastConsulta.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric'}),
      } : { weight: 'N/A', bloodPressure: 'N/A', fetalHeartRate: 'N/A', date: 'N/A'},
      maternal_weight_entries: dbData.consultations?.map((c: any) => ({ week: parseInt(c.gestational_age.split('s')[0]), weight: c.weight_kg })).filter((e:any) => !isNaN(e.week) && !isNaN(e.weight)) || [],
      uterine_height_entries: dbData.consultations?.map((c: any) => ({ week: parseInt(c.gestational_age.split('s')[0]), height: c.uterine_height_cm })).filter((e:any) => !isNaN(e.week) && !isNaN(e.height)) || [],
      pending_items: [], // Lógica a ser implementada
      consultas: dbData.consultations || [],
      exams: dbData.exams || [],
      ultrasounds: dbData.ultrasounds || [],
      examAlert: undefined, // Lógica a ser implementada
      fetalGrowthPercentiles: [], // Carregar de dados estáticos ou outra tabela
      age: age,
    };
  }

}