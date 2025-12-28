export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
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
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey"
                        columns: ["id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            workspaces: {
                Row: {
                    id: string
                    name: string
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            workspace_members: {
                Row: {
                    id: string
                    workspace_id: string
                    user_id: string
                    role: Database["public"]["Enums"]["workspace_role"]
                    joined_at: string | null
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    user_id: string
                    role?: Database["public"]["Enums"]["workspace_role"]
                    joined_at?: string | null
                }
                Update: {
                    id?: string
                    workspace_id?: string
                    user_id?: string
                    role?: Database["public"]["Enums"]["workspace_role"]
                    joined_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "workspace_members_workspace_id_fkey"
                        columns: ["workspace_id"]
                        isOneToOne: false
                        referencedRelation: "workspaces"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "workspace_members_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            workspace_invites: {
                Row: {
                    id: string
                    workspace_id: string
                    email: string
                    role: Database["public"]["Enums"]["workspace_role"]
                    invited_by: string
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    email: string
                    role?: Database["public"]["Enums"]["workspace_role"]
                    invited_by: string
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    workspace_id?: string
                    email?: string
                    role?: Database["public"]["Enums"]["workspace_role"]
                    invited_by?: string
                    created_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "workspace_invites_workspace_id_fkey"
                        columns: ["workspace_id"]
                        isOneToOne: false
                        referencedRelation: "workspaces"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "workspace_invites_invited_by_fkey"
                        columns: ["invited_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            candidate_profiles: {
                Row: {
                    id: string
                    workspace_id: string
                    full_name: string | null
                    bio: string | null
                    core_values: string | null
                    platform_issues: Json | null
                    opponents: Json | null
                    brand_kit: Json | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    full_name?: string | null
                    bio?: string | null
                    core_values?: string | null
                    platform_issues?: Json | null
                    opponents?: Json | null
                    brand_kit?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    workspace_id?: string
                    full_name?: string | null
                    bio?: string | null
                    core_values?: string | null
                    platform_issues?: Json | null
                    opponents?: Json | null
                    brand_kit?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "candidate_profiles_workspace_id_fkey"
                        columns: ["workspace_id"]
                        isOneToOne: true
                        referencedRelation: "workspaces"
                        referencedColumns: ["id"]
                    }
                ]
            }
            guardrails: {
                Row: {
                    id: string
                    workspace_id: string
                    approved_topics: Json | null
                    forbidden_topics: Json | null
                    tone_style: Json | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    approved_topics?: Json | null
                    forbidden_topics?: Json | null
                    tone_style?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    workspace_id?: string
                    approved_topics?: Json | null
                    forbidden_topics?: Json | null
                    tone_style?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "guardrails_workspace_id_fkey"
                        columns: ["workspace_id"]
                        isOneToOne: true
                        referencedRelation: "workspaces"
                        referencedColumns: ["id"]
                    }
                ]
            }
            projects: {
                Row: {
                    id: string
                    workspace_id: string
                    name: string
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    name: string
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    workspace_id?: string
                    name?: string
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "projects_workspace_id_fkey"
                        columns: ["workspace_id"]
                        isOneToOne: false
                        referencedRelation: "workspaces"
                        referencedColumns: ["id"]
                    }
                ]
            }
            drafts: {
                Row: {
                    id: string
                    workspace_id: string
                    project_id: string | null
                    type: string
                    title: string
                    content: string | null
                    status: string | null
                    metadata: Json | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    project_id?: string | null
                    type: string
                    title: string
                    content?: string | null
                    status?: string | null
                    metadata?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    workspace_id?: string
                    project_id?: string | null
                    type?: string
                    title?: string
                    content?: string | null
                    status?: string | null
                    metadata?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "drafts_workspace_id_fkey"
                        columns: ["workspace_id"]
                        isOneToOne: false
                        referencedRelation: "workspaces"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "drafts_project_id_fkey"
                        columns: ["project_id"]
                        isOneToOne: false
                        referencedRelation: "projects"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            is_workspace_member: {
                Args: {
                    _workspace_id: string
                }
                Returns: boolean
            }
        }
        Enums: {
            workspace_role: "owner" | "admin" | "member"
        }
    }
}
