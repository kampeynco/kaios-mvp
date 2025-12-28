import React, { useState } from 'react';
import { Mic, Mail, Plus, FileText, Calendar } from 'lucide-react';

type Tab = 'speeches' | 'emails';

export const DraftsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('speeches');

  const tabs = [
    { id: 'speeches', label: 'Speeches', icon: Mic },
    { id: 'emails', label: 'Emails', icon: Mail },
  ];

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
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
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
          {activeTab === 'speeches' && <SpeechesView />}
          {activeTab === 'emails' && <EmailsView />}
        </div>
      </div>
    </div>
  );
};

const SpeechesView: React.FC = () => (
  <div className="space-y-8 animate-in fade-in duration-300">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-serif text-text-main dark:text-white">Speeches</h1>
        <p className="text-text-sub dark:text-gray-400 mt-1">Stump speeches, keynotes, and remarks.</p>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
        <Plus className="w-4 h-4" />
        New Speech
      </button>
    </div>

    <div className="grid gap-4">
      {[
        { title: "Victory Fund Gala Keynote", date: "Oct 12, 2024", status: "Draft", words: "1,200 words" },
        { title: "Town Hall Opening Remarks", date: "Sep 28, 2024", status: "Final", words: "450 words" },
        { title: "Education Policy Announcement", date: "Sep 15, 2024", status: "Review", words: "850 words" },
      ].map((item, idx) => (
        <div key={idx} className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-subtle hover:shadow-md transition-shadow cursor-pointer group flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
            <Mic className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-text-main dark:text-white">{item.title}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-text-sub dark:text-gray-400">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.date}</span>
              <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></span>
              <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {item.words}</span>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded text-xs font-medium ${
            item.status === 'Final' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 
            item.status === 'Review' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 
            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
          }`}>
            {item.status}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const EmailsView: React.FC = () => (
  <div className="space-y-8 animate-in fade-in duration-300">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-serif text-text-main dark:text-white">Emails</h1>
        <p className="text-text-sub dark:text-gray-400 mt-1">Fundraising blasts, newsletters, and updates.</p>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
        <Plus className="w-4 h-4" />
        New Email
      </button>
    </div>

    <div className="grid gap-4">
      {[
        { subject: "We're 95% of the way there!", type: "Fundraising", stats: "22% Open Rate", status: "Sent" },
        { subject: "The truth about my opponent's record", type: "Contrast", stats: "-", status: "Draft" },
        { subject: "Weekly Campaign Update: Huge Endorsement!", type: "Newsletter", stats: "-", status: "Scheduled" },
      ].map((item, idx) => (
        <div key={idx} className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-subtle hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex justify-between items-start mb-2">
             <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.status === 'Sent' ? 'bg-green-500' : item.status === 'Scheduled' ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                <span className="text-xs font-medium text-text-sub dark:text-gray-400 uppercase tracking-wider">{item.type}</span>
             </div>
             <span className="text-xs text-text-sub dark:text-gray-400">{item.status}</span>
          </div>
          <h3 className="font-semibold text-text-main dark:text-white text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.subject}</h3>
          {item.status === 'Sent' && (
             <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-2">{item.stats}</p>
          )}
        </div>
      ))}
    </div>
  </div>
);