import React, { useState, useEffect } from 'react';
import { Mic, Mail, Plus, FileText, Calendar, Trash2, Loader2, MoreHorizontal } from 'lucide-react';
import { draftService, Draft } from '../services/draftService';

type Tab = 'speeches' | 'emails';

interface DraftsScreenProps {
  workspaceId: string | null;
}

export const DraftsScreen: React.FC<DraftsScreenProps> = ({ workspaceId }) => {
  const [activeTab, setActiveTab] = useState<Tab>('speeches');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workspaceId) {
      loadDrafts();
    }
  }, [workspaceId]);

  const loadDrafts = async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const data = await draftService.getDrafts(workspaceId);
      setDrafts(data);
    } catch (error) {
      console.error('Failed to load drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDraft = async (type: string) => {
    if (!workspaceId) return;
    try {
      const title = type === 'speech' ? 'New Speech' : 'New Email';
      const newDraft = await draftService.createDraft({
        title,
        type,
        workspace_id: workspaceId,
        content: '',
        status: 'Draft',
        metadata: {}
      });
      setDrafts(prev => [newDraft, ...prev]);
    } catch (error) {
      console.error('Failed to create draft:', error);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    try {
      await draftService.deleteDraft(id);
      setDrafts(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete draft:', error);
    }
  };

  const tabs = [
    { id: 'speeches', label: 'Speeches', icon: Mic },
    { id: 'emails', label: 'Emails', icon: Mail },
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-white dark:bg-background-dark">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50/50 dark:bg-background-dark transition-colors duration-300">
      {/* Inner Sidebar */}
      <aside className="w-64 bg-white dark:bg-background-dark border-r border-gray-200 dark:border-gray-800 flex-shrink-0 flex flex-col transition-colors">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-serif text-xl font-medium text-text-main dark:text-white">Drafts</h2>
          <p className="text-xs text-text-sub dark:text-gray-400 mt-1">Manage content outputs</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-black' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {activeTab === 'speeches' && (
            <SpeechesView
              drafts={drafts.filter(d => d.type === 'speech')}
              onNew={() => handleCreateDraft('speech')}
              onDelete={handleDeleteDraft}
            />
          )}
          {activeTab === 'emails' && (
            <EmailsView
              drafts={drafts.filter(d => d.type === 'email')}
              onNew={() => handleCreateDraft('email')}
              onDelete={handleDeleteDraft}
            />
          )}
        </div>
      </div>
    </div>
  );
};

interface ViewProps {
  drafts: Draft[];
  onNew: () => void;
  onDelete: (id: string) => void;
}

const SpeechesView: React.FC<ViewProps> = ({ drafts, onNew, onDelete }) => (
  <div className="space-y-8 animate-in fade-in duration-300">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-serif text-text-main dark:text-white">Speeches</h1>
        <p className="text-text-sub dark:text-gray-400 mt-1">Stump speeches, keynotes, and remarks.</p>
      </div>
      <button
        onClick={onNew}
        className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
      >
        <Plus className="w-4 h-4" />
        New Speech
      </button>
    </div>

    <div className="grid gap-4">
      {drafts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 text-text-sub dark:text-gray-400">
          No speech drafts yet. Click "New Speech" to get started.
        </div>
      ) : drafts.map((item) => (
        <div key={item.id} className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-subtle hover:shadow-md transition-shadow cursor-pointer group flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
            <Mic className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-text-main dark:text-white">{item.title}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-text-sub dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></span>
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {item.content ? `${item.content.split(' ').length} words` : '0 words'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded text-xs font-medium ${item.status === 'Final' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                item.status === 'Review' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                  'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}>
              {item.status}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const EmailsView: React.FC<ViewProps> = ({ drafts, onNew, onDelete }) => (
  <div className="space-y-8 animate-in fade-in duration-300">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-serif text-text-main dark:text-white">Emails</h1>
        <p className="text-text-sub dark:text-gray-400 mt-1">Fundraising blasts, newsletters, and updates.</p>
      </div>
      <button
        onClick={onNew}
        className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
      >
        <Plus className="w-4 h-4" />
        New Email
      </button>
    </div>

    <div className="grid gap-4">
      {drafts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 text-text-sub dark:text-gray-400">
          No email drafts yet. Click "New Email" to get started.
        </div>
      ) : drafts.map((item) => (
        <div key={item.id} className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-subtle hover:shadow-md transition-shadow cursor-pointer group flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors text-xs font-bold uppercase overflow-hidden">
            {item.metadata?.type ? (item.metadata.type as string).substring(0, 3) : 'Email'}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1 leading-none">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.status === 'Sent' ? 'bg-green-500' : item.status === 'Scheduled' ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                <span className="text-[10px] font-medium text-text-sub dark:text-gray-400 uppercase tracking-wider">{item.metadata?.type as string || 'General'}</span>
              </div>
            </div>
            <h3 className="font-semibold text-text-main dark:text-white text-lg group-hover:text-black dark:group-hover:text-white transition-colors">{item.title}</h3>
            <p className="text-xs text-text-sub dark:text-gray-400 mt-1">
              Last updated {new Date(item.updated_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-sub dark:text-gray-400 uppercase">{item.status}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);