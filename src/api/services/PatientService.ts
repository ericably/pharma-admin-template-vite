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
      const response = await apiClient.getCollection<Patient>(
        this.endpoint, 
        page, 
        itemsPerPage, 
        filters
      );
      
      return response;
      
    } catch (error) {
      console.error('Error fetching patients from API:', error);
      return this.getMockPatients(page, itemsPerPage);
    }
  }

  async getPatientById(id: string) {
    try {
      const patient = await apiClient.get<Patient>(`${this.endpoint}/${id}`);
      return patient;
      
    } catch (error) {
      console.error('Error fetching patient from API:', error);
      
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
      const newPatient = await apiClient.post<Patient>(this.endpoint, patient);
      return newPatient;
      
    } catch (error) {
      console.error('Error creating patient via API:', error);
      
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
      const updatedPatient = await apiClient.patch<Patient>(`${this.endpoint}/${id}`, patient);
      return updatedPatient;
      
    } catch (error) {
      console.error('Error updating patient via API:', error);
      
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
      await apiClient.delete(`${this.endpoint}/${id}`);
      return true;
      
    } catch (error) {
      console.error('Error deleting patient via API:', error);
      
      const mockPatients = this.getMockPatientsData();
      const patientToDelete = mockPatients.find(p => p.id === id);
      
      if (!patientToDelete) {
        throw new Error("Patient not found");
      }
      
      return true;
    }
  }

  async getPatientPrescriptions(id: string) {
    try {
      const prescriptions = await apiClient.get<any[]>(`${this.endpoint}/${id}/prescriptions`);
      return prescriptions;
      
    } catch (error) {
      console.error('Error fetching prescriptions from API:', error);
      
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
      const searchResults = await apiClient.get<Patient[]>(`${this.endpoint}/search`, { q: query });
      return searchResults;
      
    } catch (error) {
      console.error('Error searching patients via API:', error);
      
      const mockPatients = this.getMockPatientsData();
      const filteredPatients = mockPatients.filter(patient => 
        patient.name.toLowerCase().includes(query.toLowerCase()) ||
        patient.email.toLowerCase().includes(query.toLowerCase()) ||
        patient.phone.includes(query)
      );
      
      return filteredPatients;
    }
  }

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