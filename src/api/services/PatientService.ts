
import apiClient from '../apiClient';

// Type definitions
export interface Patient {
  '@id'?: string;
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  birthdate?: string;
  address?: string;
  insurance?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

class PatientService {
  private endpoint = '/patients';

  // Get all patients with pagination
  async getAllPatients(page = 1, itemsPerPage = 30, filters?: Record<string, any>) {
    try {
      const response = await apiClient.getCollection<Patient>(this.endpoint, page, itemsPerPage, filters);
      // Ensure we're returning the data in the expected format
      return {
        items: response.items, // This should contain the array of patients from 'hydra:member'
        totalItems: response.totalItems,
        itemsPerPage,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
      };
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  // Get a single patient by ID
  async getPatientById(id: string) {
     return apiClient.get<Patient>(`${this.endpoint}/${id}`);
  }

  // Create a new patient
  async createPatient(patient: Omit<Patient, '@id' | 'id'>) {
     return apiClient.post<Patient>(this.endpoint, patient);
  }

  // Update an existing patient
  async updatePatient(id: string, patient: Partial<Patient>) {
    return apiClient.put<Patient>(`${this.endpoint}/${id}`, patient);
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
    // For testing purposes
    /*
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
     */
    
    // When API is ready, uncomment this:
    return apiClient.get<Patient[]>(`${this.endpoint}/search?query=${query}`);
  }
}

export default new PatientService();
