
import apiClient from '../apiClient';

// Type definitions
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

  // Get all patients with pagination
  async getAllPatients(page = 1, itemsPerPage = 30, filters?: Record<string, any>) {
    // For testing purposes
    const mockResponse = {
      'hydra:member': [
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
      ],
      'hydra:totalItems': 2
    };
    
    return Promise.resolve({
      items: mockResponse['hydra:member'],
      totalItems: mockResponse['hydra:totalItems'],
      itemsPerPage,
      totalPages: Math.ceil((mockResponse['hydra:totalItems'] || 0) / itemsPerPage),
      currentPage: page,
    });
    
    // When API is ready, uncomment this:
    // return apiClient.getCollection<Patient>(this.endpoint, page, itemsPerPage, filters);
  }

  // Get a single patient by ID
  async getPatientById(id: string) {
    // For testing purposes
    const mockResponse = {
      id,
      '@id': `/patients/${id}`,
      name: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      phone: '01-23-45-67-89',
      dob: '1975-03-15',
      address: '123 Rue Principale, Paris',
      insurance: 'CPAM',
      status: 'Actif',
      createdAt: '2022-01-15T10:30:00',
      updatedAt: '2022-01-15T10:30:00'
    };
    
    return Promise.resolve(mockResponse);
    
    // When API is ready, uncomment this:
    // return apiClient.get<Patient>(`${this.endpoint}/${id}`);
  }

  // Create a new patient
  async createPatient(patient: Omit<Patient, '@id' | 'id'>) {
    // For testing purposes
    console.log('Création de patient:', patient);
    
    // Mock successful response
    const mockResponse = {
      ...patient,
      id: `P-${Math.floor(1000 + Math.random() * 9000)}`,
      '@id': `/patients/${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(mockResponse);
    
    // When API is ready, uncomment this:
    // return apiClient.post<Patient>(this.endpoint, patient);
  }

  // Update an existing patient
  async updatePatient(id: string, patient: Partial<Patient>) {
    // For testing purposes
    console.log('Mise à jour de patient:', id, patient);
    
    // Mock successful response
    const mockResponse = {
      ...patient,
      id,
      '@id': `/patients/${id}`,
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(mockResponse as Patient);
    
    // When API is ready, uncomment this:
    // return apiClient.patch<Patient>(`${this.endpoint}/${id}`, patient);
  }

  // Delete a patient
  async deletePatient(id: string) {
    // For testing purposes
    console.log('Suppression de patient:', id);
    
    // Mock successful response
    return Promise.resolve({});
    
    // When API is ready, uncomment this:
    // return apiClient.delete(`${this.endpoint}/${id}`);
  }

  // Get patient prescriptions
  async getPatientPrescriptions(id: string) {
    // For testing purposes
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
    
    // When API is ready, uncomment this:
    // return apiClient.get<any[]>(`${this.endpoint}/${id}/prescriptions`);
  }

  // Search patients
  async searchPatients(query: string) {
    // For testing purposes
    const mockResponse = [
      {
        id: 'P-1001',
        '@id': '/patients/P-1001',
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        phone: '01-23-45-67-89',
        dob: '1975-03-15',
        address: '123 Rue Principale, Paris',
        insurance: 'CPAM',
        status: 'Actif'
      }
    ].filter(patient => 
      patient.name.toLowerCase().includes(query.toLowerCase()) ||
      patient.email.toLowerCase().includes(query.toLowerCase()) ||
      patient.phone.includes(query)
    );
    
    return Promise.resolve(mockResponse);
    
    // When API is ready, uncomment this:
    // return apiClient.get<Patient[]>(`${this.endpoint}/search?query=${query}`);
  }
}

export default new PatientService();
