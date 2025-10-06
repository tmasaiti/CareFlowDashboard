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

const db = new Dexie('ProjectFrostDB') as Dexie & {
  patients: EntityTable<Patient, 'id'>;
  medicalHistory: EntityTable<MedicalHistory, 'id'>;
  carePlanTemplates: EntityTable<CarePlanTemplate, 'id'>;
  carePlans: EntityTable<CarePlan, 'id'>;
  tasks: EntityTable<Task, 'id'>;
  communications: EntityTable<Communication, 'id'>;
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

export { db };
