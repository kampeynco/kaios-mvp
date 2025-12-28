import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { HomeScreen } from './components/HomeScreen';
import { ChatScreen } from './components/ChatScreen';
import { FilesScreen } from './components/FilesScreen';
import { CandidateProfileScreen } from './components/CandidateProfileScreen';
import { DraftsScreen } from './components/DraftsScreen';
import { GuardrailsScreen } from './components/GuardrailsScreen';
import { ProjectsScreen } from './components/ProjectsScreen';
import { NewProjectModal } from './components/NewProjectModal';
import { RenameProjectModal } from './components/RenameProjectModal';
import { generateResponse } from './services/geminiService';
import { ChatMessage } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'chats' | 'files' | 'candidate-profile' | 'drafts' | 'guardrails' | 'projects'>('home');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [projects, setProjects] = useState<string[]>(['Voter Outreach', 'Fall Campaign']);
  const [renamingProject, setRenamingProject] = useState<{ index: number; name: string } | null>(null);

  const handleStartChat = useCallback(async (initialPrompt: string) => {
    setView('chats');
    setIsLoading(true);

    // Add user message immediately
    const userMsg: ChatMessage = { role: 'user', text: initialPrompt };
    setMessages([userMsg]);

    try {
      const responseText = await generateResponse(initialPrompt);
      const aiMsg: ChatMessage = { role: 'model', text: responseText };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMsg: ChatMessage = { role: 'model', text: "I'm sorry, I encountered an error processing your request." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    setIsLoading(true);
    const userMsg: ChatMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);

    try {
      const responseText = await generateResponse(text);
      const aiMsg: ChatMessage = { role: 'model', text: responseText };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMsg: ChatMessage = { role: 'model', text: "I'm sorry, I encountered an error processing your request." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleNewChat = () => {
    setMessages([]);
    // Ensure we are on the chats view, although we likely already are
    setView('chats');
  };

  const handleCreateProject = (name: string, memory: 'default' | 'project-only') => {
    setProjects(prev => [...prev, name]);
    setShowNewProjectModal(false);
  };

  const handleRenameProject = (index: number) => {
    setRenamingProject({ index, name: projects[index] });
  };

  const handleRenameSubmit = (newName: string) => {
    if (renamingProject && newName.trim()) {
      setProjects(prev => {
        const updated = [...prev];
        updated[renamingProject.index] = newName.trim();
        return updated;
      });
      setRenamingProject(null);
    }
  };

  const handleDeleteProject = (index: number) => {
    setProjects(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex h-screen w-full flex-row bg-white dark:bg-background-dark">
      <Sidebar 
        onShowHome={() => setView('home')}
        onShowFiles={() => setView('files')}
        onShowCandidateProfile={() => setView('candidate-profile')}
        onShowDrafts={() => setView('drafts')}
        onShowGuardrails={() => setView('guardrails')}
        onShowProjects={() => setView('projects')}
        onShowChats={() => setView('chats')}
      />
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-background-dark relative transition-colors duration-300">
        <header className="h-16 border-b border-border-light dark:border-gray-800 flex items-center justify-between px-6 bg-white dark:bg-background-dark shrink-0 z-10 transition-colors duration-300">
          <div className="flex items-center gap-2 text-sm text-text-sub dark:text-gray-400">
            <span className="material-symbols-outlined text-[18px]">work</span>
            <span>Demo Candidate for Congress</span>
          </div>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <span className="material-symbols-outlined text-[20px]">more_horiz</span>
          </button>
        </header>

        {view === 'home' && (
          <HomeScreen onStartChat={handleStartChat} />
        )}
        
        {view === 'chats' && (
          <ChatScreen 
            messages={messages} 
            isLoading={isLoading} 
            onSendMessage={handleSendMessage}
            onNewChat={handleNewChat}
          />
        )}

        {view === 'files' && (
          <FilesScreen />
        )}

        {view === 'candidate-profile' && (
          <CandidateProfileScreen />
        )}

        {view === 'drafts' && (
          <DraftsScreen />
        )}

        {view === 'guardrails' && (
          <GuardrailsScreen />
        )}

        {view === 'projects' && (
          <ProjectsScreen 
            projects={projects}
            onNewProject={() => setShowNewProjectModal(true)}
            onRenameProject={handleRenameProject}
            onDeleteProject={handleDeleteProject}
          />
        )}
      </main>
      
      <NewProjectModal 
        isOpen={showNewProjectModal} 
        onClose={() => setShowNewProjectModal(false)} 
        onCreate={handleCreateProject}
      />

      <RenameProjectModal
        isOpen={!!renamingProject}
        onClose={() => setRenamingProject(null)}
        onRename={handleRenameSubmit}
        currentName={renamingProject?.name || ''}
      />
    </div>
  );
};

export default App;