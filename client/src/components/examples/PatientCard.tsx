import { PatientCard } from '../PatientCard';

export default function PatientCardExample() {
  const mockPatient = {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    dateOfBirth: '1978-03-15',
    gender: 'Female',
    phoneNumber: '555-0101',
    email: 'sarah.johnson@email.com',
    address: '123 Oak Street',
    status: 'Active' as const,
    medicalRecordNumber: 'MRN-2024-001',
    emergencyContact: 'John Johnson',
    emergencyPhone: '555-0102',
  };

  return (
    <div className="p-4 max-w-md">
      <PatientCard patient={mockPatient} />
    </div>
  );
}
