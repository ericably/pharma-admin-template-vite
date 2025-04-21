
import apiClient from '../apiClient';

// Type definitions
export interface Medication {
  '@id'?: string;
  id?: number;
  name: string;
  category: string;
  description?: string;
  dosage: string;
  stock: number;
  supplier?: string;
  price: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

class MedicationService {
  private endpoint = '/medications';

  // Get all medications with pagination
  async getAllMedications(page = 1, itemsPerPage = 30, filters?: Record<string, any>) {
    return apiClient.getCollection<Medication>(this.endpoint, page, itemsPerPage, filters);
  }

  // Get a single medication by ID
  async getMedicationById(id: number) {
    return apiClient.get<Medication>(`${this.endpoint}/${id}`);
  }

  // Create a new medication
  async createMedication(medication: Omit<Medication, '@id' | 'id'>) {
    // For now, we'll use sample data since the API is not connected
    console.log('Creating medication:', medication);
    
    // Mock successful response
    const mockResponse = {
      ...medication,
      id: Math.floor(1000 + Math.random() * 9000),
      '@id': `/medications/${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(mockResponse);
    
    // When API is ready, uncomment this:
    // return apiClient.post<Medication>(this.endpoint, medication);
  }

  // Update an existing medication
  async updateMedication(id: number, medication: Partial<Medication>) {
    return apiClient.patch<Medication>(`${this.endpoint}/${id}`, medication);
  }

  // Delete a medication
  async deleteMedication(id: number) {
    return apiClient.delete(`${this.endpoint}/${id}`);
  }

  // Get medications with low stock
  async getLowStockMedications() {
    return apiClient.get<Medication[]>(`${this.endpoint}/low-stock`);
  }

  // Get medications by category
  async getMedicationsByCategory(category: string) {
    return apiClient.get<Medication[]>(`${this.endpoint}?category=${category}`);
  }
}

export default new MedicationService();
