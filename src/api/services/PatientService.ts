
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
    return apiClient.getCollection<Patient>(this.endpoint, page, itemsPerPage, filters);
  }

  // Get a single patient by ID
  async getPatientById(id: string) {
    return apiClient.get<Patient>(`${this.endpoint}/${id}`);
  }

  // Create a new patient
  async createPatient(patient: Omit<Patient, '@id' | 'id'>) {
    // For now, we'll use the sample data since the API is not connected
    console.log('Creating patient:', patient);
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
    return apiClient.patch<Patient>(`${this.endpoint}/${id}`, patient);
  }

  // Delete a patient
  async deletePatient(id: string) {
    return apiClient.delete(`${this.endpoint}/${id}`);
  }

  // Get patient prescriptions
  async getPatientPrescriptions(id: string) {
    return apiClient.get<any[]>(`${this.endpoint}/${id}/prescriptions`);
  }

  // Search patients
  async searchPatients(query: string) {
    return apiClient.get<Patient[]>(`${this.endpoint}/search?query=${query}`);
  }
}

export default new PatientService();
