
import apiClient from '../apiClient';

// Type definitions
export interface Prescription {
  '@id'?: string;
  id?: string;
  patient: string;
  patientId: string;
  medication: string;
  medicationId: string;
  dosage: string;
  quantity: number;
  doctor: string;
  date: string;
  status: 'En attente' | 'Préparé' | 'Prêt pour retrait' | 'Livré';
  instructions?: string;
  createdAt?: string;
  updatedAt?: string;
}

class PrescriptionService {
  private endpoint = '/prescriptions';

  // Get all prescriptions with pagination
  async getAllPrescriptions(page = 1, itemsPerPage = 30, filters?: Record<string, any>) {
    // For testing purposes
    const mockResponse = {
      'hydra:member': [
        {
          id: 'RX-0001',
          '@id': '/prescriptions/RX-0001',
          patient: 'Jean Dupont',
          patientId: 'P-1001',
          medication: 'Amoxicilline 500mg',
          medicationId: 'M-001',
          dosage: '1 comprimé 3x par jour',
          quantity: 30,
          doctor: 'Dr. Howard Lee',
          date: '2023-05-15',
          status: 'En attente',
          instructions: 'Prendre avec de la nourriture',
          createdAt: '2023-05-15T10:30:00',
          updatedAt: '2023-05-15T10:30:00'
        },
        {
          id: 'RX-0002',
          '@id': '/prescriptions/RX-0002',
          patient: 'Marie Martin',
          patientId: 'P-1002',
          medication: 'Lisinopril 10mg',
          medicationId: 'M-002',
          dosage: '1 comprimé par jour',
          quantity: 30,
          doctor: 'Dr. Sarah Chen',
          date: '2023-05-14',
          status: 'Préparé',
          instructions: 'Prendre le matin',
          createdAt: '2023-05-14T09:20:00',
          updatedAt: '2023-05-14T15:45:00'
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
    // return apiClient.getCollection<Prescription>(this.endpoint, page, itemsPerPage, filters);
  }

  // Get a single prescription by ID
  async getPrescriptionById(id: string) {
    // For testing purposes
    const mockResponse = {
      id,
      '@id': `/prescriptions/${id}`,
      patient: 'Jean Dupont',
      patientId: 'P-1001',
      medication: 'Amoxicilline 500mg',
      medicationId: 'M-001',
      dosage: '1 comprimé 3x par jour',
      quantity: 30,
      doctor: 'Dr. Howard Lee',
      date: '2023-05-15',
      status: 'En attente' as const,
      instructions: 'Prendre avec de la nourriture',
      createdAt: '2023-05-15T10:30:00',
      updatedAt: '2023-05-15T10:30:00'
    };
    
    return Promise.resolve(mockResponse);
    
    // When API is ready, uncomment this:
    // return apiClient.get<Prescription>(`${this.endpoint}/${id}`);
  }

  // Create a new prescription
  async createPrescription(prescription: Omit<Prescription, '@id' | 'id'>) {
    // For testing purposes
    console.log('Création d\'ordonnance:', prescription);
    
    // Mock successful response
    const mockResponse = {
      ...prescription,
      id: `RX-${Math.floor(1000 + Math.random() * 9000)}`,
      '@id': `/prescriptions/${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(mockResponse);
    
    // When API is ready, uncomment this:
    // return apiClient.post<Prescription>(this.endpoint, prescription);
  }

  // Update an existing prescription
  async updatePrescription(id: string, prescription: Partial<Prescription>) {
    // For testing purposes
    console.log('Mise à jour d\'ordonnance:', id, prescription);
    
    // Mock successful response
    const mockResponse = {
      ...prescription,
      id,
      '@id': `/prescriptions/${id}`,
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(mockResponse as Prescription);
    
    // When API is ready, uncomment this:
    // return apiClient.patch<Prescription>(`${this.endpoint}/${id}`, prescription);
  }

  // Delete a prescription
  async deletePrescription(id: string) {
    // For testing purposes
    console.log('Suppression d\'ordonnance:', id);
    
    // Mock successful response
    return Promise.resolve({});
    
    // When API is ready, uncomment this:
    // return apiClient.delete(`${this.endpoint}/${id}`);
  }

  // Get prescriptions by patient
  async getPrescriptionsByPatient(patientId: string) {
    // For testing purposes
    const mockResponse = [
      {
        id: 'RX-0001',
        '@id': '/prescriptions/RX-0001',
        patient: 'Jean Dupont',
        patientId,
        medication: 'Amoxicilline 500mg',
        medicationId: 'M-001',
        dosage: '1 comprimé 3x par jour',
        quantity: 30,
        doctor: 'Dr. Howard Lee',
        date: '2023-05-15',
        status: 'En attente',
        instructions: 'Prendre avec de la nourriture',
        createdAt: '2023-05-15T10:30:00',
        updatedAt: '2023-05-15T10:30:00'
      }
    ];
    
    return Promise.resolve(mockResponse);
    
    // When API is ready, uncomment this:
    // return apiClient.get<Prescription[]>(`${this.endpoint}?patientId=${patientId}`);
  }

  // Get prescriptions by status
  async getPrescriptionsByStatus(status: string) {
    // For testing purposes
    const mockResponse = [
      {
        id: 'RX-0002',
        '@id': '/prescriptions/RX-0002',
        patient: 'Marie Martin',
        patientId: 'P-1002',
        medication: 'Lisinopril 10mg',
        medicationId: 'M-002',
        dosage: '1 comprimé par jour',
        quantity: 30,
        doctor: 'Dr. Sarah Chen',
        date: '2023-05-14',
        status,
        instructions: 'Prendre le matin',
        createdAt: '2023-05-14T09:20:00',
        updatedAt: '2023-05-14T15:45:00'
      }
    ];
    
    return Promise.resolve(mockResponse);
    
    // When API is ready, uncomment this:
    // return apiClient.get<Prescription[]>(`${this.endpoint}?status=${status}`);
  }
  
  // Update prescription status
  async updatePrescriptionStatus(id: string, status: Prescription['status']) {
    // For testing purposes
    console.log('Mise à jour du statut d\'ordonnance:', id, status);
    
    // Mock successful response
    const mockResponse = {
      id,
      '@id': `/prescriptions/${id}`,
      status,
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(mockResponse as Prescription);
    
    // When API is ready, uncomment this:
    // return apiClient.patch<Prescription>(`${this.endpoint}/${id}`, { status });
  }
}

export default new PrescriptionService();
