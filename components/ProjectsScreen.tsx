import React, { useState, useEffect, useRef } from 'react';
import { Folder, Plus, MoreHorizontal, Pencil, Trash2, AlertTriangle } from 'lucide-react';

interface ProjectsScreenProps {
  projects: string[];
  onNewProject: () => void;
  onRenameProject: (index: number) => void;
  onDeleteProject: (index: number) => void;
}

export const ProjectsScreen: React.FC<ProjectsScreenProps> = ({ 
  projects, 
  onNewProject,
  onRenameProject,
  onDeleteProject 
}) => {
  const [activeProject, setActiveProject] = useState<string>(projects[0] || '');
  const [prompt, setPrompt] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ index: number; name: string } | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!projects.includes(activeProject) && projects.length > 0) {
      setActiveProject(projects[0]);
    } else if (projects.length === 0) {
      setActiveProject('');
    }
  }, [projects, activeProject]);

  // Mock data to match the screenshot
  const projectFiles = [
    {
        title: "Fundraising service agreement",
        preview: "Follow that with another message asking if she's had time to review the updated agreement. And if there ...",
        date: "Dec 26"
    },
    {
        title: "Document conflict review",
        preview: "provided full updated version",
        date: "Dec 22"
    },
    {
        title: "Payment arrangement addendum",
        preview: "1000 for 7 months and 500 for 1 month",
        date: "Dec 19"
    },
    {
        title: "Resignation letter draft",
        preview: "add that your open to a payment arrangement",
        date: "Dec 19"
    }
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Handle submit here if needed
      setPrompt('');
    }
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation) {
      onDeleteProject(deleteConfirmation.index);
      setDeleteConfirmation(null);
    }
  };

  return (
    <div className="flex h-full bg-white dark:bg-background-dark relative transition-colors duration-300">
      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm"
          onClick={() => setDeleteConfirmation(null)}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-[400px] overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-main dark:text-white">Delete Project?</h3>
                <p className="text-sm text-text-sub dark:text-gray-400 mt-1">
                  Are you sure you want to delete <span className="font-medium text-text-main dark:text-white">"{deleteConfirmation.name}"</span>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 text-sm font-medium text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inner Sidebar */}
      <aside className="w-64 bg-white dark:bg-background-dark border-r border-gray-200 dark:border-gray-800 flex-shrink-0 flex flex-col transition-colors duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-serif text-xl font-medium text-text-main dark:text-white">Projects</h2>
          <p className="text-xs text-text-sub dark:text-gray-400 mt-1">Organize your campaign work</p>
        </div>
        <div className="p-4">
            <button 
                onClick={onNewProject}
                className="w-full flex items-center gap-2 justify-center px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors mb-4"
            >
                <Plus className="w-4 h-4" />
                New Project
            </button>
            <nav className="space-y-1">
            {projects.map((project, idx) => (
                <div
                    key={idx}
                    onClick={() => setActiveProject(project)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group cursor-pointer ${
                        activeProject === project
                        ? 'bg-gray-100 dark:bg-gray-800 text-text-main dark:text-white'
                        : 'text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                    <div className="flex items-center gap-3 truncate pointer-events-none">
                        <Folder className={`w-4 h-4 ${activeProject === project ? 'text-black dark:text-white' : 'text-gray-400'}`} />
                        <span className="truncate">{project}</span>
                    </div>
                    
                    <div className="relative">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setDropdownOpen(dropdownOpen === idx ? null : idx);
                            }}
                            className={`p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                                dropdownOpen === idx 
                                    ? 'opacity-100 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200' 
                                    : 'opacity-0 group-hover:opacity-100 text-gray-400'
                            }`}
                        >
                           <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {dropdownOpen === idx && (
                            <div 
                                ref={dropdownRef}
                                className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right"
                                onClick={(e) => e.stopPropagation()} 
                            >
                                <button 
                                    onClick={() => {
                                        setDropdownOpen(null);
                                        onRenameProject(idx);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                                >
                                    <Pencil className="w-3.5 h-3.5 text-gray-400" />
                                    Rename
                                </button>
                                <button 
                                    onClick={() => {
                                        setDropdownOpen(null);
                                        setDeleteConfirmation({ index: idx, name: project });
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            </nav>
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-12">
            {activeProject ? (
                <div className="animate-in fade-in duration-300">
                     {/* Header */}
                     <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Folder className="w-8 h-8 text-text-main dark:text-white" strokeWidth={1.5} />
                            <h1 className="text-3xl font-display font-normal text-text-main dark:text-white tracking-tight">{activeProject}</h1>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-text-main dark:text-white shadow-sm">
                           <span className="material-symbols-outlined text-gray-400 text-[20px]">folder</span>
                           10 files
                       </button>
                    </div>

                    {/* Chat Input Container */}
                    <div className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden transition-all focus-within:shadow-[0_4px_12px_rgba(0,0,0,0.08)] focus-within:border-gray-300 dark:focus-within:border-gray-700 group mb-12">
                      <div className="p-1">
                        <label className="sr-only" htmlFor="prompt-input">Prompt Input</label>
                        <textarea 
                          id="prompt-input" 
                          className="w-full h-[140px] resize-none border-none bg-transparent p-5 text-lg text-text-main dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:ring-0 font-light" 
                          placeholder={`Start a new chat in ${activeProject}...`}
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          onKeyDown={handleKeyDown}
                        />
                      </div>
                      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 transition-colors">
                        <div className="flex items-center gap-1 h-9">
                          <button className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" title="Attach">
                            <span className="material-symbols-outlined text-[20px] -rotate-45">attachment</span>
                          </button>
                          <div className="relative inline-block h-full flex items-center">
                            <select className="appearance-none bg-transparent border-none text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 pr-6 pl-2 py-0 cursor-pointer focus:ring-0 h-full flex items-center outline-none">
                              <option className="dark:bg-gray-900">General</option>
                              <option className="dark:bg-gray-900">Specific</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-400">
                              {/* Dropdown arrow handled by default or could be custom */}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="flex items-center justify-center rounded-lg h-9 w-9 text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">mic</span>
                          </button>
                          <button 
                            className="flex items-center justify-center gap-2 rounded-lg h-9 w-9 bg-[#0f172a] dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-[#1e293b] dark:hover:bg-gray-200 transition-colors shadow-sm group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!prompt.trim()}
                          >
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                    </div>

                   {/* File List */}
                   <div className="space-y-0">
                       {projectFiles.map((file, idx) => (
                           <div key={idx} className="group flex items-start justify-between py-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 -mx-4 px-4 rounded-lg transition-colors cursor-pointer">
                               <div className="flex-1 min-w-0 pr-8">
                                   <h3 className="font-medium text-text-main dark:text-white mb-1">{file.title}</h3>
                                   <p className="text-sm text-text-sub dark:text-gray-400 truncate">{file.preview}</p>
                               </div>
                               <span className="text-sm text-gray-400 whitespace-nowrap">{file.date}</span>
                           </div>
                       ))}
                   </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-text-sub dark:text-gray-400">
                    <Folder className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <p>Select a project to view details</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};