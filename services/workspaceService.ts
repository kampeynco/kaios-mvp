import { supabase } from '../index';
import { Database } from '../types/supabase';

type Workspace = Database['public']['Tables']['workspaces']['Row'];
type WorkspaceInvite = Database['public']['Tables']['workspace_invites']['Row'];

export const workspaceService = {
    async createWorkspace(name: string, userId: string) {
        // 1. Create Workspace
        const { data: workspace, error: wsError } = await supabase
            .from('workspaces')
            .insert({ name })
            .select()
            .single();

        if (wsError) throw wsError;

        // 2. Add creator as Owner
        const { error: memberError } = await supabase
            .from('workspace_members')
            .insert({
                workspace_id: workspace.id,
                user_id: userId,
                role: 'owner',
            });

        if (memberError) {
            // Rollback workspace creation if member addition fails (clean up)
            await supabase.from('workspaces').delete().eq('id', workspace.id);
            throw memberError;
        }

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
