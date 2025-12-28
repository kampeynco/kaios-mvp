import React, { useState, useEffect, useRef } from 'react';
import { User, Flag, Swords, Plus, Save, Palette, Upload, Trash2, Pen, Check, Copy, X, Bold, Italic, AlertTriangle, Download, CloudUpload, Search, ChevronDown, Loader2, LucideIcon, Layers, ShieldCheck, FileType, Bio, Target, Users, ExternalLink, MoreVertical } from 'lucide-react';
import { FileUpload } from "@ark-ui/react/file-upload";
import { candidateService, CandidateProfile } from '../services/candidateService';
import { storageService } from '../services/storageService';

type Tab = 'bio' | 'platform' | 'opponents' | 'brand-kit';

export interface CandidateProfileScreenProps {
  workspaceId: string | null;
}

export const CandidateProfileScreen: React.FC<CandidateProfileScreenProps> = ({ workspaceId }) => {
  const [activeTab, setActiveTab] = useState<Tab>('bio');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Consolidated state for all fields
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [coreValues, setCoreValues] = useState<string[]>([]);
  const [platformIssues, setPlatformIssues] = useState<any[]>([]);
  const [opponents, setOpponents] = useState<any[]>([]);
  const [brandKit, setBrandKit] = useState<any>({
    logos: [],
    colors: [],
    fonts: [],
    photos: []
  });

  useEffect(() => {
    if (workspaceId) {
      loadProfile();
    }
  }, [workspaceId]);

  const loadProfile = async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const data = await candidateService.getProfile(workspaceId);
      if (data) {
        setFullName(data.full_name || '');
        setBio(data.bio || '');
        setCoreValues(typeof data.core_values === 'string' ? data.core_values.split(',').map(v => v.trim()).filter(Boolean) : []);
        setPlatformIssues(Array.isArray(data.platform_issues) ? data.platform_issues : []);
        setOpponents(Array.isArray(data.opponents) ? data.opponents : []);
        setBrandKit(data.brand_kit || { logos: [], colors: [], fonts: [], photos: [] });
      } else {
        setFullName('');
        setBio('');
        setCoreValues([]);
        setPlatformIssues([]);
        setOpponents([]);
        setBrandKit({ logos: [], colors: [], fonts: [], photos: [] });
      }
    } catch (error) {
      console.error('Error loading candidate profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!workspaceId) return;
    setSaving(true);
    try {
      await candidateService.upsertProfile({
        workspace_id: workspaceId,
        full_name: fullName,
        bio,
        core_values: coreValues.join(', '),
        platform_issues: platformIssues,
        opponents,
        brand_kit: brandKit,
      });
    } catch (error) {
      console.error('Error saving candidate profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'bio', label: 'Bio & Core Values', icon: User },
    { id: 'platform', label: 'Platform & Issues', icon: Flag },
    { id: 'opponents', label: 'Opponents', icon: Swords },
    { id: 'brand-kit', label: 'Brand Kit', icon: Palette },
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50/50 dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <p className="text-sm text-text-sub dark:text-gray-400 font-serif">Loading candidate details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50/50 dark:bg-background-dark transition-colors duration-300">
      {/* Inner Sidebar */}
      <aside className="w-64 bg-white dark:bg-background-dark border-r border-gray-200 dark:border-gray-800 flex-shrink-0 flex flex-col transition-colors">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-serif text-xl font-medium text-text-main dark:text-white">Profile</h2>
          <p className="text-xs text-text-sub dark:text-gray-400 mt-1">Manage candidate details</p>
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
          {activeTab === 'bio' && (
            <BioView
              fullName={fullName}
              setFullName={setFullName}
              bio={bio}
              setBio={setBio}
              coreValues={coreValues}
              setCoreValues={setCoreValues}
              onSave={handleSave}
              saving={saving}
            />
          )}
          {activeTab === 'platform' && (
            <PlatformView
              issues={platformIssues}
              setIssues={setPlatformIssues}
              onSave={handleSave}
              saving={saving}
            />
          )}
          {activeTab === 'opponents' && (
            <OpponentsView
              opponents={opponents}
              setOpponents={setOpponents}
              onSave={handleSave}
              saving={saving}
            />
          )}
          {activeTab === 'brand-kit' && (
            <BrandKitView
              brandKit={brandKit}
              setBrandKit={setBrandKit}
              onSave={handleSave}
              saving={saving}
              workspaceId={workspaceId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

interface BioViewProps {
  fullName: string;
  setFullName: (val: string) => void;
  bio: string;
  setBio: (val: string) => void;
  coreValues: string[];
  setCoreValues: (val: string[]) => void;
  onSave: () => void;
  saving: boolean;
}

const BioView: React.FC<BioViewProps> = ({
  fullName, setFullName, bio, setBio, coreValues, setCoreValues, onSave, saving
}) => {
  const [isAddingValue, setIsAddingValue] = useState(false);
  const [newValue, setNewValue] = useState('');

  const handleAddValue = () => {
    if (newValue.trim()) {
      setCoreValues([...coreValues, newValue.trim()]);
      setNewValue('');
      setIsAddingValue(false);
    }
  };

  const handleRemoveValue = (tag: string) => {
    setCoreValues(coreValues.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddValue();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-text-main dark:text-white">Bio & Core Values</h1>
          <p className="text-text-sub dark:text-gray-400 mt-1">Define the candidate's personal story and guiding principles.</p>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-subtle space-y-6 transition-colors">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-main dark:text-white mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:border-black dark:focus:border-white text-text-main dark:text-white outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main dark:text-white mb-2">Current Title/Role</label>
            <input type="text" placeholder="Community Organizer" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:border-black dark:focus:border-white text-text-main dark:text-white outline-none transition-all" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main dark:text-white mb-2">Short Biography</label>
          <textarea
            rows={4}
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:border-black dark:focus:border-white text-text-main dark:text-white outline-none transition-all resize-none"
            placeholder="Sarah Jenkins represents a new generation of leadership..."
          />
          <p className="text-xs text-text-sub dark:text-gray-400 mt-1.5">Used for social media bios and short intros.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main dark:text-white mb-2">Core Values</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {coreValues.map((tag) => (
              <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                {tag}
                <button
                  onClick={() => handleRemoveValue(tag)}
                  className="ml-1.5 hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {isAddingValue ? (
              <div className="inline-flex items-center">
                <input
                  type="text"
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => { if (!newValue.trim()) setIsAddingValue(false); }}
                  autoFocus
                  className="px-3 py-1 rounded-full text-xs border border-black dark:border-white bg-transparent text-text-main dark:text-white focus:outline-none min-w-[100px]"
                  placeholder="Type value..."
                />
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleAddValue}
                  className="ml-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-black dark:text-white"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingValue(true)}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <Plus className="w-3 h-3 mr-1" /> Add Value
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface Issue {
  id: string;
  title: string;
  status: string;
  description: string;
}

interface PlatformViewProps {
  issues: Issue[];
  setIssues: React.Dispatch<React.SetStateAction<Issue[]>>;
  onSave: () => void;
  saving: boolean;
}

const PlatformView: React.FC<PlatformViewProps> = ({ issues, setIssues, onSave, saving }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = (newIssue: { title: string; status: string; description: string }) => {
    setIssues([...issues, { ...newIssue, id: Date.now().toString() }]);
    setIsAddOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      setIssues(issues.filter(i => i.id !== deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <AddIssueModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAdd}
      />
      <ConfirmDeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Issue?"
        description={`Are you sure you want to delete "${issues.find(i => i.id === deleteId)?.title}"? This action cannot be undone.`}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-text-main dark:text-white">Platform & Issues</h1>
          <p className="text-text-sub dark:text-gray-400 mt-1">Key policy positions and talking points.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-text-main dark:text-white text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Issue
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {issues.map((issue) => (
          <div key={issue.id} className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-subtle hover:shadow-md transition-all cursor-pointer group relative">
            <div className="flex justify-between items-start mb-2 pr-8">
              <h3 className="font-semibold text-text-main dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{issue.title}</h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${issue.status === 'Published' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                issue.status === 'Review' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                }`}>
                {issue.status}
              </span>
            </div>
            <p className="text-sm text-text-sub dark:text-gray-400 line-clamp-2">{issue.description}</p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteId(issue.id);
              }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all z-10"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {issues.length === 0 && (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-gray-400 text-sm">No issues defined yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface Opponent {
  id: string;
  name: string;
  party: string;
  tags: string[];
}

interface OpponentsViewProps {
  opponents: Opponent[];
  setOpponents: React.Dispatch<React.SetStateAction<Opponent[]>>;
  onSave: () => void;
  saving: boolean;
}

const OpponentsView: React.FC<OpponentsViewProps> = ({ opponents, setOpponents, onSave, saving }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = (newOpponent: { name: string; party: string; tags: string[] }) => {
    setOpponents([...opponents, { ...newOpponent, id: Date.now().toString() }]);
    setIsAddOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      setOpponents(opponents.filter(o => o.id !== deleteId));
      setDeleteId(null);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <AddOpponentModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAdd}
      />
      <ConfirmDeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Opponent?"
        description={`Are you sure you want to delete "${opponents.find(o => o.id === deleteId)?.name}"? This action cannot be undone.`}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-text-main dark:text-white">Opponents</h1>
          <p className="text-text-sub dark:text-gray-400 mt-1">Opposition research and contrast points.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-text-main dark:text-white text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Opponent
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {opponents.map((opponent) => (
          <div key={opponent.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-subtle overflow-hidden relative group transition-colors">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl font-serif font-bold text-gray-400">
                {getInitials(opponent.name)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between pr-8">
                  <h3 className="text-lg font-semibold text-text-main dark:text-white">{opponent.name}</h3>
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View Analysis</button>
                </div>
                <p className="text-sm text-text-sub dark:text-gray-400 mt-1">Party Affiliation: {opponent.party}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {opponent.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs rounded font-medium">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 text-center transition-colors">
              <p className="text-xs text-text-sub dark:text-gray-400">Last updated just now</p>
            </div>

            <button
              onClick={() => setDeleteId(opponent.id)}
              className="absolute top-6 right-4 p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {opponents.length === 0 && (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-gray-400 text-sm">No opponents tracked.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Brand Kit Logic & Components ---

type ColorItem = { id: number; name: string; hex: string };

type FontConfig = {
  id: string;
  name: string; // e.g. "Title"
  fontFamily: string;
  size: number;
  weight: string; // 'Bold' | 'Regular' etc
  style: string; // 'italic' | 'normal'
};

type BrandAsset = {
  id: string | number;
  type: 'default-light' | 'default-dark' | 'upload' | 'default-photo';
  url?: string;
  name?: string;
};

interface BrandKitViewProps {
  brandKit: any;
  setBrandKit: (brandKit: any) => void;
  onSave: () => void;
  saving: boolean;
  workspaceId: string | null;
}

const BrandKitView: React.FC<BrandKitViewProps> = ({ brandKit, setBrandKit, onSave, saving, workspaceId }) => {
  const [activeSection, setActiveSection] = useState<'logos' | 'colors' | 'fonts' | 'photos'>('logos');
  const [selectedColor, setSelectedColor] = useState<ColorItem | null>(null);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [isCreatingColor, setIsCreatingColor] = useState(false);

  // Font management state
  const [availableFonts, setAvailableFonts] = useState<string[]>([
    "Roboto", "Open Sans", "Lato", "Montserrat", "Raleway", "Poppins",
    "Nunito", "Playfair Display", "Merriweather", "Inter", "Rubik",
    "Lora", "Work Sans", "Mukta", "Quicksand", "PT Sans", "Oswald",
    "Inconsolata", "Kanit", "Barlow", "Manrope", "Nanum Gothic",
    "Titillium Web", "PT Serif", "Libre Franklin", "Crimson Text",
    "Arvo", "Josefin Sans", "Anton", "Cabin", "Bitter", "Fjalla One",
    "Gill Sans", "Times New Roman", "Arial", "Helvetica"
  ].sort());
  const [fontSearch, setFontSearch] = useState("");
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const fontDropdownRef = useRef<HTMLDivElement>(null);

  // Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    section: 'logos' | 'colors' | 'fonts' | 'photos';
    id: string | number;
  } | null>(null);

  // State for assets - initialized from brandKit prop or defaults
  const colors = brandKit.colors || [
    { id: 1, name: 'Navy Blue', hex: '#0F172A' },
    { id: 2, name: 'Action Blue', hex: '#2563EB' },
    { id: 3, name: 'Accent Red', hex: '#DC2626' },
    { id: 4, name: 'White', hex: '#FFFFFF' },
  ];

  const logos = brandKit.logos || [
    { id: 'def-1', type: 'default-light' },
    { id: 'def-2', type: 'default-dark' }
  ];

  const photos = brandKit.photos || [
    { id: 'p-1', type: 'default-photo' },
    { id: 'p-2', type: 'default-photo' },
  ];

  const fonts = brandKit.fonts || [
    { id: '1', name: 'Title', fontFamily: 'Gill Sans', size: 48, weight: 'Bold', style: 'normal' },
    { id: '2', name: 'Subtitle', fontFamily: 'Inter', size: 24, weight: 'Regular', style: 'normal' },
    { id: '3', name: 'Heading', fontFamily: 'Playfair Display', size: 36, weight: 'Bold', style: 'normal' },
    { id: '4', name: 'Subheading', fontFamily: 'Inter', size: 20, weight: 'Medium', style: 'normal' },
    { id: '5', name: 'Section header', fontFamily: 'Inter', size: 16, weight: 'Bold', style: 'uppercase' },
    { id: '6', name: 'Body', fontFamily: 'Inter', size: 16, weight: 'Regular', style: 'normal' },
    { id: '7', name: 'Quote', fontFamily: 'Playfair Display', size: 28, weight: 'Regular', style: 'italic' },
    { id: '8', name: 'Caption', fontFamily: 'Inter', size: 12, weight: 'Regular', style: 'normal' },
  ];

  const setLogos = (newLogos: BrandAsset[] | ((prev: BrandAsset[]) => BrandAsset[])) => {
    const updated = typeof newLogos === 'function' ? newLogos(logos) : newLogos;
    setBrandKit({ ...brandKit, logos: updated });
  };

  const setColors = (newColors: ColorItem[] | ((prev: ColorItem[]) => ColorItem[])) => {
    const updated = typeof newColors === 'function' ? newColors(colors) : newColors;
    setBrandKit({ ...brandKit, colors: updated });
  };

  const setPhotos = (newPhotos: BrandAsset[] | ((prev: BrandAsset[]) => BrandAsset[])) => {
    const updated = typeof newPhotos === 'function' ? newPhotos(photos) : newPhotos;
    setBrandKit({ ...brandKit, photos: updated });
  };

  const setFonts = (newFonts: FontConfig[] | ((prev: FontConfig[]) => FontConfig[])) => {
    const updated = typeof newFonts === 'function' ? newFonts(fonts) : newFonts;
    setBrandKit({ ...brandKit, fonts: updated });
  };

  const [editingFontId, setEditingFontId] = useState<string | null>(null);

  const sections = [
    { id: 'logos', label: 'Logos' },
    { id: 'colors', label: 'Colors' },
    { id: 'fonts', label: 'Fonts' },
    { id: 'photos', label: 'Photos' },
  ];

  // Reset font dropdown when switching edited fonts
  useEffect(() => {
    setIsFontDropdownOpen(false);
    setFontSearch("");
  }, [editingFontId]);

  // Click outside for font dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target as Node)) {
        setIsFontDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => {
      setCopiedColor(null);
    }, 2000);
  };

  const handleAddColor = () => {
    const newId = colors.length > 0 ? Math.max(...colors.map(c => c.id)) + 1 : 1;
    const newColor: ColorItem = { id: newId, name: 'New Color', hex: '#000000' };

    setIsCreatingColor(true);
    setSelectedColor(newColor);
  };

  const handleModalClose = () => {
    if (isCreatingColor && selectedColor) {
      setColors([...colors, selectedColor]);
      setIsCreatingColor(false);
    }
    setSelectedColor(null);
  };

  const handleUpdateColor = (id: number, newHex: string) => {
    if (selectedColor && selectedColor.id === id) {
      setSelectedColor({ ...selectedColor, hex: newHex });
    }
    if (!isCreatingColor) {
      setColors(colors.map(c => c.id === id ? { ...c, hex: newHex } : c));
    }
  };

  const handleDownload = (asset: BrandAsset) => {
    if (asset.type === 'upload' && asset.url) {
      const a = document.createElement('a');
      a.href = asset.url;
      a.download = asset.name || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Mock download for default assets or show notification
      alert("Preparing download...");
    }
  };

  // Trigger Confirmation
  const requestDelete = (section: 'logos' | 'colors' | 'fonts' | 'photos', id: string | number) => {
    setDeleteConfirm({ isOpen: true, section, id });
  };

  // Perform Delete
  const performDelete = () => {
    if (!deleteConfirm) return;
    const { section, id } = deleteConfirm;

    if (section === 'colors') {
      // If we are deleting from the modal context, we need to close it too
      if (selectedColor?.id === id) setSelectedColor(null);
      setColors(colors.filter(c => c.id !== id));
      setIsCreatingColor(false);
    }
    if (section === 'logos') {
      setLogos(logos.filter(l => l.id !== id));
    }
    if (section === 'photos') {
      setPhotos(photos.filter(p => p.id !== id));
    }
    if (section === 'fonts') {
      setFonts(fonts.filter(f => f.id !== id));
    }

    setDeleteConfirm(null);
  };

  const handleLogoUpload = async (details: { acceptedFiles: File[] }) => {
    if (!workspaceId) return;

    try {
      const uploadPromises = details.acceptedFiles.map(async (file) => {
        const result = await storageService.uploadFile('brand-assets', workspaceId, file);
        return {
          id: result.id,
          type: 'upload' as const,
          url: result.url,
          name: file.name,
          path: result.path
        };
      });

      const newLogos = await Promise.all(uploadPromises);
      setLogos([...logos, ...newLogos]);
    } catch (error) {
      alert("Failed to upload logo. Please check server permissions.");
    }
  };

  const handlePhotoUpload = async (details: { acceptedFiles: File[] }) => {
    if (!workspaceId) return;

    try {
      const uploadPromises = details.acceptedFiles.map(async (file) => {
        const result = await storageService.uploadFile('brand-assets', workspaceId, file);
        return {
          id: result.id,
          type: 'upload' as const,
          url: result.url,
          name: file.name,
          path: result.path
        };
      });

      const newPhotos = await Promise.all(uploadPromises);
      setPhotos([...photos, ...newPhotos]);
    } catch (error) {
      alert("Failed to upload photo. Please check server permissions.");
    }
  };

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name.replace(/\.[^/.]+$/, "");
      const formattedName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
      setAvailableFonts(prev => [formattedName, ...prev]);
      alert(`Font "${formattedName}" uploaded successfully!`);
    }
  };

  const filteredFonts = availableFonts.filter(f => f.toLowerCase().includes(fontSearch.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative">
      {/* Edit Color Modal */}
      {selectedColor && (
        <ColorPickerModal
          color={selectedColor}
          onClose={handleModalClose}
          onUpdate={handleUpdateColor}
          onDelete={() => requestDelete('colors', selectedColor.id)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={performDelete}
        title="Confirm Deletion"
        description={`Are you sure you want to delete this ${deleteConfirm?.section === 'logos' ? 'logo' : deleteConfirm?.section === 'photos' ? 'photo' : deleteConfirm?.section === 'colors' ? 'color' : 'font style'}? This action cannot be undone.`}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-text-main dark:text-white">Brand Kit</h1>
          <p className="text-text-sub dark:text-gray-400 mt-1">Manage visual identity assets.</p>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex gap-8">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`
                pb-3 text-sm font-medium border-b-2 transition-colors
                ${activeSection === section.id
                  ? 'border-black dark:border-white text-black dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
                }
              `}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="min-h-[300px]">
        {activeSection === 'logos' && (
          <div className="grid grid-cols-3 gap-6">
            <FileUpload.Root
              maxFiles={5}
              accept={{ 'image/*': [] }}
              onFileChange={handleLogoUpload}
            >
              <FileUpload.Trigger className="w-full h-full">
                <div className="aspect-square bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-700 transition-all cursor-pointer">
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span className="text-sm font-medium">Upload Logo</span>
                  </div>
                </div>
              </FileUpload.Trigger>
              <FileUpload.HiddenInput />
            </FileUpload.Root>

            {logos.map((logo) => (
              <div key={logo.id} className={`aspect-square rounded-xl border border-gray-200 dark:border-gray-800 shadow-subtle flex items-center justify-center p-4 relative group ${logo.type === 'default-dark' ? 'bg-black' : 'bg-white dark:bg-gray-900'}`}>
                {logo.type === 'default-light' && (
                  <div className="text-2xl font-serif font-bold text-black dark:text-white">JONES<span className="text-blue-600">2024</span></div>
                )}
                {logo.type === 'default-dark' && (
                  <div className="text-2xl font-serif font-bold text-white">JONES<span className="text-blue-400">2024</span></div>
                )}
                {logo.type === 'upload' && logo.url && (
                  <img src={logo.url} alt="Uploaded logo" className="max-w-full max-h-full object-contain" />
                )}

                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(logo);
                    }}
                    className={`p-1.5 shadow-sm border rounded-lg hover:text-blue-600 ${logo.type === 'default-dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'}`}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => requestDelete('logos', logo.id)}
                    className={`p-1.5 shadow-sm border rounded-lg hover:text-red-500 ${logo.type === 'default-dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'colors' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-medium text-text-main dark:text-white mb-4">Primary Palette</h3>
              <div className="grid grid-cols-4 gap-6">
                <div
                  className="space-y-2 group cursor-pointer"
                  onClick={handleAddColor}
                >
                  <div className="aspect-square rounded-xl bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-700 transition-all">
                    <Plus className="w-8 h-8 opacity-50" />
                  </div>
                  <div className="-mx-2 px-2 py-1">
                    <p className="text-sm font-medium text-text-sub dark:text-gray-400">Add Color</p>
                    <p className="text-xs text-transparent">.</p>
                  </div>
                </div>
                {colors.map((color) => (
                  <div
                    key={color.id}
                    className="space-y-2 group"
                  >
                    <div
                      className={`aspect-square rounded-xl shadow-subtle border border-gray-100 dark:border-gray-800 group-hover:ring-2 ring-offset-2 ring-black dark:ring-white transition-all cursor-pointer relative overflow-hidden`}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => handleCopyColor(color.hex)}
                    >
                      {copiedColor === color.hex && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                          <Check className="w-8 h-8 text-white drop-shadow-sm" />
                        </div>
                      )}
                      {copiedColor !== color.hex && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                          <div className="bg-white/90 text-black text-xs font-semibold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                            <Copy className="w-3 h-3" /> Copy
                          </div>
                        </div>
                      )}

                      {/* Delete Button on Color Card */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          requestDelete('colors', color.id);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 text-gray-400 hover:text-red-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 -mx-2 px-2 py-1 rounded-lg transition-colors flex items-center justify-between"
                      onClick={() => setSelectedColor(color)}
                    >
                      <div>
                        <p className="text-sm font-medium text-text-main dark:text-white">{color.name}</p>
                        <p className="text-xs text-text-sub dark:text-gray-400 uppercase">{color.hex}</p>
                      </div>
                      <Pen className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'fonts' && (
          <div className="space-y-3">
            {fonts.map((font) => (
              <React.Fragment key={font.id}>
                {editingFontId === font.id ? (
                  <div className="border border-purple-600 rounded-xl bg-white dark:bg-gray-900 p-4 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                    {/* Edit Controls */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-text-main dark:text-white mb-1 block">Font</label>
                        <div className="relative" ref={fontDropdownRef}>
                          <button
                            type="button"
                            onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
                            className="w-full flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm font-medium text-text-main dark:text-white focus:border-purple-600 focus:outline-none"
                          >
                            <span className="truncate">{font.fontFamily}</span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          </button>

                          {isFontDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                              <div className="p-2 border-b border-gray-100 dark:border-gray-700 flex gap-2">
                                <label className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 cursor-pointer" title="Upload Font">
                                  <CloudUpload className="w-4 h-4" />
                                  <input type="file" accept=".ttf,.otf,.woff,.woff2" className="hidden" onChange={handleFontUpload} />
                                </label>
                                <div className="relative flex-1">
                                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                  <input
                                    type="text"
                                    className="w-full pl-7 pr-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 bg-transparent text-text-main dark:text-white rounded focus:border-purple-600 outline-none"
                                    placeholder="Search fonts..."
                                    value={fontSearch}
                                    onChange={(e) => setFontSearch(e.target.value)}
                                    autoFocus
                                  />
                                </div>
                              </div>
                              <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                                {filteredFonts.map((familyName) => (
                                  <button
                                    key={familyName}
                                    onClick={() => {
                                      const updated = fonts.map(f => f.id === font.id ? { ...f, fontFamily: familyName } : f);
                                      setFonts(updated);
                                      setIsFontDropdownOpen(false);
                                      setFontSearch("");
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 transition-colors ${font.fontFamily === familyName ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium' : 'text-text-main dark:text-white'}`}
                                    style={{ fontFamily: familyName }}
                                  >
                                    {familyName}
                                  </button>
                                ))}
                                {filteredFonts.length === 0 && (
                                  <div className="px-3 py-4 text-center text-xs text-gray-400">
                                    No fonts found
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex-1">
                        <label className="text-xs font-semibold text-text-main dark:text-white mb-1 block">Heading type</label>
                        <div className="relative">
                          <select
                            className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm font-medium text-text-main dark:text-white focus:border-purple-600 focus:outline-none"
                            value={font.name}
                            onChange={(e) => {
                              const updated = fonts.map(f => f.id === font.id ? { ...f, name: e.target.value } : f);
                              setFonts(updated);
                            }}
                          >
                            <option>Title</option>
                            <option>Subtitle</option>
                            <option>Heading</option>
                            <option>Subheading</option>
                            <option>Section header</option>
                            <option>Body</option>
                            <option>Quote</option>
                            <option>Caption</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      </div>

                      <div className="w-24">
                        <label className="text-xs font-semibold text-text-main dark:text-white mb-1 block">Size</label>
                        <div className="relative">
                          <select
                            className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm font-medium text-text-main dark:text-white focus:border-purple-600 focus:outline-none"
                            value={font.size}
                            onChange={(e) => {
                              const updated = fonts.map(f => f.id === font.id ? { ...f, size: parseInt(e.target.value) } : f);
                              setFonts(updated);
                            }}
                          >
                            {[12, 14, 16, 20, 24, 28, 32, 36, 42, 48, 56, 64].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-end gap-1 h-[54px] pb-0.5">
                        <button
                          onClick={() => {
                            const updated = fonts.map(f => f.id === font.id ? { ...f, weight: f.weight === 'Bold' ? 'Regular' : 'Bold' } : f);
                            setFonts(updated);
                          }}
                          className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${font.weight === 'Bold' ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                          <Bold className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const updated = fonts.map(f => f.id === font.id ? { ...f, style: f.style === 'italic' ? 'normal' : 'italic' } : f);
                            setFonts(updated);
                          }}
                          className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${font.style === 'italic' ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                          <Italic className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex items-center justify-between">
                      <h3
                        className="text-text-main dark:text-white"
                        style={{
                          fontFamily: font.fontFamily,
                          fontSize: '24px',
                          fontWeight: font.weight === 'Bold' ? 700 : 400,
                          fontStyle: font.style
                        }}
                      >
                        {font.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingFontId(null)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-green-600 transition-colors"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setEditingFontId(null)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setEditingFontId(font.id)}
                    className="group flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-subtle hover:border-gray-300 dark:hover:border-gray-700 transition-all cursor-pointer h-[72px]"
                  >
                    <h3
                      className="text-text-main dark:text-white text-lg font-bold"
                    >
                      {font.name}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        requestDelete('fonts', font.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </React.Fragment>
            ))}

            <button
              onClick={() => {
                const newId = (Math.max(...fonts.map(f => parseInt(f.id))) + 1).toString();
                const newFont = { id: newId, name: 'New Style', fontFamily: 'Inter', size: 16, weight: 'Regular', style: 'normal' };
                setFonts([...fonts, newFont]);
                setEditingFontId(newId);
              }}
              className="mt-4 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline flex items-center gap-1"
            >
              <span className="text-xs">Manage uploaded fonts</span>
            </button>
          </div>
        )}

        {activeSection === 'photos' && (
          <div className="grid grid-cols-3 gap-6">
            {/* Functional Add Photo Button - First Position */}
            <FileUpload.Root
              maxFiles={5}
              accept={{ 'image/*': [] }}
              onFileChange={handlePhotoUpload}
            >
              <FileUpload.Trigger className="w-full h-full">
                <div className="aspect-[4/3] border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                  <div className="text-center">
                    <Plus className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Add Photo</span>
                  </div>
                </div>
              </FileUpload.Trigger>
              <FileUpload.HiddenInput />
            </FileUpload.Root>

            {photos.map((photo) => (
              <div key={photo.id} className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden relative group">
                {photo.type === 'default-photo' && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300 dark:text-gray-600">
                    <User className="w-12 h-12 opacity-20" />
                  </div>
                )}
                {photo.type === 'upload' && photo.url && (
                  <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                )}

                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(photo);
                    }}
                    className="p-1.5 bg-white/90 dark:bg-gray-800/90 shadow-sm border border-gray-100 dark:border-gray-700 rounded-lg text-gray-400 hover:text-blue-500 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      requestDelete('photos', photo.id);
                    }}
                    className="p-1.5 bg-white/90 dark:bg-gray-800/90 shadow-sm border border-gray-100 dark:border-gray-700 rounded-lg text-gray-400 hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Color Helpers ---
function hexToHsv(hex: string) {
  let r = 0, g = 0, b = 0;
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    r = parseInt("0x" + hex[0] + hex[0]);
    g = parseInt("0x" + hex[1] + hex[1]);
    b = parseInt("0x" + hex[2] + hex[2]);
  } else if (hex.length === 6) {
    r = parseInt("0x" + hex.substring(0, 2));
    g = parseInt("0x" + hex.substring(2, 4));
    b = parseInt("0x" + hex.substring(4, 6));
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  if (h < 0) h += 1;
  return { h: h * 360, s: s * 100, v: v * 100 };
}

function hsvToHex(h: number, s: number, v: number) {
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s / 100) / 100;
  const q = v * (1 - f * s / 100) / 100;
  const t = v * (1 - (1 - f) * s / 100) / 100;
  const v_ = v / 100;

  switch (i % 6) {
    case 0: r = v_; g = t; b = p; break;
    case 1: r = q; g = v_; b = p; break;
    case 2: r = p; g = v_; b = t; break;
    case 3: r = p; g = q; b = v_; break;
    case 4: r = t; g = p; b = v_; break;
    case 5: r = v_; g = p; b = q; break;
  }
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

interface ColorPickerModalProps {
  color: ColorItem;
  onClose: () => void;
  onUpdate: (id: number, hex: string) => void;
  onDelete: (id: number) => void;
}

const ColorPickerModal: React.FC<ColorPickerModalProps> = ({ color, onClose, onUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'solid' | 'gradient'>('solid');
  const [hex, setHex] = useState(color.hex);
  const [hsv, setHsv] = useState(hexToHsv(color.hex));

  const saturationRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<'saturation' | 'hue' | null>(null);

  // Sync state if prop changes from outside
  useEffect(() => {
    setHex(color.hex);
    setHsv(hexToHsv(color.hex));
  }, [color.hex]);

  // Handle Dragging Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      if (isDragging.current === 'saturation' && saturationRef.current) {
        const rect = saturationRef.current.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        // Clamp values
        x = Math.max(0, Math.min(x, rect.width));
        y = Math.max(0, Math.min(y, rect.height));

        const newS = (x / rect.width) * 100;
        const newV = 100 - (y / rect.height) * 100;

        const newHsv = { ...hsv, s: newS, v: newV };
        const newHex = hsvToHex(newHsv.h, newHsv.s, newHsv.v);

        setHsv(newHsv);
        setHex(newHex);
        onUpdate(color.id, newHex);
      }
      else if (isDragging.current === 'hue' && hueRef.current) {
        const rect = hueRef.current.getBoundingClientRect();
        let x = e.clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));

        const newH = (x / rect.width) * 360;
        const newHsv = { ...hsv, h: newH };
        const newHex = hsvToHex(newHsv.h, newHsv.s, newHsv.v);

        setHsv(newHsv);
        setHex(newHex);
        onUpdate(color.id, newHex);
      }
    };

    const handleMouseUp = () => {
      isDragging.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [hsv, color.id, onUpdate]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value.startsWith('#')) {
      setHex(value);
      if (value.length === 7 || value.length === 4) {
        const newHsv = hexToHsv(value);
        setHsv(newHsv);
        onUpdate(color.id, value);
      }
    } else {
      setHex('#' + value);
      if (value.length === 6 || value.length === 3) {
        const newHsv = hexToHsv('#' + value);
        setHsv(newHsv);
        onUpdate(color.id, '#' + value);
      }
    }
  };

  const startDragSaturation = (e: React.MouseEvent) => {
    isDragging.current = 'saturation';
    // Trigger initial move to handle click-to-jump
    const rect = saturationRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newS = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const newV = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
    const newHsv = { ...hsv, s: newS, v: newV };
    const newHex = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
    setHsv(newHsv);
    setHex(newHex);
    onUpdate(color.id, newHex);
  };

  const startDragHue = (e: React.MouseEvent) => {
    isDragging.current = 'hue';
    // Trigger initial move to handle click-to-jump
    const rect = hueRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newH = Math.max(0, Math.min(360, (x / rect.width) * 360));
    const newHsv = { ...hsv, h: newH };
    const newHex = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
    setHsv(newHsv);
    setHex(newHex);
    onUpdate(color.id, newHex);
  };


  const gradientPreview = `linear-gradient(to right, ${hex}, #ffffff)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-[1px]" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-[320px] overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex border-b border-gray-100 dark:border-gray-800 pr-10">
          <button
            onClick={() => setActiveTab('solid')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'solid' ? 'text-black dark:text-white border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Solid color
          </button>
          <button
            onClick={() => setActiveTab('gradient')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'gradient' ? 'text-black dark:text-white border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Gradient
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Color Area */}
          <div
            ref={saturationRef}
            onMouseDown={startDragSaturation}
            className="relative h-32 w-full rounded-lg shadow-inner cursor-crosshair overflow-hidden select-none"
            style={{
              backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
              backgroundImage: activeTab === 'solid'
                ? 'linear-gradient(to right, #fff, transparent), linear-gradient(to top, #000, transparent)'
                : gradientPreview
            }}
          >
            {activeTab === 'solid' && (
              <div
                className="absolute w-4 h-4 rounded-full border-2 border-white shadow-sm ring-1 ring-black/10 cursor-pointer pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${hsv.s}%`,
                  top: `${100 - hsv.v}%`,
                  backgroundColor: hex
                }}
              ></div>
            )}
          </div>

          {/* Hue Slider */}
          <div
            ref={hueRef}
            onMouseDown={startDragHue}
            className="relative h-3 w-full rounded-full ring-1 ring-black/5 cursor-pointer select-none"
            style={{
              background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
            }}
          >
            <div
              className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full border border-gray-200 shadow-sm cursor-pointer pointer-events-none transform -translate-x-1/2"
              style={{ left: `${(hsv.h / 360) * 100}%` }}
            >
              <div className="w-full h-full rounded-full border-2 border-white" style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}></div>
            </div>
          </div>

          {/* Actions Row */}
          <div className="flex items-center gap-3 pb-2">
            <div className="flex-1 flex items-center gap-3 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-1 focus-within:ring-black/20 focus-within:border-black/20 dark:focus-within:border-white/20 transition-all">
              <div className="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm shrink-0" style={{ backgroundColor: hex }}></div>
              <span className="text-gray-400 text-sm">#</span>
              <input
                type="text"
                value={hex.replace('#', '')}
                onChange={handleHexChange}
                className="w-full text-sm font-medium text-text-main dark:text-white outline-none uppercase bg-transparent"
              />
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm shrink-0"
              title="Save & Close"
            >
              <Check className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Generic Delete Confirmation Modal
const ConfirmDeleteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}> = ({ isOpen, onClose, onConfirm, title, description }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-[400px] overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-main dark:text-white">{title}</h3>
            <p className="text-sm text-text-sub dark:text-gray-400 mt-1">{description}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Issue Modal
const AddIssueModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAdd: (issue: { title: string; status: string; description: string }) => void;
}> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Draft');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setStatus('Draft');
      setDescription('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-[480px] flex flex-col animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xl font-serif font-medium text-text-main dark:text-white">Add Platform Issue</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-main dark:text-white mb-2">Issue Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:border-black dark:focus:border-white text-text-main dark:text-white outline-none transition-all"
              placeholder="e.g. Public Transport Expansion"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main dark:text-white mb-2">Status</label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-text-main dark:text-white focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:border-black dark:focus:border-white outline-none"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="Draft">Draft</option>
                <option value="Review">Review</option>
                <option value="Published">Published</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main dark:text-white mb-2">Description</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:border-black dark:focus:border-white text-text-main dark:text-white outline-none transition-all resize-none"
              placeholder="Brief summary of the stance..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 rounded-b-xl border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancel</button>
          <button
            onClick={() => {
              if (title.trim()) {
                onAdd({ title, status, description });
              }
            }}
            disabled={!title.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            Add Issue
          </button>
        </div>
      </div>
    </div>
  );
}

// Add Opponent Modal
const AddOpponentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAdd: (opponent: { name: string; party: string; tags: string[] }) => void;
}> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [party, setParty] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setParty('');
      setTags([]);
      setCurrentTag('');
      setIsAddingTag(false);
    }
  }, [isOpen]);

  const handleAddTag = () => {
    if (currentTag.trim()) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-[480px] flex flex-col animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xl font-serif font-medium text-text-main dark:text-white">Add Opponent</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-main dark:text-white mb-2">Full Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:border-black dark:focus:border-white text-text-main dark:text-white outline-none transition-all"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main dark:text-white mb-2">Party Affiliation</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:border-black dark:focus:border-white text-text-main dark:text-white outline-none transition-all"
              placeholder="e.g. Independent"
              value={party}
              onChange={e => setParty(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main dark:text-white mb-2">Key Tags</label>
            <div className="flex flex-wrap gap-2 min-h-[38px] p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-black/5 dark:focus-within:ring-white/10 focus-within:border-black dark:focus-within:border-white transition-all">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1.5 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {isAddingTag ? (
                <div className="flex-1 min-w-[120px] flex items-center">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={e => setCurrentTag(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => { if (!currentTag.trim()) setIsAddingTag(false); }}
                    autoFocus
                    className="w-full text-sm bg-transparent outline-none border-none p-0 focus:ring-0 text-text-main dark:text-white"
                    placeholder="Type tag..."
                  />
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleAddTag}
                    className="ml-1 p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-black dark:text-white"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingTag(true)}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Tag
                </button>
              )}
            </div>
            <p className="text-xs text-text-sub dark:text-gray-400 mt-1">These will appear as badges on the opponent card.</p>
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 rounded-b-xl border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancel</button>
          <button
            onClick={() => {
              if (name.trim()) {
                onAdd({ name, party, tags });
              }
            }}
            disabled={!name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            Add Opponent
          </button>
        </div>
      </div>
    </div>
  );
}