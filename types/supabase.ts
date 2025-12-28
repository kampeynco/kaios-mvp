export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    avatar_url: string | null
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    avatar_url?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    updated_at?: string | null
                }
            }
            workspaces: {
                Row: {
                    id: string
                    name: string
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    created_at?: string | null
                }
            }
            workspace_members: {
                Row: {
                    id: string
                    workspace_id: string
                    user_id: string
                    role: 'owner' | 'admin' | 'member'
                    joined_at: string | null
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    user_id: string
                    role?: 'owner' | 'admin' | 'member'
                    joined_at?: string | null
                }
                Update: {
                    id?: string
                    workspace_id?: string
                    user_id?: string
                    role?: 'owner' | 'admin' | 'member'
                    joined_at?: string | null
                }
            },
            workspace_invites: {
                Row: {
                    id: string
                    workspace_id: string
                    email: string
                    role: 'owner' | 'admin' | 'member'
                    invited_by: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    email: string
                    role?: 'owner' | 'admin' | 'member'
                    invited_by?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    workspace_id?: string
                    email?: string
                    role?: 'owner' | 'admin' | 'member'
                    invited_by?: string | null
                    created_at?: string | null
                }
            }
        }
        Enums: {
            workspace_role: 'owner' | 'admin' | 'member'
        }
    }
}
