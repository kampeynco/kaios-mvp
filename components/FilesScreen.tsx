import React, { useState, useEffect, useCallback } from 'react';
import { FileUpload } from "@ark-ui/react/file-upload";
import { Upload, Trash2, FileText, Image, File as FileIcon, Download, FileSpreadsheet, FileArchive, Loader2, Search, AlertCircle } from "lucide-react";
import { storageService } from '../services/storageService';

interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
  created_at?: string;
  updated_at?: string;
}

interface FilesScreenProps {
  workspaceId: string | null;
}

const getFileExtension = (filename: string) => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toUpperCase() || '-' : '-';
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (type: string, name: string) => {
  const fileName = name.toLowerCase();
  if (type.startsWith('image/')) return <Image className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
  if (fileName.endsWith('.pdf')) return <FileText className="w-5 h-5 text-red-500 dark:text-red-400" />;
  if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx') || fileName.endsWith('.csv')) return <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />;
  if (fileName.endsWith('.zip') || fileName.endsWith('.rar')) return <FileArchive className="w-5 h-5 text-orange-500 dark:text-orange-400" />;
  if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) return <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
  return <FileIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
};

export const FilesScreen: React.FC<FilesScreenProps> = ({ workspaceId }) => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const toggleSelect = (path: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(path)) {
      newSelected.delete(path);
    } else {
      newSelected.add(path);
    }
    setSelectedFiles(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.path)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedFiles.size} files?`)) return;

    try {
      await storageService.deleteFile('workspace-files', Array.from(selectedFiles));
      // Optimistic update
      setFiles(prev => prev.filter(f => !selectedFiles.has(f.path)));
      setSelectedFiles(new Set());
    } catch (err: any) {
      console.error('Bulk delete failed:', err);
      setError(`Bulk delete failed: ${err.message}`);
    }
  };

  const loadFiles = useCallback(async () => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const data = await storageService.listFiles('workspace-files', workspaceId);
      // Sort by updated_at or created_at desc
      const sorted = data.sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
        const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
        return dateB - dateA;
      });
      setFiles(sorted as FileMetadata[]);
    } catch (err: any) {
      console.error('Failed to list files:', err);
      setError(err.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleUpload = async (details: any) => {
    if (!workspaceId) {
      setError("No active workspace session.");
      return;
    }

    // Ark UI FileUpload typically passes an event with details
    // We try to access acceptedFiles, details.files, or similar.
    // Based on common patterns: details.acceptedFiles is standard in some versions,
    // or just the event argument *is* the details object containing .files
    const bucketName = 'workspace-files';
    let filesToUpload: File[] = [];

    if (details.acceptedFiles) {
      filesToUpload = details.acceptedFiles;
    } else if (details.files) {
      filesToUpload = details.files;
    } else if (Array.isArray(details)) {
      filesToUpload = details;
    }

    if (!filesToUpload || filesToUpload.length === 0) {
      console.warn("No files found in upload event", details);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      for (const file of filesToUpload) {
        await storageService.uploadFile(bucketName, workspaceId, file);
      }
      await loadFiles();
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (path: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await storageService.deleteFile('workspace-files', path);
      // Optimistic update or reload
      setFiles(prev => prev.filter(f => f.path !== path));
    } catch (err: any) {
      console.error('Delete failed:', err);
      setError(`Delete failed: ${err.message}`);
    }
  };

  const handleDownload = (url: string, name: string) => {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-background-dark p-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-text-main dark:text-white mb-2">Files</h1>
            <p className="text-text-sub dark:text-gray-400">Manage your workspace documents.</p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-text-main dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
            />
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-800 dark:text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <FileUpload.Root
          maxFiles={5}
          onFileAccept={handleUpload}
          className="flex flex-col gap-8"
        >
          <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center justify-center border border-gray-100 dark:border-gray-700 text-gray-400">
                {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-main dark:text-white">
                  {uploading ? 'Uploading...' : 'Upload Documents'}
                </h3>
                <p className="text-xs text-text-sub dark:text-gray-400 mt-1">
                  PDF, Images, Excel, etc. Max 50MB.
                </p>
              </div>
            </div>
            <FileUpload.Trigger
              disabled={uploading}
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Select Files
            </FileUpload.Trigger>
          </div>
          <FileUpload.HiddenInput />
        </FileUpload.Root>

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-text-main dark:text-white mb-4">
            {loading ? 'Loading...' : `Uploaded Files (${filteredFiles.length})`}
          </h3>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">No files found.</p>
            </div>
          ) : (
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
              {/* Action Bar for Bulk Selection */}
              {selectedFiles.size > 0 && (
                <div className="flex items-center justify-between px-6 py-3 bg-blue-50 dark:bg-blue-900/20 text-sm">
                  <span className="text-blue-600 dark:text-blue-300 font-medium">
                    {selectedFiles.size} selected
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 px-3 py-1.5 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Selected
                  </button>
                </div>
              )}

              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-black focus:ring-black dark:border-gray-700 dark:bg-gray-800"
                    checked={filteredFiles.length > 0 && selectedFiles.size === filteredFiles.length}
                    onChange={toggleSelectAll}
                  />
                </div>
                <div className="col-span-5">Name</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredFiles.map(file => (
                  <div key={file.id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors group ${selectedFiles.has(file.path) ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}>
                    <div className="col-span-1 flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-black focus:ring-black dark:border-gray-700 dark:bg-gray-800"
                        checked={selectedFiles.has(file.path)}
                        onChange={() => toggleSelect(file.path)}
                      />
                    </div>
                    <div className="col-span-5 flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded text-gray-500 shrink-0">
                        {file.type.startsWith('image') ? (
                          <img src={file.url} alt={file.name} className="w-full h-full object-cover rounded" />
                        ) : getFileIcon(file.type, file.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-main dark:text-white truncate" title={file.name}>{file.name}</p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(file.created_at || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                        {getFileExtension(file.name)}
                      </span>
                    </div>
                    <div className="col-span-2 text-sm text-gray-500">
                      {formatSize(file.size)}
                    </div>
                    <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDownload(file.url, file.name)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Download className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(file.path)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};