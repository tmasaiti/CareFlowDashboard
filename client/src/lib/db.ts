import Dexie, { type EntityTable } from 'dexie';

export type PatientStatus = 'Active' | 'On-hold' | 'Discharged';

export type TaskStatus = 'done' | 'pending' | 'onhold' | 'critical' | 'missed' | 'arrived';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  email: string;
  address: string;
  status: PatientStatus;
  medicalRecordNumber: string;
  emergencyContact: string;
  emergencyPhone: string;
  insuranceProvider?: string;
  policyNumber?: string;
}

export interface MedicalHistory {
  id: string;
  patientId: string;
  type: 'Diagnosis' | 'Allergy' | 'Medication' | 'Procedure';
  title: string;
  description: string;
  date: string;
  severity?: 'Mild' | 'Moderate' | 'Severe';
  status?: 'Active' | 'Resolved' | 'Chronic';
  notes?: string;
}

export interface CarePlanTemplate {
  id: string;
  title: string;
  description: string;
  category: 'Age-Based' | 'Health Condition' | 'Needs-Based' | 'Impairment' | 'General';
  ageRange?: string;
  healthConditions?: string[];
  targetNeeds?: string[];
  impairmentTypes?: string[];
  goals: string[];
  interventions: string[];
  createdDate: string;
  lastModified: string;
}

export interface CarePlan {
  id: string;
  patientId: string;
  templateId?: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: TaskStatus;
  goals: string[];
  interventions: string[];
  notes?: string;
}

export interface Task {
  id: string;
  patientId: string;
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTo?: string;
}

export interface Communication {
  id: string;
  patientId: string;
  date: string;
  type: 'Note' | 'Call' | 'Email' | 'Visit';
  subject: string;
  content: string;
  author: string;
}

export type StaffRole = 'Doctor' | 'Nurse' | 'Caregiver';
export type StaffStatus = 'Active' | 'Inactive' | 'On Leave';

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: StaffRole;
  specialization?: string;
  licenseNumber?: string;
  department?: string;
  hireDate: string;
  status: StaffStatus;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  certifications?: string[];
  notes?: string;
}

export type ShiftStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  startTime: string;
  endTime: string;
  patientId?: string;
  patientName?: string;
  taskIds?: string[];
  location?: string;
  shiftType: 'Visit' | 'Care' | 'Assessment' | 'Administration' | 'Other';
  status: ShiftStatus;
  notes?: string;
}

export type AuditAction = 'Create' | 'Update' | 'Delete' | 'View' | 'Sign' | 'Approve' | 'Complete' | 'Escalate';
export type AuditEntityType = 'Patient' | 'CarePlan' | 'Task' | 'Medication' | 'Visit' | 'Incident' | 'RiskAssessment' | 'Policy' | 'Staff';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityName: string;
  changes?: string;
  ipAddress?: string;
  location?: string;
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type RiskStatus = 'Identified' | 'Under Review' | 'Mitigated' | 'Closed';

export interface RiskAssessment {
  id: string;
  patientId: string;
  patientName: string;
  riskType: 'Falls' | 'Medication' | 'Mobility' | 'Safeguarding' | 'Nutrition' | 'Skin Integrity' | 'Other';
  riskLevel: RiskLevel;
  status: RiskStatus;
  identifiedDate: string;
  lastReviewDate: string;
  nextReviewDate: string;
  description: string;
  mitigationActions: string[];
  assessedBy: string;
  reviewedBy?: string;
  digitalSignature?: string;
  notes?: string;
}

export type EvidenceType = 'Photo' | 'Document' | 'Signature' | 'Certificate' | 'Policy' | 'Training Record';
export type ComplianceArea = 'Safe' | 'Effective' | 'Caring' | 'Responsive' | 'Well-led';

export interface ComplianceEvidence {
  id: string;
  evidenceType: EvidenceType;
  complianceArea: ComplianceArea;
  title: string;
  description: string;
  uploadDate: string;
  uploadedBy: string;
  relatedEntityType?: AuditEntityType;
  relatedEntityId?: string;
  fileUrl?: string;
  fileName?: string;
  expiryDate?: string;
  status: 'Current' | 'Expiring Soon' | 'Expired';
  tags?: string[];
  notes?: string;
}

export type IncidentSeverity = 'Minor' | 'Moderate' | 'Serious' | 'Critical';
export type IncidentStatus = 'Reported' | 'Under Investigation' | 'Action Taken' | 'Resolved' | 'Escalated to CQC';

export interface SafeguardingIncident {
  id: string;
  incidentDate: string;
  reportedDate: string;
  reportedBy: string;
  patientId?: string;
  patientName?: string;
  staffId?: string;
  staffName?: string;
  incidentType: 'Fall' | 'Medication Error' | 'Abuse' | 'Neglect' | 'Injury' | 'Property Loss' | 'Other';
  severity: IncidentSeverity;
  status: IncidentStatus;
  description: string;
  location?: string;
  witnessesPresent?: string[];
  immediateActionTaken?: string;
  investigationNotes?: string;
  preventiveActions?: string[];
  evidenceIds?: string[];
  escalatedToCQC: boolean;
  cqcReferenceNumber?: string;
  resolvedDate?: string;
  resolvedBy?: string;
}

export type PolicyCategory = 'Clinical' | 'Safeguarding' | 'Health & Safety' | 'Data Protection' | 'HR' | 'Operational';
export type AcknowledgmentStatus = 'Pending' | 'Read' | 'Acknowledged';

export interface Policy {
  id: string;
  title: string;
  category: PolicyCategory;
  version: string;
  effectiveDate: string;
  expiryDate?: string;
  description: string;
  fileUrl?: string;
  fileName?: string;
  approvedBy: string;
  approvalDate: string;
  requiresAcknowledgment: boolean;
  status: 'Draft' | 'Active' | 'Expired' | 'Archived';
}

export interface PolicyAcknowledgment {
  id: string;
  policyId: string;
  staffId: string;
  staffName: string;
  acknowledgedDate?: string;
  status: AcknowledgmentStatus;
  digitalSignature?: string;
  comments?: string;
}

export interface TrainingRecord {
  id: string;
  staffId: string;
  staffName: string;
  trainingType: string;
  trainingProvider: string;
  completionDate: string;
  expiryDate?: string;
  certificateUrl?: string;
  certificateNumber?: string;
  status: 'Current' | 'Expiring Soon' | 'Expired';
  verifiedBy?: string;
  verificationDate?: string;
  notes?: string;
}

const db = new Dexie('ProjectFrostDB') as Dexie & {
  patients: EntityTable<Patient, 'id'>;
  medicalHistory: EntityTable<MedicalHistory, 'id'>;
  carePlanTemplates: EntityTable<CarePlanTemplate, 'id'>;
  carePlans: EntityTable<CarePlan, 'id'>;
  tasks: EntityTable<Task, 'id'>;
  communications: EntityTable<Communication, 'id'>;
  staff: EntityTable<Staff, 'id'>;
  shifts: EntityTable<Shift, 'id'>;
  auditLogs: EntityTable<AuditLog, 'id'>;
  riskAssessments: EntityTable<RiskAssessment, 'id'>;
  complianceEvidence: EntityTable<ComplianceEvidence, 'id'>;
  safeguardingIncidents: EntityTable<SafeguardingIncident, 'id'>;
  policies: EntityTable<Policy, 'id'>;
  policyAcknowledgments: EntityTable<PolicyAcknowledgment, 'id'>;
  trainingRecords: EntityTable<TrainingRecord, 'id'>;
};

db.version(1).stores({
  patients: 'id, firstName, lastName, status, medicalRecordNumber',
  medicalHistory: 'id, patientId, type, date',
  carePlans: 'id, patientId, status',
  tasks: 'id, patientId, status, dueDate',
  communications: 'id, patientId, date',
});

db.version(2).stores({
  patients: 'id, firstName, lastName, status, medicalRecordNumber',
  medicalHistory: 'id, patientId, type, date',
  carePlanTemplates: 'id, category, createdDate',
  carePlans: 'id, patientId, templateId, status',
  tasks: 'id, patientId, status, dueDate',
  communications: 'id, patientId, date',
});

db.version(3).stores({
  patients: 'id, firstName, lastName, status, medicalRecordNumber',
  medicalHistory: 'id, patientId, type, date',
  carePlanTemplates: 'id, category, createdDate',
  carePlans: 'id, patientId, templateId, status',
  tasks: 'id, patientId, status, dueDate',
  communications: 'id, patientId, date',
  staff: 'id, firstName, lastName, role, status, email',
});

db.version(4).stores({
  patients: 'id, firstName, lastName, status, medicalRecordNumber',
  medicalHistory: 'id, patientId, type, date',
  carePlanTemplates: 'id, category, createdDate',
  carePlans: 'id, patientId, templateId, status',
  tasks: 'id, patientId, status, dueDate, assignedTo',
  communications: 'id, patientId, date',
  staff: 'id, firstName, lastName, role, status, email',
});

db.version(5).stores({
  patients: 'id, firstName, lastName, status, medicalRecordNumber',
  medicalHistory: 'id, patientId, type, date',
  carePlanTemplates: 'id, category, createdDate',
  carePlans: 'id, patientId, templateId, status',
  tasks: 'id, patientId, status, dueDate, assignedTo',
  communications: 'id, patientId, date',
  staff: 'id, firstName, lastName, role, status, email',
  shifts: 'id, staffId, date, status, patientId',
});

db.version(6).stores({
  patients: 'id, firstName, lastName, status, medicalRecordNumber',
  medicalHistory: 'id, patientId, type, date',
  carePlanTemplates: 'id, category, createdDate',
  carePlans: 'id, patientId, templateId, status',
  tasks: 'id, patientId, status, dueDate, assignedTo',
  communications: 'id, patientId, date',
  staff: 'id, firstName, lastName, role, status, email',
  shifts: 'id, staffId, date, status, patientId',
  auditLogs: 'id, timestamp, userId, entityType, entityId, action',
  riskAssessments: 'id, patientId, riskLevel, status, nextReviewDate',
  complianceEvidence: 'id, complianceArea, evidenceType, uploadDate, status',
  safeguardingIncidents: 'id, incidentDate, reportedDate, severity, status, patientId',
  policies: 'id, category, effectiveDate, status',
  policyAcknowledgments: 'id, policyId, staffId, status',
  trainingRecords: 'id, staffId, trainingType, completionDate, status',
});

export { db };
