import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { HomeScreen } from './components/HomeScreen';
import { ChatScreen } from './components/ChatScreen';
import { FilesScreen } from './components/FilesScreen';
import { CandidateProfileScreen } from './components/CandidateProfileScreen';
import { DraftsScreen } from './components/DraftsScreen';
import { GuardrailsScreen } from './components/GuardrailsScreen';
import { ProjectsScreen } from './components/ProjectsScreen';
import { generateResponse } from './services/geminiService';
import { ChatMessage } from './types';
import { User } from '@supabase/supabase-js';
import { OnboardingWizard } from './components/Onboarding/OnboardingWizard';

// Auth disabled for product iteration. To re-enable, restore the InsForge
// auth/session bootstrap from git history (commit before this change).
const DEV_WORKSPACE_ID =
  (import.meta as any).env?.VITE_DEV_WORKSPACE_ID ??
  '00000000-0000-0000-0000-000000000000';

const MOCK_USER = {
  id: 'dev-user',
  email: 'dev@local',
  user_metadata: { full_name: 'Dev User' },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as unknown as User;

const MOCK_WORKSPACES = [
  { id: DEV_WORKSPACE_ID, name: 'Dev Workspace', role: 'owner' },
];

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'chats' | 'files' | 'candidate-profile' | 'drafts' | 'guardrails' | 'projects' | 'create-workspace'>('home');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [workspaces] = useState<any[]>(MOCK_WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(DEV_WORKSPACE_ID);

  const handleOnboardingComplete = () => {
    setView('home');
  };

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

  if (view === 'create-workspace') {
    return (
      <div className="relative">
        <button
          onClick={() => setView('home')}
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-lg text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors z-50"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Dashboard
        </button>
        <OnboardingWizard user={MOCK_USER} onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  return (
    <div className="flex h-screen w-full flex-row bg-white dark:bg-background-dark">
      <Sidebar
        user={MOCK_USER}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSwitchWorkspace={(id) => {
          setActiveWorkspaceId(id);
          setView('home');
        }}
        onCreateWorkspace={() => setView('create-workspace')}
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
          <div className="flex items-center gap-2 text-sm text-text-main dark:text-white font-medium">
            <span className="material-symbols-outlined text-[18px] text-gray-400">work</span>
            <span>{activeWorkspace?.name || (workspaces === null ? 'Loading workspace...' : 'No workspace selected')}</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Redundant Sign Out and Ellipsis removed as requested */}
          </div>
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
          <FilesScreen workspaceId={activeWorkspaceId} />
        )}

        {view === 'candidate-profile' && (
          <CandidateProfileScreen workspaceId={activeWorkspaceId} />
        )}

        {view === 'drafts' && (
          <DraftsScreen workspaceId={activeWorkspaceId} />
        )}

        {view === 'guardrails' && (
          <GuardrailsScreen workspaceId={activeWorkspaceId} />
        )}

        {view === 'projects' && (
          <ProjectsScreen
            workspaceId={activeWorkspaceId}
          />
        )}
      </main>
    </div>
  );
};

export default App;