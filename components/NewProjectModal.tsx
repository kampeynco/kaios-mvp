import React, { useState, useRef, useEffect } from 'react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, memory: 'default' | 'project-only') => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onCreate }) => {
  if (!isOpen) return null;

  const [memoryType, setMemoryType] = useState<'default' | 'project-only'>('default');
  const [projectName, setProjectName] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setProjectName('');
      setMemoryType('default');
    }
  }, [isOpen]);

  const handleCreate = () => {
    if (projectName.trim()) {
      onCreate(projectName, memoryType);
    }
  };

  const options = [
    {
      value: 'default',
      label: 'Default',
      description: 'Project can access memories from outside chats, and vice versa.'
    },
    {
      value: 'project-only',
      label: 'Project-only',
      description: 'Project can only access its own memories. Its memories are hidden from outside chats.'
    }
  ];

  const selectedOption = options.find(o => o.value === memoryType) || options[0];

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[480px] flex flex-col transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="px-8 py-8 flex-1">
          <h2 className="text-2xl font-serif font-medium text-text-main mb-8">New Project</h2>
          
          <div className="space-y-8">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-text-main mb-2">Name</label>
              <input 
                type="text" 
                className="w-full px-2 py-2 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none focus:ring-0 text-base placeholder:text-gray-300 transition-colors caret-black"
                placeholder="e.g. Fall Campaign Strategy"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Memory Settings - Custom Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium text-text-main">Memory</label>
                <div className="group relative flex items-center">
                  <span className="material-symbols-outlined text-[16px] text-gray-400 cursor-help hover:text-gray-600 transition-colors">info</span>
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-[200px] px-3 py-1.5 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 text-center leading-relaxed">
                    Note that this setting can't be changed later.
                    <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
              
              <button 
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-2 py-2 bg-transparent border-b border-gray-300 hover:border-gray-400 focus:border-black outline-none flex items-center justify-between group transition-colors cursor-pointer text-left"
              >
                <div className="flex flex-col">
                  <span className="text-base text-text-main">{selectedOption.label}</span>
                </div>
                <span className={`material-symbols-outlined text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                  keyboard_arrow_down
                </span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
                  {options.map((option) => (
                    <div 
                      key={option.value}
                      onClick={() => {
                        setMemoryType(option.value as any);
                        setIsDropdownOpen(false);
                      }}
                      className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b last:border-b-0 border-gray-50 ${memoryType === option.value ? 'bg-gray-50' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-text-main">{option.label}</span>
                         {memoryType === option.value && (
                            <span className="material-symbols-outlined text-[18px] text-black">check</span>
                         )}
                      </div>
                      <p className="text-xs text-text-sub leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
            onClick={handleCreate}
            disabled={!projectName.trim()}
            className="px-5 py-2.5 text-sm font-medium text-white bg-black hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-black rounded-lg transition-colors shadow-sm"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
};