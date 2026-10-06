/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ClipboardCheck, 
  History, 
  Plus, 
  Save, 
  FileText, 
  Camera, 
  Trash2, 
  ArrowLeft, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Download, 
  Share2, 
  WifiOff,
  Building2,
  Users,
  ShieldCheck,
  Search,
  Check,
  Sparkles,
  Info
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { InspectionReport, ChecklistItem, InspectionStatus, SeverityLevel, CorrectiveAction } from './types';
import { CHECKLIST_TEMPLATE } from './data/checklist';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { generatePDF } from './utils/pdf';
import { PWAInstallButton } from './components/PWAInstallButton';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Common Quick Findings Suggestions tailored for Non-Technical Office Inspectors
const QUICK_SUGGESTIONS: Record<string, string[]> = {
  'A.1': ['Wobbly chair cylinder', 'Damaged armrest', 'Broken wheel caster', 'Lumbar adjustment broken'],
  'A.2': ['Screen positioned too low', 'Severe window reflection / glare', 'Monitor flickering', 'Too close to employee eyes'],
  'A.3': ['Boxes stored under desk', 'Trash can blocking knee space', 'Cables tangled around staff feet'],
  'A.4': ['Staff requests wrist rest pad', 'Mouse used on uncomfortable edge', 'Awkward typing angle'],
  'B.1': ['Power cord trailing across aisle', 'Laptop charger draped over walkway', 'Trip hazard behind desk'],
  'B.2': ['Daisy-chained power strips', 'Overloaded wall socket', 'Cracked extension casing'],
  'B.3': ['Kettle cord frayed / taped', 'Electric heater uninspected', 'Shredder cord pinched under furniture'],
  'B.4': ['Electrical panel door blocked by boxes', 'Panel left unlocked', 'No clear 1m clearance in front of breaker'],
  'C.1': ['Delivery boxes stored in hallway', 'Spare chairs obstructing walkway', 'Coat rack blocking aisle'],
  'C.2': ['Curled carpet tile edge', 'Loose floor transition trim', 'Liquid spill on tile floor'],
  'C.3': ['Flickering ceiling light tube', 'Burned-out bulb above workstations', 'Area too dim for reading'],
  'C.4': ['Paper recycling bin overflowing', 'Loose cardboard stacked against heater', 'Shredded paper bags accumulating'],
  'D.1': ['Extinguisher blocked by storage box', 'Pressure gauge needle in red zone', 'Monthly inspection tag missing/expired'],
  'D.2': ['Emergency exit door wedged open', 'Exit door hard to push open', 'Illuminated EXIT sign light unlit'],
  'D.3': ['Smoke detector blocked by partition', 'Manual break-glass alarm blocked', 'Ceiling tile missing near detector'],
  'D.4': ['Floor evacuation diagram missing', 'Warden contact list outdated', 'Assembly point sign not posted'],
  'E.1': ['Microwave interior soiled', 'Coffee machine cord near water sink', 'Refrigerator door seal worn'],
  'E.2': ['Water puddle near dispenser', 'No paper towels in pantry', 'Slippery floor near sink'],
  'E.3': ['Water cooler drip tray overflowing', 'Water dispenser filter overdue', 'Bottles stored untidily'],
  'E.4': ['Pantry bin not covered', 'Food left uncovered overnight', 'Pantry bin overflowing'],
  'F.1': ['Tall bookcase not anchored to wall', 'Racking unit wobbling', 'Archive shelving unstable'],
  'F.2': ['Heavy paper boxes on high shelf', 'Shelves overloaded beyond capacity', 'Boxes stacked less than 0.5m from sprinkler'],
  'F.3': ['Filing cabinet drawer sticks out', 'Anti-tip drawer lock broken', 'Cabinet drawers overloaded'],
  'F.4': ['No safety step stool available', 'Staff seen standing on swivel chair', 'Damaged step ladder in archive'],
  'G.1': ['Office temperature too cold / hot', 'AC airflow blowing directly on staff', 'Air supply vent clogged with dust'],
  'G.2': ['Chemical odor from cleaning supplies', 'Toner fumes in print alcove', 'Stale air in closed meeting room'],
  'G.3': ['Loud photocopier disturbing desks', 'Noisy AC return grill', 'Echo in conference room'],
  'G.4': ['Window blind slats broken', 'Blind pull cord stuck', 'Direct afternoon glare on workstation screens'],
  'H.1': ['First aid kit missing bandages', 'Antiseptic wipes expired', 'First aid box locked with no key'],
  'H.2': ['No first aiders list posted', 'First aider phone numbers wrong', 'Emergency contacts missing'],
  'H.3': ['Restroom hand soap empty', 'Hand dryer not blowing warm air', 'Water tap leaking in washroom'],
  'H.4': ['HSE policy poster missing', 'Near-miss reporting QR code torn', 'Emergency helpline number not visible']
};

// --- Hooks ---

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// --- Offline Indicator ---

const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-2xl border-2 border-white animate-bounce">
      <WifiOff className="w-4 h-4" />
      OFFLINE MODE · WORKING LOCALLY
    </div>
  );
};

// --- Form UI Components ---

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success', size?: 'sm' | 'md' | 'lg' }>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-blue-700 text-white hover:bg-blue-800 shadow-sm border border-blue-800',
      secondary: 'bg-white text-zinc-800 border border-zinc-200 hover:bg-zinc-50 shadow-sm',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm border border-red-700',
      success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm border border-emerald-700',
      ghost: 'bg-transparent text-zinc-600 hover:bg-zinc-100'
    };
    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 ring-offset-white placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent transition-all',
        className
      )}
      {...props}
    />
  )
);

const Label = ({ children, className, subtitle }: { children: React.ReactNode, className?: string, subtitle?: string }) => (
  <div className={cn('mb-1.5', className)}>
    <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block">
      {children}
    </label>
    {subtitle && <p className="text-[11px] text-zinc-400 mt-0.5">{subtitle}</p>}
  </div>
);

// --- Sample Initial Report for First-Time Users ---
function createDefaultOfficeReport(): InspectionReport {
  return {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDraft: true,
    building: 'KSIA HQ Main Building',
    department: 'Human Resources & Talent',
    floor: 'Level 2',
    officeRoom: 'Suite 204 - Open Workspace',
    leadInspector: 'Ahmed Al-Harbi',
    staffId: 'EMP-4482',
    badgeId: 'KSIA-9901',
    departmentManager: 'Mona Al-Dosari',
    inspectionDate: format(new Date(), 'yyyy-MM-dd'),
    shift: 'Standard Office Hours (08:00 - 16:30)',
    auditType: 'Monthly Routine Office HSE Walk',
    safetyOfficer: 'Sultan Al-Otaibi (Floor Warden)',
    contactExt: 'Ext. 4108',
    facility: 'KSIA HQ Main Building',
    zoneId: 'Suite 204',
    concourse: '',
    workersConsulted: true,
    consultationDetails: 'Consulted 4 office employees; noted glare on desk 12 and cold AC vent above desk 15.',
    hazardAssessmentRef: `KSIA-OFC-${format(new Date(), 'yyyy')}-001`,
    modules: JSON.parse(JSON.stringify(CHECKLIST_TEMPLATE)),
    correctiveActions: [],
    leadSignatory: 'Ahmed Al-Harbi',
    areaManagerSignatory: '',
    chiefSignatory: ''
  };
}

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'dashboard' | 'form'>('dashboard');
  const [reports, setReports] = useState<InspectionReport[]>([]);
  const [currentReport, setCurrentReport] = useState<InspectionReport | null>(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState<number>(-1); // -1 for Admin/Header, 0-7 for Modules, 8 for CAP, 9 for Summary
  const [searchQuery, setSearchQuery] = useState('');

  // Load saved reports or initialize with default sample
  useEffect(() => {
    const savedReports = localStorage.getItem('ksia_office_reports');
    if (savedReports) {
      try {
        const parsed = JSON.parse(savedReports);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReports(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to load reports', e);
      }
    }
    
    // Check old storage key for migration if exists
    const legacyReports = localStorage.getItem('ksia_reports');
    if (legacyReports) {
      try {
        const parsedLegacy = JSON.parse(legacyReports);
        if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
          setReports(parsedLegacy);
          return;
        }
      } catch (e) {
        // ignore
      }
    }

    // Default sample
    const sample = createDefaultOfficeReport();
    setReports([sample]);
    localStorage.setItem('ksia_office_reports', JSON.stringify([sample]));
  }, []);

  const saveReports = useCallback((updatedReports: InspectionReport[]) => {
    setReports(updatedReports);
    localStorage.setItem('ksia_office_reports', JSON.stringify(updatedReports));
  }, []);

  const createNewReport = () => {
    const newReport: InspectionReport = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDraft: true,
      building: 'KSIA HQ Main Building',
      department: 'Corporate Administration',
      floor: 'Level 1',
      officeRoom: '',
      leadInspector: '',
      staffId: '',
      badgeId: '',
      departmentManager: '',
      inspectionDate: format(new Date(), 'yyyy-MM-dd'),
      shift: 'Standard Office Hours (08:00 - 16:30)',
      auditType: 'Monthly Routine Office HSE Walk',
      safetyOfficer: '',
      contactExt: '',
      facility: 'KSIA HQ Main Building',
      zoneId: '',
      workersConsulted: false,
      consultationDetails: '',
      hazardAssessmentRef: `KSIA-OFC-${format(new Date(), 'yyyy')}-${Math.floor(100 + Math.random() * 900)}`,
      modules: JSON.parse(JSON.stringify(CHECKLIST_TEMPLATE)),
      correctiveActions: [],
      leadSignatory: '',
      areaManagerSignatory: '',
      chiefSignatory: ''
    };
    setCurrentReport(newReport);
    setActiveModuleIndex(-1);
    setView('form');
  };

  const handleSave = () => {
    if (!currentReport) return;
    const updatedReport = { 
      ...currentReport, 
      updatedAt: new Date().toISOString(),
      facility: currentReport.building,
      zoneId: currentReport.officeRoom || currentReport.department
    };
    const existingIndex = reports.findIndex(r => r.id === updatedReport.id);
    let newReports: InspectionReport[];
    if (existingIndex > -1) {
      newReports = [...reports];
      newReports[existingIndex] = updatedReport;
    } else {
      newReports = [updatedReport, ...reports];
    }
    saveReports(newReports);
    setCurrentReport(updatedReport);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this office inspection report? This cannot be undone.')) {
      const updatedReports = reports.filter(r => r.id !== id);
      saveReports(updatedReports);
      if (currentReport?.id === id) {
        setView('dashboard');
        setCurrentReport(null);
      }
    }
  };

  const openReport = (report: InspectionReport) => {
    // Ensure all 8 office modules exist even if loaded from older structure
    const updated = JSON.parse(JSON.stringify(report));
    if (!updated.modules || updated.modules.length === 0 || !updated.modules[0].shortTitle) {
      updated.modules = JSON.parse(JSON.stringify(CHECKLIST_TEMPLATE));
    }
    setCurrentReport(updated);
    setActiveModuleIndex(-1);
    setView('form');
  };

  const updateReportField = (field: keyof InspectionReport, value: any) => {
    if (!currentReport) return;
    setCurrentReport({ ...currentReport, [field]: value });
  };

  const updateModuleItem = (moduleIndex: number, itemIndex: number, updates: Partial<ChecklistItem>) => {
    if (!currentReport) return;
    const newModules = [...currentReport.modules];
    const prevItem = newModules[moduleIndex].items[itemIndex];
    const updatedItem = {
      ...prevItem,
      ...updates
    };

    // If setting to FAIL, set sensible default severity and risk if not set
    if (updates.status === 'F' && !updatedItem.severity) {
      updatedItem.severity = 'L1';
      updatedItem.likelihood = 2;
      updatedItem.consequence = 2;
    }

    newModules[moduleIndex].items[itemIndex] = updatedItem;
    
    // Automatically manage corrective actions if failed
    let newCAP = [...currentReport.correctiveActions];
    
    if (updatedItem.status === 'F') {
      const existingIdx = newCAP.findIndex(ca => ca.id === updatedItem.id);
      const capEntry: CorrectiveAction = {
        id: updatedItem.id,
        location: updatedItem.location || currentReport.officeRoom || 'Office Area',
        defect: updatedItem.finding || `${updatedItem.item} deficiency`,
        severity: updatedItem.severity || 'L1',
        containment: existingIdx > -1 ? newCAP[existingIdx].containment : 'Issue flagged for facility maintenance',
        owner: existingIdx > -1 ? newCAP[existingIdx].owner : 'Facilities Management / Dept Admin',
        targetSla: existingIdx > -1 ? newCAP[existingIdx].targetSla : '48 Hours',
        signOff: existingIdx > -1 ? newCAP[existingIdx].signOff : ''
      };

      if (existingIdx > -1) {
        newCAP[existingIdx] = { ...newCAP[existingIdx], ...capEntry };
      } else {
        newCAP.push(capEntry);
      }
    } else if (updates.status && updates.status !== 'F') {
      // Remove from CAP if changed to Pass or N/A
      newCAP = newCAP.filter(ca => ca.id !== updatedItem.id);
    }

    setCurrentReport({ ...currentReport, modules: newModules, correctiveActions: newCAP });
  };

  // Quick Action for Non-Technical Staff: Mark remaining unchecked in current module as PASS
  const markModuleRemainingAsPass = (moduleIndex: number) => {
    if (!currentReport) return;
    const newModules = [...currentReport.modules];
    const module = newModules[moduleIndex];
    let changed = false;

    module.items = module.items.map(item => {
      if (item.status === null) {
        changed = true;
        return { ...item, status: 'P' as InspectionStatus };
      }
      return item;
    });

    if (changed) {
      setCurrentReport({ ...currentReport, modules: newModules });
    }
  };

  const updateCAP = (index: number, updates: Partial<CorrectiveAction>) => {
    if (!currentReport) return;
    const newCAP = [...currentReport.correctiveActions];
    newCAP[index] = { ...newCAP[index], ...updates };
    setCurrentReport({ ...currentReport, correctiveActions: newCAP });
  };

  const handlePhotoCapture = (moduleIndex: number, itemIndex: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const currentPhotos = currentReport?.modules[moduleIndex].items[itemIndex].photos || [];
      updateModuleItem(moduleIndex, itemIndex, { photos: [...currentPhotos, base64] });
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (moduleIndex: number, itemIndex: number, photoIndex: number) => {
    const currentPhotos = currentReport?.modules[moduleIndex].items[itemIndex].photos || [];
    const newPhotos = [...currentPhotos];
    newPhotos.splice(photoIndex, 1);
    updateModuleItem(moduleIndex, itemIndex, { photos: newPhotos });
  };

  const handleExportPDF = async () => {
    if (!currentReport) return;
    handleSave();
    await generatePDF(currentReport);
  };

  // Quick helper to compute summary counts
  const getReportStats = (report: InspectionReport) => {
    let totalChecked = 0;
    let passed = 0;
    let failed = 0;
    let na = 0;
    let totalItems = 0;

    report.modules.forEach(m => {
      m.items.forEach(i => {
        totalItems++;
        if (i.status === 'P') { passed++; totalChecked++; }
        else if (i.status === 'F') { failed++; totalChecked++; }
        else if (i.status === 'N/A') { na++; totalChecked++; }
      });
    });

    return { totalChecked, passed, failed, na, totalItems };
  };

  // --- Rendering Dashboard ---

  const renderDashboard = () => {
    const filteredReports = reports.filter(r => {
      const q = searchQuery.toLowerCase();
      const bldg = (r.building || r.facility || '').toLowerCase();
      const dept = (r.department || '').toLowerCase();
      const room = (r.officeRoom || r.zoneId || '').toLowerCase();
      const insp = (r.leadInspector || '').toLowerCase();
      return bldg.includes(q) || dept.includes(q) || room.includes(q) || insp.includes(q);
    });

    const totalAudits = reports.length;
    const totalDeficiencies = reports.reduce((acc, r) => acc + (r.correctiveActions?.length || 0), 0);

    return (
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                <Building2 className="w-3.5 h-3.5" />
                King Salman International Airport
              </span>
              <span className="text-xs font-semibold text-zinc-400">· Admin Spaces HSE</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900">
              Airport Administrative Office Safety Inspections
            </h1>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Clear, practical HSE inspection tool for office facilities, workstations, and staff welfare.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <PWAInstallButton />
            <Button onClick={createNewReport} className="h-11 px-5 text-sm shadow-md">
              <Plus className="w-4 h-4" />
              New Office Inspection
            </Button>
          </div>
        </header>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Inspections</span>
            <div className="text-2xl md:text-3xl font-black text-zinc-900 mt-1">{totalAudits}</div>
            <p className="text-[11px] text-zinc-400 mt-1">Stored locally</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Offices Checked</span>
            <div className="text-2xl md:text-3xl font-black text-emerald-600 mt-1">
              {reports.filter(r => !r.isDraft).length}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Completed audits</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Drafts In Progress</span>
            <div className="text-2xl md:text-3xl font-black text-amber-600 mt-1">
              {reports.filter(r => r.isDraft).length}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Can resume anytime</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600">Open Action Items</span>
            <div className="text-2xl md:text-3xl font-black text-red-600 mt-1">{totalDeficiencies}</div>
            <p className="text-[11px] text-zinc-400 mt-1">Deficiencies flagged</p>
          </div>
        </div>

        {/* Inspection History Section */}
        <section className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-xs">
          <div className="p-4 md:p-6 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Office Audit Records</h2>
            </div>
            
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by building, dept, or room..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardCheck className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
              <h3 className="text-base font-bold text-zinc-700">No inspections match your search</h3>
              <p className="text-xs text-zinc-400 mt-1">Start a new inspection using the button above.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filteredReports.map(report => {
                const stats = getReportStats(report);
                const buildingName = report.building || report.facility || 'KSIA Administrative Offices';
                const departmentName = report.department || 'Administrative Unit';
                const officeLocation = report.officeRoom || report.zoneId || 'General Office Space';

                return (
                  <div 
                    key={report.id} 
                    className="p-4 md:p-5 hover:bg-zinc-50/80 transition-colors flex items-center justify-between gap-4 cursor-pointer group"
                    onClick={() => openReport(report)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-zinc-900 text-sm md:text-base group-hover:text-blue-700 transition-colors">
                          {departmentName}
                        </span>
                        <span className="text-xs text-zinc-400">·</span>
                        <span className="text-xs font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md">
                          {officeLocation}
                        </span>
                        {report.isDraft ? (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            Draft
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                        <span className="flex items-center gap-1 text-zinc-600 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                          {buildingName} ({report.floor || 'Level 1'})
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-zinc-400" />
                          {report.inspectionDate}
                        </span>
                        <span>·</span>
                        <span>Inspector: {report.leadInspector || 'Not Assigned'}</span>
                        
                        {stats.failed > 0 && (
                          <span className="text-red-600 font-bold flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" />
                            {stats.failed} Issue{stats.failed > 1 ? 's' : ''} Flagged
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Delete Inspection"
                        onClick={(e) => { e.stopPropagation(); handleDelete(report.id); }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-zinc-200 text-center">
          <p className="text-xs text-zinc-500 font-medium">
            King Salman International Airport · Administrative Offices Health, Safety & Environment (HSE) Management
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            Compliant with ISO 45001:2018 (Workplace Occupational Health & Safety) & ISO 14001:2015
          </p>
        </footer>
      </div>
    );
  };

  // --- Rendering Form Header ("Audit Header & Admin") ---

  const renderFormHeader = () => {
    if (!currentReport) return null;

    const buildingOptions = [
      'KSIA HQ Main Building',
      'Admin Tower A',
      'Admin Tower B',
      'Operations Center (Admin Wing)',
      'Aviation Support Complex',
      'Cargo Admin Block'
    ];

    const departmentOptions = [
      'Human Resources & Talent',
      'Finance & Commercial',
      'Information Technology',
      'Aviation Safety & Compliance',
      'Legal & Corporate Governance',
      'Corporate Communications',
      'Facilities & Engineering Admin',
      'Procurement & Contracts'
    ];

    const floorOptions = [
      'Ground Floor',
      'Level 1',
      'Level 2',
      'Level 3',
      'Level 4 / Executive Suite',
      'Basement Level'
    ];

    return (
      <div className="space-y-8">
        {/* Guidance Banner for Non-Technical Staff */}
        <div className="bg-blue-50/70 border border-blue-200/80 p-4 md:p-5 rounded-2xl flex items-start gap-3.5">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-blue-900">Administrative Office Inspection Info</h4>
            <p className="text-xs text-blue-700 leading-relaxed mt-0.5">
              Fill in the office space details below. This information identifies the specific administrative department, building, and floor being evaluated.
            </p>
          </div>
        </div>

        {/* Zone 1: Location & Department */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-zinc-500" />
            1. Office Location & Department
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Building Selection */}
            <div>
              <Label subtitle="Choose or specify the airport administrative building">
                Administrative Building / HQ Complex
              </Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {buildingOptions.map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => updateReportField('building', b)}
                    className={cn(
                      'px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer',
                      currentReport.building === b 
                        ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-xs' 
                        : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                    )}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <Input 
                value={currentReport.building || ''} 
                onChange={e => updateReportField('building', e.target.value)}
                placeholder="Or type custom building name..."
              />
            </div>

            {/* Department Selection */}
            <div>
              <Label subtitle="Select or enter the business unit occupying the space">
                Department / Business Unit
              </Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {departmentOptions.slice(0, 4).map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => updateReportField('department', d)}
                    className={cn(
                      'px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer',
                      currentReport.department === d 
                        ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-xs' 
                        : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <Input 
                value={currentReport.department || ''} 
                onChange={e => updateReportField('department', e.target.value)}
                placeholder="e.g. Human Resources, Finance, Legal..."
              />
            </div>

            {/* Floor / Level */}
            <div>
              <Label subtitle="Select building level">
                Floor / Level
              </Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {floorOptions.map(fl => (
                  <button
                    key={fl}
                    type="button"
                    onClick={() => updateReportField('floor', fl)}
                    className={cn(
                      'px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer',
                      currentReport.floor === fl 
                        ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-xs' 
                        : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                    )}
                  >
                    {fl}
                  </button>
                ))}
              </div>
              <Input 
                value={currentReport.floor || ''} 
                onChange={e => updateReportField('floor', e.target.value)}
                placeholder="e.g. Level 2, Floor 3"
              />
            </div>

            {/* Office Suite / Room / Area */}
            <div>
              <Label subtitle="Specific room, suite number, or open plan section">
                Office Suite / Room / Area
              </Label>
              <Input 
                value={currentReport.officeRoom || ''} 
                onChange={e => {
                  updateReportField('officeRoom', e.target.value);
                  updateReportField('zoneId', e.target.value);
                }}
                placeholder="e.g. Suite 204 - Open Workspace, Boardroom B, Accounts Archive"
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-zinc-200" />

        {/* Zone 2: Inspector & Department Manager */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-500" />
            2. Inspection Staff & Department Contacts
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Lead HSE Inspector Name</Label>
              <Input 
                value={currentReport.leadInspector || ''} 
                onChange={e => updateReportField('leadInspector', e.target.value)}
                placeholder="Inspector full name"
              />
            </div>
            <div>
              <Label>Staff Employee ID</Label>
              <Input 
                value={currentReport.staffId || ''} 
                onChange={e => updateReportField('staffId', e.target.value)}
                placeholder="e.g. EMP-4482"
              />
            </div>
            <div>
              <Label>Airport Security Badge ID</Label>
              <Input 
                value={currentReport.badgeId || ''} 
                onChange={e => updateReportField('badgeId', e.target.value)}
                placeholder="e.g. KSIA-0914"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Department / Office Manager</Label>
              <Input 
                value={currentReport.departmentManager || ''} 
                onChange={e => updateReportField('departmentManager', e.target.value)}
                placeholder="Name of department manager"
              />
            </div>
            <div>
              <Label>Floor Safety Warden / HSE Contact</Label>
              <Input 
                value={currentReport.safetyOfficer || ''} 
                onChange={e => updateReportField('safetyOfficer', e.target.value)}
                placeholder="e.g. Mona Al-Shehri (Floor Warden)"
              />
            </div>
            <div>
              <Label>Office Phone Ext. / Desk Phone</Label>
              <Input 
                value={currentReport.contactExt || ''} 
                onChange={e => {
                  updateReportField('contactExt', e.target.value);
                  updateReportField('phoneExt', e.target.value);
                }}
                placeholder="e.g. Ext. 4108"
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-zinc-200" />

        {/* Zone 3: Date, Shift & Purpose */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-zinc-500" />
            3. Inspection Date & Audit Purpose
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Inspection Date</Label>
              <Input 
                type="date"
                value={currentReport.inspectionDate || ''} 
                onChange={e => updateReportField('inspectionDate', e.target.value)}
              />
            </div>

            <div>
              <Label>Working Hours / Shift</Label>
              <select 
                value={currentReport.shift || 'Standard Office Hours (08:00 - 16:30)'} 
                onChange={e => updateReportField('shift', e.target.value)}
                className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <option value="Standard Office Hours (08:00 - 16:30)">Standard Office Hours (08:00 - 16:30)</option>
                <option value="Extended Shift (Morning)">Extended Shift (Morning)</option>
                <option value="Extended Shift (Evening)">Extended Shift (Evening)</option>
                <option value="After-Hours / Weekend Walk">After-Hours / Weekend Walk</option>
              </select>
            </div>

            <div>
              <Label>Audit Purpose / Type</Label>
              <select 
                value={currentReport.auditType || 'Monthly Routine Office HSE Walk'} 
                onChange={e => updateReportField('auditType', e.target.value)}
                className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <option value="Monthly Routine Office HSE Walk">Monthly Routine Office HSE Walk</option>
                <option value="Workstation Ergonomics & Safety Review">Workstation Ergonomics & Safety Review</option>
                <option value="Quarterly Floor Hazard Assessment">Quarterly Floor Hazard Assessment</option>
                <option value="New Office Setup & Move-In Check">New Office Setup & Move-In Check</option>
                <option value="Post-Incident Office Walkthrough">Post-Incident Office Walkthrough</option>
              </select>
            </div>
          </div>
        </div>

        <div className="h-px bg-zinc-200" />

        {/* Zone 4: Staff Consultation (ISO 45001 Cl. 5.4) */}
        <div className="bg-emerald-50/60 p-5 md:p-6 rounded-2xl border border-emerald-200 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900">
                Staff Consultation & Engagement (ISO 45001 Cl. 5.4)
              </h3>
              <p className="text-[11px] text-emerald-700">
                ISO 45001 requires consulting personnel working in the office regarding their safety and comfort.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            <div className="md:col-span-5 flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-100 shadow-2xs">
              <div>
                <span className="text-xs font-bold text-zinc-800 block">Staff Consulted On-Site?</span>
                <span className="text-[11px] text-zinc-500">Did you ask office staff about hazards or concerns?</span>
              </div>
              <button
                type="button"
                onClick={() => updateReportField('workersConsulted', !currentReport.workersConsulted)}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ml-2',
                  currentReport.workersConsulted ? 'bg-emerald-600' : 'bg-zinc-300'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    currentReport.workersConsulted ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>

            <div className="md:col-span-7">
              <Label subtitle="Note any employee feedback or reported discomfort">
                Consultation Feedback & Observations
              </Label>
              <Input 
                value={currentReport.consultationDetails || ''} 
                onChange={e => updateReportField('consultationDetails', e.target.value)}
                placeholder={currentReport.workersConsulted ? "e.g. Consulted 3 staff members; noted glare on desk 12 and cold AC vent" : "Toggle switch to add consultation notes"}
                disabled={!currentReport.workersConsulted}
              />
            </div>
          </div>

          <div className="pt-2">
            <Label subtitle="Unique tracking reference code">
              Office Assessment Reference Number
            </Label>
            <Input 
              value={currentReport.hazardAssessmentRef || ''} 
              onChange={e => updateReportField('hazardAssessmentRef', e.target.value)}
              placeholder="e.g. KSIA-OFC-2026-001"
              className="max-w-md bg-white font-mono text-xs"
            />
          </div>
        </div>
      </div>
    );
  };

  // --- Rendering Systematic Module Items ---

  const renderModule = (index: number) => {
    if (!currentReport) return null;
    const module = currentReport.modules[index];
    if (!module) return null;

    const uncheckedCount = module.items.filter(i => i.status === null).length;

    return (
      <div className="space-y-8">
        {/* Module Header Bar */}
        <div className="bg-zinc-50 border border-zinc-200 p-4 md:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                Module {module.id}
              </span>
              <span className="text-xs text-zinc-500 font-semibold">{module.shortTitle || module.title}</span>
            </div>
            <p className="text-xs text-zinc-600 mt-1 font-medium">{module.statutoryRefs}</p>
          </div>

          {/* Quick Mark All Pass Button */}
          {uncheckedCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => markModuleRemainingAsPass(index)}
              className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 self-start md:self-auto flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Mark {uncheckedCount} Unchecked as PASS
            </Button>
          )}
        </div>

        {/* Items List */}
        <div className="space-y-10">
          {module.items.map((item, itemIdx) => {
            const suggestions = QUICK_SUGGESTIONS[item.id] || [];

            return (
              <div 
                key={item.id} 
                className={cn(
                  'p-5 md:p-6 rounded-2xl border transition-all',
                  item.status === 'P' ? 'bg-white border-emerald-200/80 shadow-2xs' :
                  item.status === 'F' ? 'bg-red-50/20 border-red-200 shadow-xs' :
                  item.status === 'N/A' ? 'bg-zinc-50 border-zinc-200' :
                  'bg-white border-zinc-200'
                )}
              >
                {/* Item Title & Criteria */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <h4 className="font-bold text-zinc-900 text-base md:text-lg leading-snug flex items-center gap-2">
                      <span className="text-blue-700 font-black">{item.ref}</span>
                      <span>{item.item}</span>
                    </h4>
                    <p className="text-zinc-600 text-xs md:text-sm leading-relaxed mt-1">
                      {item.criteria}
                    </p>
                  </div>
                </div>

                {/* Status Selection Buttons */}
                <div className="mb-5">
                  <Label>Inspection Result</Label>
                  <div className="grid grid-cols-3 gap-2 max-w-md">
                    <button
                      type="button"
                      onClick={() => updateModuleItem(index, itemIdx, { status: 'P' })}
                      className={cn(
                        'py-2.5 px-3 text-xs md:text-sm font-black rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center gap-1.5',
                        item.status === 'P' 
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200' 
                          : 'bg-white border-zinc-200 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/50'
                      )}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      PASS (SAFE)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateModuleItem(index, itemIdx, { status: 'F' })}
                      className={cn(
                        'py-2.5 px-3 text-xs md:text-sm font-black rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center gap-1.5',
                        item.status === 'F' 
                          ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-200' 
                          : 'bg-white border-zinc-200 text-red-700 hover:border-red-300 hover:bg-red-50/50'
                      )}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      FAIL (ISSUE)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateModuleItem(index, itemIdx, { status: 'N/A' })}
                      className={cn(
                        'py-2.5 px-3 text-xs md:text-sm font-black rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center gap-1.5',
                        item.status === 'N/A' 
                          ? 'bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-200' 
                          : 'bg-white border-zinc-200 text-amber-700 hover:border-amber-300 hover:bg-amber-50/50'
                      )}
                    >
                      <XCircle className="w-4 h-4" />
                      N/A
                    </button>
                  </div>
                </div>

                {/* When FAIL is selected: Simple, clear defect entry for non-technical users */}
                {item.status === 'F' && (
                  <div className="bg-red-50/50 p-4 md:p-5 rounded-2xl border border-red-200 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-black uppercase tracking-wider text-red-800">
                        Deficiency Details & Action Required
                      </span>
                    </div>

                    {/* Common Quick Suggestion Chips */}
                    {suggestions.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-zinc-500 uppercase block mb-1.5 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Tap to auto-fill common office issue:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {suggestions.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => updateModuleItem(index, itemIdx, { finding: sug })}
                              className={cn(
                                'text-xs px-2.5 py-1 rounded-lg border font-medium transition-all text-left cursor-pointer',
                                item.finding === sug 
                                  ? 'bg-red-600 border-red-700 text-white shadow-xs' 
                                  : 'bg-white border-red-200 text-zinc-700 hover:bg-red-100/60'
                              )}
                            >
                              + {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Location & Specific Finding Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label subtitle="Where in the office is this issue located?">
                          Exact Office Location / Desk
                        </Label>
                        <Input 
                          value={item.location || ''} 
                          onChange={e => updateModuleItem(index, itemIdx, { location: e.target.value })}
                          placeholder="e.g. Desk #14, Near pantry sink, Corner archive"
                        />
                      </div>
                      <div>
                        <Label subtitle="Describe what needs to be fixed">
                          Specific Finding / Hazard Description
                        </Label>
                        <Input 
                          value={item.finding || ''} 
                          onChange={e => updateModuleItem(index, itemIdx, { finding: e.target.value })}
                          placeholder="e.g. Chair wobbly and armrest broken"
                        />
                      </div>
                    </div>

                    {/* Severity / Priority for Non-Technical Staff */}
                    <div>
                      <Label subtitle="How urgently does this need to be resolved?">
                        Priority Level
                      </Label>
                      <div className="grid grid-cols-3 gap-2 max-w-lg">
                        <button
                          type="button"
                          onClick={() => updateModuleItem(index, itemIdx, { 
                            severity: 'L1',
                            likelihood: 2,
                            consequence: 2
                          })}
                          className={cn(
                            'p-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer',
                            item.severity === 'L1' 
                              ? 'bg-amber-500 border-amber-600 text-white shadow-xs' 
                              : 'bg-white border-zinc-200 text-zinc-700 hover:bg-amber-50'
                          )}
                        >
                          🟢 Low (Routine)
                          <span className="block text-[10px] font-normal opacity-90 mt-0.5">Minor housekeeping</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => updateModuleItem(index, itemIdx, { 
                            severity: 'L2',
                            likelihood: 3,
                            consequence: 3
                          })}
                          className={cn(
                            'p-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer',
                            item.severity === 'L2' 
                              ? 'bg-orange-500 border-orange-600 text-white shadow-xs' 
                              : 'bg-white border-zinc-200 text-zinc-700 hover:bg-orange-50'
                          )}
                        >
                          🟡 Medium (48h)
                          <span className="block text-[10px] font-normal opacity-90 mt-0.5">Prompt attention</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => updateModuleItem(index, itemIdx, { 
                            severity: 'L3',
                            likelihood: 4,
                            consequence: 4
                          })}
                          className={cn(
                            'p-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer',
                            item.severity === 'L3' 
                              ? 'bg-red-700 border-red-800 text-white shadow-xs' 
                              : 'bg-white border-zinc-200 text-zinc-700 hover:bg-red-50'
                          )}
                        >
                          🔴 High (Urgent)
                          <span className="block text-[10px] font-normal opacity-90 mt-0.5">Immediate danger</span>
                        </button>
                      </div>
                    </div>

                    {/* Photo Capture */}
                    <div>
                      <Label subtitle="Take or attach photo evidence for facility work orders">
                        Photo Evidence
                      </Label>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        {item.photos.map((photo, pIdx) => (
                          <div key={pIdx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-zinc-300">
                            <img src={photo} alt="Office Hazard Evidence" className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => removePhoto(index, itemIdx, pIdx)}
                              className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow-md hover:bg-red-700 transition"
                              title="Delete Photo"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        
                        {/* Camera */}
                        <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-xl cursor-pointer hover:bg-blue-100/50 transition active:scale-95">
                          <Camera className="w-5 h-5 text-blue-700" />
                          <span className="text-[10px] text-blue-800 mt-1 font-bold">Camera</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment" 
                            className="hidden" 
                            onChange={e => e.target.files?.[0] && handlePhotoCapture(index, itemIdx, e.target.files[0])}
                          />
                        </label>

                        {/* Gallery Upload */}
                        <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 bg-white rounded-xl cursor-pointer hover:bg-zinc-50 transition active:scale-95">
                          <Plus className="w-5 h-5 text-zinc-400" />
                          <span className="text-[10px] text-zinc-600 mt-1 font-bold">Upload</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={e => e.target.files?.[0] && handlePhotoCapture(index, itemIdx, e.target.files[0])}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // --- Rendering Corrective Action Plan (CAP) ---

  const renderCAP = () => {
    if (!currentReport) return null;

    return (
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 p-4 md:p-5 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-900">Office Action Items & Hazard Remediation</h3>
            <p className="text-xs text-amber-700 leading-relaxed mt-0.5">
              Every office deficiency identified during the walk is listed here. Assign a responsible person or department and a realistic completion target.
            </p>
          </div>
        </div>

        {currentReport.correctiveActions.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-zinc-200 rounded-3xl bg-zinc-50/50">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-800">All Checked Items Meet HSE Standards</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              No office safety deficiencies have been flagged. If any workstation or office hazard is found, mark it as FAIL in the modules.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {currentReport.correctiveActions.map((ca, idx) => (
              <div key={ca.id} className="p-5 md:p-6 rounded-2xl border border-zinc-200 bg-white shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                    ITEM {ca.id}
                  </span>
                  <div className={cn(
                    'text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider',
                    ca.severity === 'L1' ? 'bg-amber-100 text-amber-800' :
                    ca.severity === 'L2' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  )}>
                    {ca.severity === 'L1' ? 'Low Priority (Routine)' :
                     ca.severity === 'L2' ? 'Medium Priority (48h)' :
                     'High Priority (Urgent)'}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 p-3.5 rounded-xl border border-zinc-100">
                  <div>
                    <Label className="text-zinc-500">Defect Description</Label>
                    <p className="text-sm font-bold text-zinc-900">{ca.defect || 'Office issue flagged'}</p>
                  </div>
                  <div>
                    <Label className="text-zinc-500">Office Location</Label>
                    <p className="text-sm font-bold text-zinc-900">{ca.location || 'General Office Space'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label subtitle="What immediate step was taken on-site?">
                      Immediate Action Taken
                    </Label>
                    <Input 
                      value={ca.containment || ''} 
                      onChange={e => updateCAP(idx, { containment: e.target.value })}
                      placeholder="e.g. Moved trip cable aside / Unlocked fire door immediately"
                    />
                  </div>
                  <div>
                    <Label subtitle="Who is assigned to resolve this permanently?">
                      Assigned Responsible Party / Team
                    </Label>
                    <Input 
                      value={ca.owner || ''} 
                      onChange={e => updateCAP(idx, { owner: e.target.value })}
                      placeholder="e.g. Facilities Management / IT Helpdesk"
                    />
                  </div>
                  <div>
                    <Label subtitle="Expected resolution timeframe">
                      Target SLA / Deadline
                    </Label>
                    <Input 
                      value={ca.targetSla || ''} 
                      onChange={e => updateCAP(idx, { targetSla: e.target.value })}
                      placeholder="e.g. 24 Hours, 48 Hours, 5 Days"
                    />
                  </div>
                  <div>
                    <Label subtitle="Name of person confirming close-out">
                      Verification Sign-Off Name
                    </Label>
                    <Input 
                      value={ca.signOff || ''} 
                      onChange={e => updateCAP(idx, { signOff: e.target.value })}
                      placeholder="e.g. Floor Safety Warden"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // --- Rendering Final Summary & Sign-Off ---

  const renderSummary = () => {
    if (!currentReport) return null;
    const stats = getReportStats(currentReport);

    return (
      <div className="space-y-8">
        {/* Scorecard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 text-center">
            <span className="text-xs font-bold text-zinc-500 uppercase">Items Evaluated</span>
            <div className="text-2xl md:text-3xl font-black text-zinc-900 mt-1">
              {stats.totalChecked} / {stats.totalItems}
            </div>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-center">
            <span className="text-xs font-bold text-emerald-700 uppercase">Passed (Compliant)</span>
            <div className="text-2xl md:text-3xl font-black text-emerald-600 mt-1">{stats.passed}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-center">
            <span className="text-xs font-bold text-red-700 uppercase">Issues Found</span>
            <div className="text-2xl md:text-3xl font-black text-red-600 mt-1">{stats.failed}</div>
          </div>
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center">
            <span className="text-xs font-bold text-amber-700 uppercase">Not Applicable</span>
            <div className="text-2xl md:text-3xl font-black text-amber-600 mt-1">{stats.na}</div>
          </div>
        </div>

        {/* Audit Details Summary Card */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
            Office Inspection Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-600">
            <div>
              <span className="font-bold text-zinc-400 block uppercase text-[10px]">Office Premises</span>
              <span className="font-semibold text-zinc-900">{currentReport.building || 'KSIA HQ'}</span>
              <p className="text-zinc-500">{currentReport.floor} · {currentReport.officeRoom || 'General Office'}</p>
            </div>
            <div>
              <span className="font-bold text-zinc-400 block uppercase text-[10px]">Department</span>
              <span className="font-semibold text-zinc-900">{currentReport.department || 'Administrative'}</span>
              <p className="text-zinc-500">Manager: {currentReport.departmentManager || 'Unassigned'}</p>
            </div>
            <div>
              <span className="font-bold text-zinc-400 block uppercase text-[10px]">Lead Inspector</span>
              <span className="font-semibold text-zinc-900">{currentReport.leadInspector || 'Unassigned'}</span>
              <p className="text-zinc-500">{currentReport.inspectionDate} · {currentReport.shift}</p>
            </div>
          </div>
        </div>

        {/* Declaration & Formal Signatures */}
        <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-md space-y-3">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
            Official HSE Declaration & Statutory Compliance
          </span>
          <p className="text-xs md:text-sm leading-relaxed text-zinc-300 italic">
            "I hereby confirm that this Health, Safety, and Environment (HSE) inspection was systematically performed across the designated airport administrative office premises in conformance with the KSIA HSE Manual and ISO 45001:2018 guidelines. Identified hazards have been recorded in the Corrective Action Plan and communicated to the Department Manager and Facilities Management for resolution."
          </p>
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          <div>
            <Label>Lead Office HSE Inspector Name</Label>
            <Input 
              value={currentReport.leadSignatory || currentReport.leadInspector || ''} 
              onChange={e => updateReportField('leadSignatory', e.target.value)}
              placeholder="Full Name"
            />
          </div>
          <div>
            <Label>Department / Office Manager Name</Label>
            <Input 
              value={currentReport.areaManagerSignatory || currentReport.departmentManager || ''} 
              onChange={e => updateReportField('areaManagerSignatory', e.target.value)}
              placeholder="Full Name"
            />
          </div>
          <div>
            <Label>KSIA Safety & Health Manager Verification</Label>
            <Input 
              value={currentReport.chiefSignatory || ''} 
              onChange={e => updateReportField('chiefSignatory', e.target.value)}
              placeholder="Full Name"
            />
          </div>

          <div className="pt-4">
            <Button onClick={handleExportPDF} className="w-full h-12 text-base shadow-md">
              <Download className="w-5 h-5" />
              Export & Download Office Audit Report (PDF)
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // --- Rendering Form View ---

  const renderForm = () => {
    if (!currentReport) return null;

    const sections = [
      { id: -1, title: 'Office Info', short: 'Info' },
      ...currentReport.modules.map((m, i) => ({ 
        id: i, 
        title: `M${m.id}: ${m.shortTitle || m.title}`,
        short: `M${m.id}`
      })),
      { id: 8, title: 'Action Plan', short: 'CAP' },
      { id: 9, title: 'Summary & Sign', short: 'Final' }
    ];

    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setView('dashboard')}>
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div>
              <h2 className="text-sm font-black text-zinc-900 leading-tight">
                {currentReport.department || 'OFFICE HSE INSPECTION'}
              </h2>
              <p className="text-[11px] font-semibold text-zinc-500 truncate max-w-[200px]">
                {currentReport.officeRoom || currentReport.building || 'Draft Audit'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleSave}>
              <Save className="w-4 h-4" />
              <span className="hidden md:inline">Save Draft</span>
            </Button>
            <Button size="sm" onClick={handleExportPDF}>
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export PDF</span>
            </Button>
          </div>
        </header>

        {/* Section Navigation Tabs (Horizontal Scroll) */}
        <nav className="bg-white border-b border-zinc-200 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap px-4">
          <div className="flex items-center gap-1">
            {sections.map(s => {
              const isActive = activeModuleIndex === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveModuleIndex(s.id)}
                  className={cn(
                    'px-3.5 py-3 text-xs font-bold transition-all border-b-2 -mb-[1px] cursor-pointer',
                    isActive 
                      ? 'border-blue-700 text-blue-700 bg-blue-50/40' 
                      : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
                  )}
                >
                  <span className="md:hidden">{s.short}</span>
                  <span className="hidden md:inline">{s.title}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full">
          <div className="bg-white rounded-3xl p-5 md:p-8 shadow-xs border border-zinc-200">
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-black text-zinc-900 mb-1">
                {activeModuleIndex === -1 ? 'Audit Header & Administrative Info' : 
                 activeModuleIndex === 8 ? 'Corrective Action Plan (CAP)' :
                 activeModuleIndex === 9 ? 'Final Summary & Formal Sign-Off' :
                 currentReport.modules[activeModuleIndex]?.title}
              </h2>
              <p className="text-xs text-zinc-500 font-medium">
                {activeModuleIndex === -1 ? 'Airport administrative workspace details, contacts, and scope' :
                 activeModuleIndex === 8 ? 'Deficiency resolution, responsible owners, and target SLAs' :
                 activeModuleIndex === 9 ? 'Audit statistics, statutory declaration, and approvals' :
                 'Systematic office workplace safety checklist'}
              </p>
            </div>

            {activeModuleIndex === -1 && renderFormHeader()}
            {activeModuleIndex >= 0 && activeModuleIndex <= 7 && renderModule(activeModuleIndex)}
            {activeModuleIndex === 8 && renderCAP()}
            {activeModuleIndex === 9 && renderSummary()}
          </div>
        </main>

        {/* Footer Navigation */}
        <div className="sticky bottom-0 bg-white border-t border-zinc-200 p-3 md:p-4 flex items-center justify-between gap-4 max-w-4xl mx-auto w-full">
          <Button 
            variant="secondary" 
            className="flex-1 md:flex-none"
            disabled={activeModuleIndex === -1}
            onClick={() => {
              setActiveModuleIndex(prev => prev - 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <div className="text-xs font-bold text-zinc-400 hidden sm:block">
            Step {activeModuleIndex + 2} of 11
          </div>
          <Button 
            className="flex-1 md:flex-none"
            disabled={activeModuleIndex === 9}
            onClick={() => {
              setActiveModuleIndex(prev => prev + 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Next Section
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans selection:bg-blue-100">
      {view === 'dashboard' ? renderDashboard() : renderForm()}
      <OfflineIndicator />
    </div>
  );
}
