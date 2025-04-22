
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
    // For testing purposes, we'll use sample data since the API is not connected
    console.log('Création du médicament:', medication);
    
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
    // For testing purposes
    console.log('Mise à jour du médicament:', id, medication);
    
    // Mock successful response
    const mockResponse = {
      ...medication,
      id,
      '@id': `/medications/${id}`,
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(mockResponse as Medication);
    
    // When API is ready, uncomment this:
    // return apiClient.patch<Medication>(`${this.endpoint}/${id}`, medication);
  }

  // Delete a medication
  async deleteMedication(id: number) {
    // For testing purposes
    console.log('Suppression du médicament:', id);
    
    // Mock successful response
    return Promise.resolve({});
    
    // When API is ready, uncomment this:
    // return apiClient.delete(`${this.endpoint}/${id}`);
  }

  // Get medications with low stock
  async getLowStockMedications() {
    // For testing purposes
    const mockResponse = [
      {
        id: 1,
        '@id': '/medications/1',
        name: 'Paracétamol',
        category: 'Analgésique',
        description: 'Pour soulager la douleur légère à modérée',
        dosage: '500mg',
        stock: 5,
        supplier: 'Pharma France',
        price: 3.50,
        status: 'Actif',
        createdAt: '2023-01-01T00:00:00',
        updatedAt: '2023-01-01T00:00:00'
      },
      {
        id: 2,
        '@id': '/medications/2',
        name: 'Amoxicilline',
        category: 'Antibiotique',
        description: 'Antibiotique à large spectre',
        dosage: '250mg',
        stock: 8,
        supplier: 'MediPharma',
        price: 7.20,
        status: 'Actif',
        createdAt: '2023-01-01T00:00:00',
        updatedAt: '2023-01-01T00:00:00'
      }
    ];
    
    return Promise.resolve(mockResponse);
    
    // When API is ready, uncomment this:
    // return apiClient.get<Medication[]>(`${this.endpoint}/low-stock`);
  }

  // Get medications by category
  async getMedicationsByCategory(category: string) {
    // For testing purposes
    const mockResponse = [
      {
        id: 1,
        '@id': '/medications/1',
        name: 'Paracétamol',
        category: category,
        description: 'Pour soulager la douleur légère à modérée',
        dosage: '500mg',
        stock: 50,
        supplier: 'Pharma France',
        price: 3.50,
        status: 'Actif',
        createdAt: '2023-01-01T00:00:00',
        updatedAt: '2023-01-01T00:00:00'
      }
    ];
    
    return Promise.resolve(mockResponse);
    
    // When API is ready, uncomment this:
    // return apiClient.get<Medication[]>(`${this.endpoint}?category=${category}`);
  }
}

export default new MedicationService();
