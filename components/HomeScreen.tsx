import React, { useState } from 'react';

interface HomeScreenProps {
  onStartChat: (prompt: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartChat }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    if (prompt.trim()) {
      onStartChat(prompt);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const suggestionChips = [
    "Fundraising Email",
    "Press Release",
    "Analyze Opposition",
    "Talking Points"
  ];

  return (
    <div className="flex-1 overflow-y-auto flex items-center justify-center bg-white dark:bg-background-dark transition-colors duration-300">
      <div className="w-full max-w-[800px] px-6 flex flex-col items-center">
        <h1 className="text-4xl font-serif text-text-main dark:text-white mb-10 text-center transition-colors">What do you want to do today?</h1>
        
        <div className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden transition-all focus-within:shadow-[0_4px_12px_rgba(0,0,0,0.08)] focus-within:border-gray-300 dark:focus-within:border-gray-600 group">
          <div className="p-1">
            <label className="sr-only" htmlFor="prompt-input">Prompt Input</label>
            <textarea 
              id="prompt-input" 
              className="w-full h-[140px] resize-none border-none bg-transparent p-5 text-lg text-text-main dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:ring-0 font-light" 
              placeholder="Draft a fundraising email about the new bill..."
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
              <button className="flex items-center justify-center rounded-lg h-9 w-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </button>
              <button 
                onClick={handleSubmit}
                className="flex items-center justify-center gap-2 rounded-lg h-9 w-9 bg-[#0f172a] dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-[#1e293b] dark:hover:bg-gray-200 transition-colors shadow-sm group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!prompt.trim()}
              >
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          {suggestionChips.map((chip) => (
            <button 
              key={chip}
              onClick={() => onStartChat(`Help me write a ${chip.toLowerCase()}`)}
              className="px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-medium hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-all"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};