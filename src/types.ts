/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type InspectionStatus = 'P' | 'F' | 'N/A' | null;
export type SeverityLevel = 'L1' | 'L2' | 'L3' | null;

export interface ChecklistItem {
  id: string;
  ref: string;
  item: string;
  criteria: string;
  status: InspectionStatus;
  severity: SeverityLevel;
  likelihood: number | null; // 1-5 scale
  consequence: number | null; // 1-5 scale
  location: string;
  finding: string;
  photos: string[]; // Base64 strings for offline storage
  actionNotes?: string;
}

export interface InspectionModule {
  id: string;
  title: string;
  shortTitle: string;
  statutoryRefs: string;
  items: ChecklistItem[];
}

export interface CorrectiveAction {
  id: string;
  location: string;
  defect: string;
  severity: SeverityLevel;
  containment: string;
  owner: string;
  targetSla: string;
  signOff: string;
}

export interface InspectionReport {
  id: string;
  createdAt: string;
  updatedAt: string;
  isDraft: boolean;
  
  // Administrative Office Location & Scope
  building: string;         // e.g., KSIA HQ Main Building, Admin Tower A, Aviation Support Complex
  department: string;       // e.g., Finance & Commercial, Human Resources, IT & Digital Services
  floor: string;            // e.g., Level 1, Level 2, Level 3, Ground Floor
  officeRoom: string;       // e.g., Suite 302 - Open Workstations, Executive Boardroom, IT Service Hub
  
  // Inspector & Personnel Information
  leadInspector: string;
  staffId: string;
  badgeId: string;
  departmentManager: string; // Office / Department Manager
  inspectionDate: string;
  shift: string;            // e.g., Normal Office Hours (08:00 - 16:30), Shift Coverage
  auditType: string;        // e.g., Monthly Administrative Office HSE Walk, Workstation Ergonomics Review
  safetyOfficer: string;    // Floor Safety Warden / HSE Coordinator
  contactExt: string;       // Office Extension / Contact Phone

  // Legacy/Compatibility fields
  facility?: string;
  zoneId?: string;
  concourse?: string;
  radioChannel?: string;
  phoneExt?: string;
  deputyWarden?: string;

  // ISO 45001 Compliance & Worker Engagement
  workersConsulted: boolean;
  consultationDetails: string;
  hazardAssessmentRef: string;

  // Modules & CAP
  modules: InspectionModule[];
  correctiveActions: CorrectiveAction[];

  // Sign-off & Formal Approval
  leadSignatory: string;
  areaManagerSignatory: string; // Department / Office Head
  chiefSignatory: string;       // HSE Office Safety Manager
}
