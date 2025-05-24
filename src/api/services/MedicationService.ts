
import apiClient from '../apiClient';

// Type definitions
export interface Medication {
  '@id'?: string;
  id?: number;
  name: string;
  category?: string;
  description?: string;
  dosage: string;
  stockQuantity?: number;
  supplier?: string; // Changed from optional to required to match component usage
  price: number;
  status?: string; // Changed from optional to required to match component usage
  createdAt?: string;
  updatedAt?: string;
  expirationDate?: string; // Added expirationDate field
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
    return apiClient.post<Medication>(this.endpoint, medication);
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
