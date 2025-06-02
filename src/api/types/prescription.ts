
// API types from Symfony backend
export interface ApiMedication {
  id: number;
  name: string;
  description: string;
  dosage: string;
  price: number;
  expirationDate: string;
}

export interface ApiPatient {
  id: number;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  address: string;
  insurance: string;
  status: string;
  prescriptions: string[];
}

export interface ApiDoctor {
  id: number;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  speciality: string;
  status: boolean;
  prescriptions: any[];
}

export interface ApiPrescriptionItem {
  id: number;
  prescription: string;
  medication: ApiMedication;
  posology: string;
  quantity: number;
  instructions: string;
}

export interface ApiPrescription {
  id: number;
  issuedDate: string;
  patient: ApiPatient;
  items: ApiPrescriptionItem[];
  doctor: ApiDoctor;
  notes: string;
}

// UI types (adapted for existing interface compatibility)
export interface PrescriptionItem {
  medication: string;
  medicationId: string;
  dosage: string;
  quantity: number;
  instructions?: string;
}

export interface Prescription {
  '@id'?: string;
  id?: string;
  patient: string;
  patientId: string;
  items: PrescriptionItem[];
  doctor: string;
  date: string;
  status: 'En attente' | 'Préparé' | 'Prêt pour retrait' | 'Livré';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
