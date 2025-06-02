
// API types from Symfony backend
export interface ApiMedication {
  id: number;
  name: string;
  description: string;
  dosage: string;
  price: string; // API returns string, not number
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
  prescriptions: string[];
  status: boolean; // API returns boolean, not string
}

export interface ApiPharmacist {
  id: number;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: boolean;
  pharmacy: string;
}

export interface ApiPharmacy {
  id: number;
  name: string;
  address: string;
  phone: string;
  pharmacists: ApiPharmacist[];
  doctors: string[];
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
  pharmacy: ApiPharmacy;
  prescriptions: string[];
}

export interface ApiPrescriptionItem {
  id: number;
  prescription: string;
  medication: ApiMedication;
  dosage: string; // API has dosage directly, not posology
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
