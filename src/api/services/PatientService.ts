
import apiClient from '../apiClient';

export interface Patient {
  '@id'?: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  address?: string;
  insurance?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

class PatientService {
  private endpoint = '/patients';
  private mockPatients: Patient[] = [
    {
      id: 'P-1001',
      '@id': '/patients/P-1001',
      name: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      phone: '01-23-45-67-89',
      dob: '1975-03-15',
      address: '123 Rue Principale, Paris',
      insurance: 'CPAM',
      status: 'Actif',
      createdAt: '2022-01-15T10:30:00',
      updatedAt: '2022-01-15T10:30:00'
    },
    {
      id: 'P-1002',
      '@id': '/patients/P-1002',
      name: 'Marie Martin',
      email: 'marie.martin@example.com',
      phone: '06-78-90-12-34',
      dob: '1982-07-22',
      address: '456 Avenue des Champs, Lyon',
      insurance: 'MGEN',
      status: 'Actif',
      createdAt: '2022-02-20T14:45:00',
      updatedAt: '2022-02-20T14:45:00'
    }
  ];

  async getAllPatients(page = 1, itemsPerPage = 30, filters?: Record<string, any>) {
    return Promise.resolve({
      items: this.mockPatients,
      totalItems: this.mockPatients.length,
      itemsPerPage,
      totalPages: Math.ceil(this.mockPatients.length / itemsPerPage),
      currentPage: page,
    });
  }

  async getPatientById(id: string) {
    const patient = this.mockPatients.find(p => p.id === id);
    if (!patient) {
      return Promise.reject(new Error("Patient not found"));
    }
    return Promise.resolve(patient);
  }

  async createPatient(patient: Omit<Patient, '@id' | 'id'>) {
    console.log('Création de patient:', patient);
    
    const newPatient = {
      ...patient,
      id: `P-${Math.floor(1000 + Math.random() * 9000)}`,
      '@id': `/patients/${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.mockPatients.push(newPatient);
    
    return Promise.resolve(newPatient);
  }

  async updatePatient(id: string, patient: Partial<Patient>) {
    console.log('Mise à jour de patient:', id, patient);
    
    const index = this.mockPatients.findIndex(p => p.id === id);
    if (index === -1) {
      return Promise.reject(new Error("Patient not found"));
    }
    
    this.mockPatients[index] = {
      ...this.mockPatients[index],
      ...patient,
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(this.mockPatients[index]);
  }

  async deletePatient(id: string) {
    console.log('Suppression de patient:', id);
    
    const index = this.mockPatients.findIndex(p => p.id === id);
    if (index === -1) {
      return Promise.reject(new Error("Patient not found"));
    }
    
    const deleted = this.mockPatients.splice(index, 1)[0];
    return Promise.resolve(deleted);
  }

  async getPatientPrescriptions(id: string) {
    // Mock prescriptions for a patient
    const mockResponse = [
      {
        id: 'RX-0001',
        patient: 'Jean Dupont',
        patientId: id,
        medication: 'Amoxicilline 500mg',
        medicationId: 'M-001',
        dosage: '1 comprimé 3x par jour',
        quantity: 30,
        doctor: 'Dr. Howard Lee',
        date: '2023-05-15',
        status: 'En attente',
        instructions: 'Prendre avec de la nourriture'
      }
    ];
    
    return Promise.resolve(mockResponse);
  }

  async searchPatients(query: string) {
    const filteredPatients = this.mockPatients.filter(patient => 
      patient.name.toLowerCase().includes(query.toLowerCase()) ||
      patient.email.toLowerCase().includes(query.toLowerCase()) ||
      patient.phone.includes(query)
    );
    
    return Promise.resolve(filteredPatients);
  }
}

export default new PatientService();
