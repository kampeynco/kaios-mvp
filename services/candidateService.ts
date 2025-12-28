import { supabase } from './supabaseClient';
import { Database } from '../database.types';

export type CandidateProfile = Database['public']['Tables']['candidate_profiles']['Row'];
export type CandidateProfileInsert = Database['public']['Tables']['candidate_profiles']['Insert'];
export type CandidateProfileUpdate = Database['public']['Tables']['candidate_profiles']['Update'];

export const candidateService = {
    async getProfile(workspaceId: string): Promise<CandidateProfile | null> {
        const { data, error } = await supabase
            .from('candidate_profiles')
            .select('*')
            .eq('workspace_id', workspaceId)
            .maybeSingle();

        if (error) {
            console.error('Error fetching candidate profile:', error);
            throw error;
        }

        return data;
    },

    async upsertProfile(profile: CandidateProfileInsert | CandidateProfileUpdate): Promise<CandidateProfile> {
        const { data, error } = await supabase
            .from('candidate_profiles')
            .upsert(profile)
            .select()
            .single();

        if (error) {
            console.error('Error upserting candidate profile:', error);
            throw error;
        }

        return data;
    }
};
