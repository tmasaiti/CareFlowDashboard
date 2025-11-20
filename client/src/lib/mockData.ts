import { db, type Patient, type Task, type MedicalHistory, type CarePlan, type Communication, type CarePlanTemplate, type AuditLog, type RiskAssessment, type ComplianceEvidence, type SafeguardingIncident, type Policy, type PolicyAcknowledgment, type TrainingRecord } from './db';

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

  const mockRiskAssessments: RiskAssessment[] = [
    {
      id: '1',
      patientId: '1',
      patientName: 'Sarah Johnson',
      riskType: 'Falls',
      riskLevel: 'High',
      status: 'Under Review',
      identifiedDate: '2024-11-01',
      lastReviewDate: '2024-11-15',
      nextReviewDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      description: 'Patient has history of dizziness and unsteady gait. Recent fall in bathroom.',
      mitigationActions: [
        'Install grab rails in bathroom',
        'Remove trip hazards from home',
        'Review medications for side effects',
        'Arrange physiotherapy assessment'
      ],
      assessedBy: 'Dr. Evelyn Reed',
      reviewedBy: 'Sarah Wilson',
      digitalSignature: 'ER-2024-11-15',
      notes: 'Family have been informed of risks and mitigation plan'
    },
    {
      id: '2',
      patientId: '2',
      patientName: 'Michael Chen',
      riskType: 'Medication',
      riskLevel: 'Medium',
      status: 'Mitigated',
      identifiedDate: '2024-10-20',
      lastReviewDate: '2024-11-10',
      nextReviewDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      description: 'Multiple medications with complex dosing schedule. Risk of medication errors.',
      mitigationActions: [
        'Implement medication administration record (MAR)',
        'Use weekly medication dispenser',
        'Weekly medication review by care staff',
        'Family member to monitor compliance'
      ],
      assessedBy: 'Nurse Practitioner Jane Smith',
      reviewedBy: 'Dr. Evelyn Reed',
      digitalSignature: 'JS-2024-11-10'
    },
    {
      id: '3',
      patientId: '1',
      patientName: 'Sarah Johnson',
      riskType: 'Safeguarding',
      riskLevel: 'Critical',
      status: 'Identified',
      identifiedDate: new Date(Date.now() - 2 * 86400000).toISOString(),
      lastReviewDate: new Date(Date.now() - 2 * 86400000).toISOString(),
      nextReviewDate: new Date(Date.now() + 1 * 86400000).toISOString(),
      description: 'Concerns raised about potential financial abuse by family member.',
      mitigationActions: [
        'Immediate escalation to safeguarding team',
        'Contact social services',
        'Document all concerns',
        'Increase monitoring frequency'
      ],
      assessedBy: 'Care Manager Tom Davies',
      notes: 'URGENT - Requires immediate review and action'
    }
  ];

  const mockSafeguardingIncidents: SafeguardingIncident[] = [
    {
      id: '1',
      incidentDate: new Date(Date.now() - 5 * 86400000).toISOString(),
      reportedDate: new Date(Date.now() - 4 * 86400000).toISOString(),
      reportedBy: 'Care Worker Lisa Thompson',
      patientId: '1',
      patientName: 'Sarah Johnson',
      incidentType: 'Fall',
      severity: 'Moderate',
      status: 'Under Investigation',
      description: 'Patient slipped in bathroom and fell, striking head on sink. Small laceration sustained.',
      location: 'Patient home - Bathroom',
      witnessesPresent: ['Care Worker Lisa Thompson'],
      immediateActionTaken: 'First aid administered. Patient assessed for head injury. GP notified. Wound cleaned and dressed.',
      investigationNotes: 'Bathroom floor was wet. Non-slip mat not in place as recommended. Environmental risk assessment to be updated.',
      preventiveActions: [
        'Ensure non-slip mat is always in place',
        'Review bathroom safety equipment',
        'Retrain care staff on fall prevention',
        'Update risk assessment'
      ],
      evidenceIds: ['EV-001', 'EV-002'],
      escalatedToCQC: false
    },
    {
      id: '2',
      incidentDate: new Date(Date.now() - 15 * 86400000).toISOString(),
      reportedDate: new Date(Date.now() - 15 * 86400000).toISOString(),
      reportedBy: 'Nurse Practitioner Jane Smith',
      patientId: '2',
      patientName: 'Michael Chen',
      incidentType: 'Medication Error',
      severity: 'Serious',
      status: 'Action Taken',
      description: 'Incorrect medication dosage administered. Patient received 20mg instead of 10mg of Lisinopril.',
      location: 'Patient home',
      witnessesPresent: [],
      immediateActionTaken: 'Error identified within 2 hours. GP contacted immediately. Patient monitored for adverse effects. No complications observed.',
      investigationNotes: 'Root cause: Medication label unclear. Carer misread dosage. New medication packaging now in use.',
      preventiveActions: [
        'All medication labels to be verified by two staff members',
        'Additional medication administration training for all staff',
        'Implement double-checking protocol',
        'Review medication storage and labeling system'
      ],
      escalatedToCQC: false,
      resolvedDate: new Date(Date.now() - 10 * 86400000).toISOString(),
      resolvedBy: 'Care Manager Tom Davies'
    },
    {
      id: '3',
      incidentDate: new Date(Date.now() - 3 * 86400000).toISOString(),
      reportedDate: new Date(Date.now() - 3 * 86400000).toISOString(),
      reportedBy: 'Care Manager Tom Davies',
      patientId: '1',
      patientName: 'Sarah Johnson',
      staffName: 'Unknown external individual',
      incidentType: 'Abuse',
      severity: 'Critical',
      status: 'Escalated to CQC',
      description: 'Allegations of financial abuse. Unauthorized withdrawals from patient bank account noticed by family.',
      location: 'Patient home',
      witnessesPresent: [],
      immediateActionTaken: 'Safeguarding alert raised. Police notified. Social services contacted. Patient and family informed. Immediate protection measures implemented.',
      investigationNotes: 'Investigation ongoing. Bank statements being reviewed. Care plan suspended pending investigation outcome.',
      preventiveActions: [
        'Enhanced safeguarding training for all staff',
        'Review financial safeguarding procedures',
        'Implement stricter access controls',
        'Regular safeguarding audits'
      ],
      escalatedToCQC: true,
      cqcReferenceNumber: 'CQC-2024-SAF-1234'
    }
  ];

  const mockComplianceEvidence: ComplianceEvidence[] = [
    {
      id: 'EV-001',
      evidenceType: 'Photo',
      complianceArea: 'Safe',
      title: 'Bathroom Fall - Scene Photo',
      description: 'Photograph of bathroom showing wet floor and missing non-slip mat',
      uploadDate: new Date(Date.now() - 4 * 86400000).toISOString(),
      uploadedBy: 'Care Worker Lisa Thompson',
      relatedEntityType: 'Incident',
      relatedEntityId: '1',
      status: 'Current',
      tags: ['incident', 'fall', 'safety']
    },
    {
      id: 'EV-002',
      evidenceType: 'Photo',
      complianceArea: 'Safe',
      title: 'Patient Injury Documentation',
      description: 'Photo of head laceration sustained in bathroom fall',
      uploadDate: new Date(Date.now() - 4 * 86400000).toISOString(),
      uploadedBy: 'Care Worker Lisa Thompson',
      relatedEntityType: 'Incident',
      relatedEntityId: '1',
      status: 'Current',
      tags: ['incident', 'injury', 'documentation']
    },
    {
      id: 'EV-003',
      evidenceType: 'Signature',
      complianceArea: 'Effective',
      title: 'Care Plan Consent - Sarah Johnson',
      description: 'Digital signature confirming consent to care plan',
      uploadDate: '2024-01-01',
      uploadedBy: 'Dr. Evelyn Reed',
      relatedEntityType: 'CarePlan',
      relatedEntityId: '1',
      status: 'Current',
      tags: ['consent', 'care-plan']
    },
    {
      id: 'EV-004',
      evidenceType: 'Certificate',
      complianceArea: 'Well-led',
      title: 'Safeguarding Training Certificate - Lisa Thompson',
      description: 'Level 2 Safeguarding Adults certificate',
      uploadDate: '2024-06-15',
      uploadedBy: 'HR Manager',
      relatedEntityType: 'Staff',
      relatedEntityId: 'ST-001',
      expiryDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      status: 'Expiring Soon',
      tags: ['training', 'safeguarding', 'certification']
    },
    {
      id: 'EV-005',
      evidenceType: 'Document',
      complianceArea: 'Caring',
      title: 'Patient Satisfaction Survey Results',
      description: 'Quarterly patient and family satisfaction survey results',
      uploadDate: new Date(Date.now() - 7 * 86400000).toISOString(),
      uploadedBy: 'Quality Manager',
      status: 'Current',
      tags: ['quality', 'satisfaction', 'feedback']
    }
  ];

  const mockPolicies: Policy[] = [
    {
      id: 'POL-001',
      title: 'Safeguarding Adults Policy',
      category: 'Safeguarding',
      version: '3.2',
      effectiveDate: '2024-01-01',
      expiryDate: '2025-12-31',
      description: 'Comprehensive policy covering identification, reporting and management of safeguarding concerns',
      approvedBy: 'Board of Directors',
      approvalDate: '2023-12-15',
      requiresAcknowledgment: true,
      status: 'Active'
    },
    {
      id: 'POL-002',
      title: 'Medication Administration Policy',
      category: 'Clinical',
      version: '2.1',
      effectiveDate: '2024-03-01',
      expiryDate: '2025-02-28',
      description: 'Safe medication administration procedures and protocols',
      approvedBy: 'Clinical Director',
      approvalDate: '2024-02-15',
      requiresAcknowledgment: true,
      status: 'Active'
    },
    {
      id: 'POL-003',
      title: 'GDPR and Data Protection Policy',
      category: 'Data Protection',
      version: '4.0',
      effectiveDate: '2024-05-25',
      expiryDate: '2025-05-24',
      description: 'Data protection and GDPR compliance procedures',
      approvedBy: 'Data Protection Officer',
      approvalDate: '2024-05-10',
      requiresAcknowledgment: true,
      status: 'Active'
    },
    {
      id: 'POL-004',
      title: 'Infection Control Policy (OLD)',
      category: 'Health & Safety',
      version: '1.5',
      effectiveDate: '2022-01-01',
      expiryDate: '2023-12-31',
      description: 'Superseded infection control procedures',
      approvedBy: 'Infection Control Lead',
      approvalDate: '2021-12-01',
      requiresAcknowledgment: false,
      status: 'Expired'
    }
  ];

  const mockPolicyAcknowledgments: PolicyAcknowledgment[] = [
    {
      id: 'PA-001',
      policyId: 'POL-001',
      staffId: 'ST-001',
      staffName: 'Lisa Thompson',
      acknowledgedDate: '2024-01-05',
      status: 'Acknowledged',
      digitalSignature: 'LT-2024-01-05'
    },
    {
      id: 'PA-002',
      policyId: 'POL-002',
      staffId: 'ST-001',
      staffName: 'Lisa Thompson',
      acknowledgedDate: '2024-03-03',
      status: 'Acknowledged',
      digitalSignature: 'LT-2024-03-03'
    },
    {
      id: 'PA-003',
      policyId: 'POL-003',
      staffId: 'ST-001',
      staffName: 'Lisa Thompson',
      status: 'Pending'
    },
    {
      id: 'PA-004',
      policyId: 'POL-001',
      staffId: 'ST-002',
      staffName: 'Jane Smith',
      acknowledgedDate: '2024-01-08',
      status: 'Acknowledged',
      digitalSignature: 'JS-2024-01-08'
    }
  ];

  const mockTrainingRecords: TrainingRecord[] = [
    {
      id: 'TR-001',
      staffId: 'ST-001',
      staffName: 'Lisa Thompson',
      trainingType: 'Level 2 Safeguarding Adults',
      trainingProvider: 'Care Training UK',
      completionDate: '2024-06-15',
      expiryDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      certificateNumber: 'SAF-2024-LT-001',
      status: 'Expiring Soon',
      verifiedBy: 'HR Manager',
      verificationDate: '2024-06-16',
      notes: 'Certificate expires soon - renewal required'
    },
    {
      id: 'TR-002',
      staffId: 'ST-001',
      staffName: 'Lisa Thompson',
      trainingType: 'Manual Handling',
      trainingProvider: 'Health & Safety Training Ltd',
      completionDate: '2024-08-20',
      expiryDate: new Date(Date.now() + 300 * 86400000).toISOString(),
      certificateNumber: 'MH-2024-LT-002',
      status: 'Current',
      verifiedBy: 'HR Manager',
      verificationDate: '2024-08-21'
    },
    {
      id: 'TR-003',
      staffId: 'ST-002',
      staffName: 'Jane Smith',
      trainingType: 'Medication Administration',
      trainingProvider: 'Clinical Skills Academy',
      completionDate: '2024-03-10',
      expiryDate: new Date(Date.now() + 180 * 86400000).toISOString(),
      certificateNumber: 'MED-2024-JS-001',
      status: 'Current',
      verifiedBy: 'Clinical Director',
      verificationDate: '2024-03-11'
    },
    {
      id: 'TR-004',
      staffId: 'ST-003',
      staffName: 'Tom Davies',
      trainingType: 'First Aid at Work',
      trainingProvider: 'St John Ambulance',
      completionDate: '2021-05-15',
      expiryDate: new Date(Date.now() - 30 * 86400000).toISOString(),
      certificateNumber: 'FA-2021-TD-001',
      status: 'Expired',
      verifiedBy: 'HR Manager',
      verificationDate: '2021-05-16',
      notes: 'URGENT - Expired certificate, renewal required immediately'
    }
  ];

  const mockAuditLogs: AuditLog[] = [
    {
      id: 'AL-001',
      timestamp: new Date().toISOString(),
      userId: 'U-001',
      userName: 'Dr. Evelyn Reed',
      action: 'View',
      entityType: 'Patient',
      entityId: '1',
      entityName: 'Sarah Johnson',
      ipAddress: '192.168.1.100'
    },
    {
      id: 'AL-002',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      userId: 'U-002',
      userName: 'Care Manager Tom Davies',
      action: 'Create',
      entityType: 'Incident',
      entityId: '3',
      entityName: 'Financial Abuse Allegation',
      changes: 'New safeguarding incident created',
      ipAddress: '192.168.1.101'
    },
    {
      id: 'AL-003',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      userId: 'U-003',
      userName: 'Nurse Practitioner Jane Smith',
      action: 'Update',
      entityType: 'RiskAssessment',
      entityId: '2',
      entityName: 'Medication Risk - Michael Chen',
      changes: 'Status updated to Mitigated',
      ipAddress: '192.168.1.102'
    },
    {
      id: 'AL-004',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      userId: 'U-004',
      userName: 'Care Worker Lisa Thompson',
      action: 'Sign',
      entityType: 'RiskAssessment',
      entityId: '1',
      entityName: 'Falls Risk - Sarah Johnson',
      changes: 'Digital signature applied',
      ipAddress: '192.168.1.103'
    },
    {
      id: 'AL-005',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      userId: 'U-002',
      userName: 'Care Manager Tom Davies',
      action: 'Escalate',
      entityType: 'Incident',
      entityId: '3',
      entityName: 'Financial Abuse Allegation',
      changes: 'Incident escalated to CQC',
      ipAddress: '192.168.1.101'
    }
  ];

  await db.patients.bulkAdd(mockPatients);
  await db.tasks.bulkAdd(mockTasks);
  await db.medicalHistory.bulkAdd(mockMedicalHistory);
  await db.carePlanTemplates.bulkAdd(mockCarePlanTemplates);
  await db.carePlans.bulkAdd(mockCarePlans);
  await db.communications.bulkAdd(mockCommunications);
  await db.riskAssessments.bulkAdd(mockRiskAssessments);
  await db.safeguardingIncidents.bulkAdd(mockSafeguardingIncidents);
  await db.complianceEvidence.bulkAdd(mockComplianceEvidence);
  await db.policies.bulkAdd(mockPolicies);
  await db.policyAcknowledgments.bulkAdd(mockPolicyAcknowledgments);
  await db.trainingRecords.bulkAdd(mockTrainingRecords);
  await db.auditLogs.bulkAdd(mockAuditLogs);
}
