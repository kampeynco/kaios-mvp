import { supabase } from './supabaseClient';
import { Database } from '../database.types';

export type Draft = Database['public']['Tables']['drafts']['Row'];
export type DraftInsert = Database['public']['Tables']['drafts']['Insert'];
export type DraftUpdate = Database['public']['Tables']['drafts']['Update'];

export const draftService = {
    async getDrafts(workspaceId: string, projectId?: string): Promise<Draft[]> {
        let query = supabase
            .from('drafts')
            .select('*')
            .eq('workspace_id', workspaceId);

        if (projectId) {
            query = query.eq('project_id', projectId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching drafts:', error);
            throw error;
        }

        return data || [];
    },

    async createDraft(draft: DraftInsert): Promise<Draft> {
        const { data, error } = await supabase
            .from('drafts')
            .insert(draft)
            .select()
            .single();

        if (error) {
            console.error('Error creating draft:', error);
            throw error;
        }

        return data;
    },

    async updateDraft(id: string, updates: DraftUpdate): Promise<Draft> {
        const { data, error } = await supabase
            .from('drafts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating draft:', error);
            throw error;
        }

        return data;
    },

    async deleteDraft(id: string): Promise<void> {
        const { error } = await supabase
            .from('drafts')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting draft:', error);
            throw error;
        }
    }
};
