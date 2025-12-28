import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Stack,
  Spinner,
  Table,
  Icon,
  Input,
  Dialog,
  Badge,
  IconButton
} from '@chakra-ui/react';
import {
  Loader2, Upload, Trash2, File as FileIcon, Download, AlertCircle, CheckCircle,
  Folder, Plus, ChevronRight, HardDrive
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';

interface FileItem {
  id: string;
  name: string;
  originalName?: string;
  size: number;
  type: string;
  updated_at: string;
  created_at: string;
  path: string;
  url: string;
}

interface FilesScreenProps {
  activeWorkspaceId: string;
}

// Draggable File Row Component
const FileRow = ({ file, selected, onSelect, onDelete }: { file: FileItem, selected: boolean, onSelect: (path: string) => void, onDelete: () => void }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: file.path,
    data: { file }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 999,
  } : undefined;

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b transition-colors hover:bg-gray-50"
      {...listeners}
      {...attributes}
    >
      <td className="p-4 align-middle">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            // Prevent drag? listeners are on row.
            onSelect(file.path);
          }}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          onPointerDown={(e) => e.stopPropagation()}
        />
      </td>
      <td className="p-4 align-middle font-medium">
        <div className="flex items-center gap-2">
          <FileIcon className="h-4 w-4 text-gray-500" />
          <span className="truncate max-w-[200px]" title={file.name}>{file.name}</span>
        </div>
      </td>
      <td className="p-4 align-middle text-gray-500">{new Date(file.created_at).toLocaleDateString()}</td>
      <td className="p-4 align-middle text-gray-500">{(file.size / 1024).toFixed(1)} KB</td>
      <td className="p-4 align-middle text-right" onPointerDown={(e) => e.stopPropagation()}>
        <div className="flex justify-end gap-2">
          <a
            href={file.url}
            download={file.name}
            target="_blank"
            rel="noreferrer"
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title="Download"
          >
            <Download className="h-4 w-4 text-gray-500" />
          </a>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 hover:bg-red-50 rounded-md transition-colors text-red-500"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Droppable Folder Item Component
const FolderItem = ({ name, path, isActive, onClick, isMain = false }: { name: string, path: string, isActive: boolean, onClick: () => void, isMain?: boolean }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: path,
    data: { path, isFolder: true }
  });

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={`
        flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors
        ${isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}
        ${isOver ? 'bg-indigo-100 ring-2 ring-indigo-300' : ''}
      `}
    >
      {isMain ? <HardDrive className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
      <span className="truncate">{name}</span>
    </div>
  );
};

export const FilesScreen: React.FC<FilesScreenProps> = ({ activeWorkspaceId }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // Folder State
  const [currentFolder, setCurrentFolder] = useState<string | null>(null); // null = Workspace Drive
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const workspaceId = activeWorkspaceId;

  const loadData = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError(null);
    try {
      // Load Folders (Top Level)
      const folderList = await storageService.listFolders('workspace-files', workspaceId);
      setFolders(folderList);

      // Load Files based on view
      const path = currentFolder ? `${workspaceId}/${currentFolder}` : workspaceId;
      const recursive = currentFolder === null;

      const fileList = await storageService.listFiles('workspace-files', path, recursive);
      setFiles(fileList);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, currentFolder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !active.data.current?.file) return;

    const file = active.data.current.file as FileItem;
    const targetPath = over.id as string;

    // Don't move if dropped on same folder or invalid
    if (targetPath === currentFolder) return;
    // Dropping on "ROOT" -> Move to root

    let destinationPath = '';
    if (targetPath === 'ROOT') {
      destinationPath = `${workspaceId}/${file.name}`;
    } else {
      destinationPath = `${workspaceId}/${targetPath}/${file.name}`;
    }

    if (file.path === destinationPath) return;

    try {
      setLoading(true);
      await storageService.moveFile('workspace-files', file.path, destinationPath);
      await loadData();
    } catch (err: any) {
      console.error('Move failed:', err);
      setError(`Failed to move file: ${err.message}`);
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !workspaceId) return;
    try {
      setLoading(true);
      await storageService.createFolder('workspace-files', `${workspaceId}/${newFolderName}`);
      setNewFolderName('');
      setIsCreatingFolder(false);
      await loadData();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !workspaceId) return;

    setUploading(true);
    setError(null);

    try {
      const uploadPath = currentFolder ? `${workspaceId}/${currentFolder}` : workspaceId;
      // Pass full path to uploadFile, relying on it to handle 'path' logic correctly.
      // storageService.uploadFile implementation concatenates {workspaceId}/{filename}.
      // To support subfolders without changing uploadFile signature too much, 
      // we can pass the folder path as the 'workspaceId' argument if that implementation aligns.
      // Checking storageService.ts: const filePath = `${workspaceId}/${fileName}`;
      // So passing `${workspaceId}/${currentFolder}` works perfectly.

      const { data, error } = await storageService.uploadFile('workspace-files', uploadPath, file);
      if (error) throw error;

      await loadData();
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDelete = async (path: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      await storageService.deleteFile('workspace-files', path);
      setFiles(prev => prev.filter(f => f.path !== path));
      setSelectedFiles(prev => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    if (!confirm(`Delete ${selectedFiles.size} files?`)) return;
    try {
      await storageService.deleteFile('workspace-files', Array.from(selectedFiles));
      await loadData();
      setSelectedFiles(new Set());
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredFiles = useMemo(() => {
    return files.filter(file =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [files, searchQuery]);

  const toggleSelect = (path: string) => {
    const next = new Set(selectedFiles);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setSelectedFiles(next);
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) setSelectedFiles(new Set());
    else setSelectedFiles(new Set(filteredFiles.map(f => f.path)));
  };

  if (!workspaceId) return null;

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Box className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <Heading size="md" className="text-gray-900">Files</Heading>
            <Badge colorScheme="indigo" variant="subtle" className="px-2 py-1 rounded-md">
              {currentFolder ? currentFolder : 'Workspace Drive'}
            </Badge>
          </div>
          <HStack gap={3}>
            {selectedFiles.size > 0 && (
              <Button
                size="sm"
                colorScheme="red"
                variant="outline"
                leftIcon={<Trash2 size={16} />}
                onClick={handleBulkDelete}
              >
                Delete Selected ({selectedFiles.size})
              </Button>
            )}
            <div className="relative">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
              <label htmlFor="file-upload">
                <Button as="span" size="sm" colorScheme="indigo" leftIcon={<Upload size={16} />} isLoading={uploading} cursor="pointer">
                  Upload File
                </Button>
              </label>
            </div>
          </HStack>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-6 py-2 text-sm flex items-center gap-2 border-b border-red-100">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r bg-gray-50 flex flex-col shrink-0">
            <div className="p-4 space-y-2 overflow-y-auto flex-1">
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" className="mb-2 px-2">Storage</Text>

              <FolderItem
                name="Workspace Drive"
                path="ROOT"
                isActive={currentFolder === null}
                isMain={true}
                onClick={() => setCurrentFolder(null)}
              />

              <div className="my-2 border-t border-gray-200"></div>

              {folders.map(folder => (
                <FolderItem
                  key={folder}
                  name={folder}
                  path={folder}
                  isActive={currentFolder === folder}
                  onClick={() => setCurrentFolder(folder)}
                />
              ))}

              {isCreatingFolder ? (
                <div className="px-2 mt-2">
                  <Input
                    size="sm"
                    autoFocus
                    placeholder="Folder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onBlur={() => { if (!newFolderName) setIsCreatingFolder(false); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateFolder();
                      if (e.key === 'Escape') setIsCreatingFolder(false);
                    }}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setIsCreatingFolder(true)}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-500 hover:text-indigo-600 mt-2 w-full text-left"
                >
                  <Plus size={14} /> New Folder
                </button>
              )}
            </div>
          </div>

          {/* File Table */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {/* Search Bar Row */}
            <div className="p-4 border-b bg-white">
              <Input
                placeholder="Search files..."
                size="sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                maxW="300px"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              <Table variant="simple" size="sm">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 w-8">
                      <input
                        type="checkbox"
                        checked={filteredFiles.length > 0 && selectedFiles.size === filteredFiles.length}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading && files.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="animate-spin h-6 w-6 text-indigo-500" />
                          <Text>Loading files...</Text>
                        </div>
                      </td>
                    </tr>
                  ) : filteredFiles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-gray-500">
                        <div className="flex flex-col items-center gap-2 py-8">
                          <div className="bg-gray-100 p-3 rounded-full">
                            <Folder className="h-6 w-6 text-gray-400" />
                          </div>
                          <Text className="font-medium text-gray-900">No files found</Text>
                          <Text className="text-sm">Upload a file or drag one here.</Text>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredFiles.map((file) => (
                      <FileRow
                        key={file.path}
                        file={file}
                        selected={selectedFiles.has(file.path)}
                        onSelect={toggleSelect}
                        onDelete={() => handleDelete(file.path)}
                      />
                    ))
                  )}
                </tbody>
              </Table>
            </div>
            <div className="p-2 border-t text-xs text-center text-gray-400">
              {files.length} files • {currentFolder ? `Viewing ${currentFolder}` : 'Recursive View'}
            </div>
          </div>
        </div>
      </Box>
    </DndContext>
  );
};