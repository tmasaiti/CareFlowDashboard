import { db, type Patient, type Task, type MedicalHistory, type CarePlan, type Communication, type CarePlanTemplate } from './db';

// todo: remove mock functionality
export async function initializeMockData() {
  const patientCount = await db.patients.count();
  if (patientCount > 0) return;

  const mockPatients: Patient[] = [
    {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      dateOfBirth: '1978-03-15',
      gender: 'Female',
      phoneNumber: '555-0101',
      email: 'sarah.johnson@email.com',
      address: '123 Oak Street',
      status: 'Active',
      medicalRecordNumber: 'MRN-2024-001',
      emergencyContact: 'John Johnson',
      emergencyPhone: '555-0102',
      insuranceProvider: 'Blue Cross',
      policyNumber: 'BC123456',
    },
    {
      id: '2',
      firstName: 'Michael',
      lastName: 'Chen',
      dateOfBirth: '1965-08-22',
      gender: 'Male',
      phoneNumber: '555-0201',
      email: 'michael.chen@email.com',
      address: '456 Maple Avenue',
      status: 'Active',
      medicalRecordNumber: 'MRN-2024-002',
      emergencyContact: 'Lisa Chen',
      emergencyPhone: '555-0202',
    },
    {
      id: '3',
      firstName: 'Emma',
      lastName: 'Davis',
      dateOfBirth: '1992-11-30',
      gender: 'Female',
      phoneNumber: '555-0301',
      email: 'emma.davis@email.com',
      address: '789 Pine Road',
      status: 'On-hold',
      medicalRecordNumber: 'MRN-2024-003',
      emergencyContact: 'Robert Davis',
      emergencyPhone: '555-0302',
    },
  ];

  const mockTasks: Task[] = [
    {
      id: '1',
      patientId: '1',
      title: 'Follow-up Cardiology Consultation',
      description: 'Review recent ECG results and adjust medication',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      status: 'pending',
      priority: 'High',
    },
    {
      id: '2',
      patientId: '2',
      title: 'Blood Pressure Check',
      description: 'Routine BP monitoring',
      dueDate: new Date(Date.now() + 172800000).toISOString(),
      status: 'pending',
      priority: 'Medium',
    },
    {
      id: '3',
      patientId: '1',
      title: 'Lab Results Review',
      description: 'Discuss cholesterol levels',
      dueDate: new Date(Date.now() - 86400000).toISOString(),
      status: 'missed',
      priority: 'Critical',
    },
  ];

  const mockMedicalHistory: MedicalHistory[] = [
    {
      id: '1',
      patientId: '1',
      type: 'Diagnosis',
      title: 'Hypertension',
      description: 'Stage 2 Hypertension',
      date: '2023-01-15',
      severity: 'Moderate',
      status: 'Chronic',
    },
    {
      id: '2',
      patientId: '1',
      type: 'Medication',
      title: 'Lisinopril 10mg',
      description: 'Once daily for blood pressure management',
      date: '2023-01-15',
      status: 'Active',
    },
    {
      id: '3',
      patientId: '2',
      type: 'Allergy',
      title: 'Penicillin',
      description: 'Severe allergic reaction',
      date: '2010-05-20',
      severity: 'Severe',
    },
  ];

  const mockCarePlanTemplates: CarePlanTemplate[] = [
    {
      id: '1',
      title: 'Cardiovascular Health Management',
      description: 'Comprehensive plan for managing hypertension and reducing cardiovascular risk',
      category: 'Health Condition',
      healthConditions: ['Hypertension', 'Cardiovascular Disease'],
      goals: [
        'Reduce blood pressure to below 130/80 mmHg',
        'Achieve 5% weight reduction',
        'Increase physical activity to 150 minutes per week',
      ],
      interventions: [
        'Daily medication adherence monitoring',
        'Bi-weekly blood pressure checks',
        'Monthly nutritional counseling',
        'Exercise program with physical therapist',
      ],
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Elderly Fall Prevention Program',
      description: 'Comprehensive fall prevention strategy for elderly patients',
      category: 'Age-Based',
      ageRange: '65+',
      goals: [
        'Reduce fall risk by 50%',
        'Improve balance and coordination',
        'Increase home safety awareness',
      ],
      interventions: [
        'Home safety assessment and modifications',
        'Balance training exercises 3x weekly',
        'Vision and medication review',
        'Regular gait and mobility assessments',
      ],
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Mobility Impairment Support',
      description: 'Support plan for patients with mobility limitations',
      category: 'Impairment',
      impairmentTypes: ['Mobility', 'Physical'],
      goals: [
        'Maintain current mobility level',
        'Prevent secondary complications',
        'Enhance independence in daily activities',
      ],
      interventions: [
        'Physical therapy sessions 2x weekly',
        'Assistive device assessment and training',
        'Home modification consultation',
        'Caregiver education and support',
      ],
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    },
  ];

  const mockCarePlans: CarePlan[] = [
    {
      id: '1',
      patientId: '1',
      templateId: '1',
      title: 'Cardiovascular Health Management',
      description: 'Comprehensive plan for managing hypertension and reducing cardiovascular risk',
      startDate: '2024-01-01',
      status: 'pending',
      goals: [
        'Reduce blood pressure to below 130/80 mmHg',
        'Achieve 5% weight reduction',
        'Increase physical activity to 150 minutes per week',
      ],
      interventions: [
        'Daily medication adherence monitoring',
        'Bi-weekly blood pressure checks',
        'Monthly nutritional counseling',
        'Exercise program with physical therapist',
      ],
      notes: 'Patient is motivated and engaged in the care plan.',
    },
  ];

  const mockCommunications: Communication[] = [
    {
      id: '1',
      patientId: '1',
      date: new Date().toISOString(),
      type: 'Note',
      subject: 'Post-Consultation Notes',
      content: 'Patient responding well to current medication regimen. Continue monitoring BP.',
      author: 'Dr. Evelyn Reed',
    },
  ];

  await db.patients.bulkAdd(mockPatients);
  await db.tasks.bulkAdd(mockTasks);
  await db.medicalHistory.bulkAdd(mockMedicalHistory);
  await db.carePlanTemplates.bulkAdd(mockCarePlanTemplates);
  await db.carePlans.bulkAdd(mockCarePlans);
  await db.communications.bulkAdd(mockCommunications);
}
