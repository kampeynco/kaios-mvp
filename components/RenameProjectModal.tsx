import React, { useState, useEffect } from 'react';

interface RenameProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => void;
  currentName: string;
}

export const RenameProjectModal: React.FC<RenameProjectModalProps> = ({ isOpen, onClose, onRename, currentName }) => {
  const [projectName, setProjectName] = useState(currentName);

  useEffect(() => {
    if (isOpen) {
      setProjectName(currentName);
    }
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[480px] flex flex-col transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="px-8 py-8 flex-1">
          <h2 className="text-2xl font-serif font-medium text-text-main mb-8">Rename Project</h2>
          
          <div>
            <label className="block text-sm font-medium text-text-main mb-2">Name</label>
            <input 
              type="text" 
              className="w-full px-2 py-2 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none focus:ring-0 text-base placeholder:text-gray-300 transition-colors caret-black"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && projectName.trim()) {
                  onRename(projectName);
                }
              }}
            />
          </div>
        </div>

        <div className="px-8 py-5 bg-gray-50 flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-text-sub hover:text-text-main hover:bg-gray-200/50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onRename(projectName)}
            disabled={!projectName.trim()}
            className="px-5 py-2.5 text-sm font-medium text-white bg-black hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-black rounded-lg transition-colors shadow-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};