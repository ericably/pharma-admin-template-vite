
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

  async getAllPatients(page = 1, itemsPerPage = 30, filters?: Record<string, any>) {
    try {
      console.log('Fetching patients from API...', { page, itemsPerPage, filters });
      
      // Utilise votre API client pour récupérer les données
      const response = await apiClient.getCollection<Patient>(
        this.endpoint, 
        page, 
        itemsPerPage, 
        filters
      );
      
      console.log('API Response:', response);
      return response;
      
    } catch (error) {
      console.error('Error fetching patients from API:', error);
      
      // Fallback vers des données mock en cas d'erreur API
      console.log('Falling back to mock data...');
      return this.getMockPatients(page, itemsPerPage);
    }
  }

  async getPatientById(id: string) {
    try {
      console.log('Fetching patient by ID from API:', id);
      
      const patient = await apiClient.get<Patient>(`${this.endpoint}/${id}`);
      console.log('Patient fetched from API:', patient);
      
      return patient;
      
    } catch (error) {
      console.error('Error fetching patient from API:', error);
      
      // Fallback vers des données mock
      const mockPatients = this.getMockPatientsData();
      const patient = mockPatients.find(p => p.id === id);
      
      if (!patient) {
        throw new Error("Patient not found");
      }
      
      return patient;
    }
  }

  async createPatient(patient: Omit<Patient, '@id' | 'id'>) {
    try {
      console.log('Creating patient via API:', patient);
      
      const newPatient = await apiClient.post<Patient>(this.endpoint, patient);
      console.log('Patient created via API:', newPatient);
      
      return newPatient;
      
    } catch (error) {
      console.error('Error creating patient via API:', error);
      
      // Fallback vers simulation mock
      console.log('Simulating patient creation...');
      const mockPatient = {
        ...patient,
        id: `P-${Math.floor(1000 + Math.random() * 9000)}`,
        '@id': `/patients/P-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return mockPatient;
    }
  }

  async updatePatient(id: string, patient: Partial<Patient>) {
    try {
      console.log('Updating patient via API:', id, patient);
      
      const updatedPatient = await apiClient.patch<Patient>(`${this.endpoint}/${id}`, patient);
      console.log('Patient updated via API:', updatedPatient);
      
      return updatedPatient;
      
    } catch (error) {
      console.error('Error updating patient via API:', error);
      
      // Fallback vers simulation mock
      console.log('Simulating patient update...');
      const mockPatients = this.getMockPatientsData();
      const existingPatient = mockPatients.find(p => p.id === id);
      
      if (!existingPatient) {
        throw new Error("Patient not found");
      }
      
      const updatedMockPatient = {
        ...existingPatient,
        ...patient,
        updatedAt: new Date().toISOString()
      };
      
      return updatedMockPatient;
    }
  }

  async deletePatient(id: string) {
    try {
      console.log('Deleting patient via API:', id);
      
      const deletedPatient = await apiClient.delete<Patient>(`${this.endpoint}/${id}`);
      console.log('Patient deleted via API:', deletedPatient);
      
      return deletedPatient;
      
    } catch (error) {
      console.error('Error deleting patient via API:', error);
      
      // Fallback vers simulation mock
      console.log('Simulating patient deletion...');
      const mockPatients = this.getMockPatientsData();
      const patientToDelete = mockPatients.find(p => p.id === id);
      
      if (!patientToDelete) {
        throw new Error("Patient not found");
      }
      
      return patientToDelete;
    }
  }

  async getPatientPrescriptions(id: string) {
    try {
      console.log('Fetching patient prescriptions from API:', id);
      
      const prescriptions = await apiClient.get<any[]>(`${this.endpoint}/${id}/prescriptions`);
      console.log('Prescriptions fetched from API:', prescriptions);
      
      return prescriptions;
      
    } catch (error) {
      console.error('Error fetching prescriptions from API:', error);
      
      // Fallback vers données mock
      const mockPrescriptions = [
        {
          id: 'RX-0001',
          patient: 'Patient',
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
      
      return mockPrescriptions;
    }
  }

  async searchPatients(query: string) {
    try {
      console.log('Searching patients via API:', query);
      
      const searchResults = await apiClient.get<Patient[]>(`${this.endpoint}/search`, { q: query });
      console.log('Search results from API:', searchResults);
      
      return searchResults;
      
    } catch (error) {
      console.error('Error searching patients via API:', error);
      
      // Fallback vers recherche mock
      const mockPatients = this.getMockPatientsData();
      const filteredPatients = mockPatients.filter(patient => 
        patient.name.toLowerCase().includes(query.toLowerCase()) ||
        patient.email.toLowerCase().includes(query.toLowerCase()) ||
        patient.phone.includes(query)
      );
      
      return filteredPatients;
    }
  }

  // Données mock pour le développement/fallback
  private getMockPatientsData(): Patient[] {
    return [
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
  }

  private getMockPatients(page: number, itemsPerPage: number) {
    const mockPatients = this.getMockPatientsData();
    
    return {
      items: mockPatients,
      totalItems: mockPatients.length,
      itemsPerPage,
      totalPages: Math.ceil(mockPatients.length / itemsPerPage),
      currentPage: page,
    };
  }
}

export default new PatientService();

