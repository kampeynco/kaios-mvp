import { supabase } from './supabaseClient';

export const storageService = {
    async uploadFile(bucket: string, workspaceId: string, file: File) {
        const fileExt = file.name.split('.').pop();
        // Sanitize filename: replace non-alphanumeric chars (except . - _) with _
        const sanitizedName = file.name.substring(0, file.name.lastIndexOf('.')).replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50);
        // Append timestamp to ensure uniqueness while keeping it readable
        const fileName = `${sanitizedName}_${Date.now()}.${fileExt}`;
        const filePath = `${workspaceId}/${fileName}`;

        // Supabase storage metadata
        const metadata = {
            originalName: file.name,
            mimetype: file.type,
            size: file.size
        };

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type,
                metadata: metadata // Store validation metadata
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return {
            id: data.path,
            url: publicUrl,
            path: data.path,
            name: file.name,
            size: file.size,
            type: file.type
        };
    },

    async deleteFile(bucket: string, path: string) {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([path]);

        if (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    },

    async listFiles(bucket: string, workspaceId: string) {
        const { data, error } = await supabase.storage
            .from(bucket)
            .list(workspaceId, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' },
            });

        if (error) throw error;

        return data.map(file => ({
            id: `${workspaceId}/${file.name}`,
            // Use original name if available in metadata, otherwise cleaner fallback or raw name
            name: file.metadata?.originalName || file.name,
            size: file.metadata?.size || 0,
            type: file.metadata?.mimetype || 'application/octet-stream',
            updated_at: file.updated_at,
            created_at: file.created_at, // Ensure created_at is passed
            path: `${workspaceId}/${file.name}`,
            url: supabase.storage.from(bucket).getPublicUrl(`${workspaceId}/${file.name}`).data.publicUrl
        }));
    }
};
