// src/services/supabase.service.ts

import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js' 
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const { supabaseUrl, supabaseKey } = environment;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase URL and Key must be provided in environment.ts');
    }

    if (supabaseUrl.includes('COLOQUE_SUA_SUPABASE_URL_AQUI') || supabaseUrl.includes('xyz-placeholder-project-id')) {
        console.warn(`
          ********************************************************************************
          *                                                                              *
          *           ! ATENÇÃO: As credenciais do Supabase não foram definidas. !        *
          *                                                                              *
          *    Por favor, edite o arquivo 'src/environments/environment.ts' e substitua   *
          *    os valores de 'supabaseUrl' e 'supabaseKey' com suas credenciais reais.    *
          *    A aplicação não conseguirá buscar ou salvar dados até que isso seja feito. *
          *                                                                              *
          ********************************************************************************
        `);
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }
}
