import { supabase } from './supabaseClient';
import { Database } from '../database.types';

export type Guardrail = Database['public']['Tables']['guardrails']['Row'];
export type GuardrailInsert = Database['public']['Tables']['guardrails']['Insert'];
export type GuardrailUpdate = Database['public']['Tables']['guardrails']['Update'];

export const guardrailService = {
    async getGuardrails(workspaceId: string): Promise<Guardrail | null> {
        const { data, error } = await supabase
            .from('guardrails')
            .select('*')
            .eq('workspace_id', workspaceId)
            .maybeSingle();

        if (error) {
            console.error('Error fetching guardrails:', error);
            throw error;
        }

        return data;
    },

    async upsertGuardrails(guardrails: GuardrailInsert | GuardrailUpdate): Promise<Guardrail> {
        const { data, error } = await supabase
            .from('guardrails')
            .upsert(guardrails)
            .select()
            .single();

        if (error) {
            console.error('Error upserting guardrails:', error);
            throw error;
        }

        return data;
    }
};
