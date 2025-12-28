import { supabase } from './supabaseClient';
import { Database } from '../types/supabase';

type Workspace = Database['public']['Tables']['workspaces']['Row'];
type WorkspaceInvite = Database['public']['Tables']['workspace_invites']['Row'];

export const workspaceService = {
    async createWorkspace(name: string, userId: string) {
        const { data: workspace, error } = await supabase
            .rpc('create_workspace', { name })
            .single();

        if (error) throw error;
        return workspace;
    },

    async inviteMembers(workspaceId: string, emails: string[], invitedBy: string) {
        if (emails.length === 0) return;

        const invites = emails.map((email) => ({
            workspace_id: workspaceId,
            email,
            role: 'member' as const,
            invited_by: invitedBy,
        }));

        const { error } = await supabase
            .from('workspace_invites')
            .insert(invites);

        if (error) throw error;
    },

    async getUserWorkspaces(userId: string) {
        const { data, error } = await supabase
            .from('workspace_members')
            .select(`
        workspace_id,
        role,
        workspaces:workspace_id (
            id,
            name,
            created_at
        )
      `)
            .eq('user_id', userId);

        if (error) throw error;
        // @ts-ignore - Supabase type inference on joins can be tricky, suppressing for specific joined structure
        return data.map(d => ({ ...d.workspaces, role: d.role }));
    }
};
