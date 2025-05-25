
import apiClient from '../apiClient';

export interface Medication {
  '@id'?: string;
  id?: number;
  name: string;
  category: string;
  description?: string;
  dosage: string;
  stock: number;
  supplier: string;
  price: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

class MedicationService {
  private endpoint = '/medications';
  private mockMedications: Medication[] = [
    {
      id: 1,
      name: 'Paracétamol',
      category: 'Analgésique',
      description: 'Pour soulager la douleur légère à modérée',
      dosage: '500mg',
      stock: 50,
      supplier: 'Pharma France',
      price: 3.50,
      status: 'Actif',
      createdAt: '2023-01-01T00:00:00',
      updatedAt: '2023-01-01T00:00:00'
    },
    {
      id: 2,
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

  async getAllMedications(page = 1, itemsPerPage = 30, filters?: Record<string, any>) {
    return Promise.resolve({
      items: this.mockMedications,
      totalItems: this.mockMedications.length,
      itemsPerPage,
      totalPages: 1,
      currentPage: page
    });
  }

  async getMedicationById(id: number) {
    const medication = this.mockMedications.find(m => m.id === id);
    if (!medication) {
      return Promise.reject(new Error("Medication not found"));
    }
    return Promise.resolve(medication);
  }

  async createMedication(medication: Omit<Medication, '@id' | 'id'>) {
    console.log('Création du médicament:', medication);
    
    const newMedication = {
      ...medication,
      id: Math.floor(1000 + Math.random() * 9000),
      '@id': `/medications/${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.mockMedications.push(newMedication);
    
    return Promise.resolve(newMedication);
  }

  async updateMedication(id: number, medication: Partial<Medication>) {
    console.log('Mise à jour du médicament:', id, medication);
    
    const index = this.mockMedications.findIndex(m => m.id === id);
    if (index === -1) {
      return Promise.reject(new Error("Medication not found"));
    }
    
    this.mockMedications[index] = {
      ...this.mockMedications[index],
      ...medication,
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(this.mockMedications[index]);
  }

  async deleteMedication(id: number) {
    console.log('Suppression du médicament:', id);
    
    const index = this.mockMedications.findIndex(m => m.id === id);
    if (index === -1) {
      return Promise.reject(new Error("Medication not found"));
    }
    
    const deleted = this.mockMedications.splice(index, 1)[0];
    return Promise.resolve(deleted);
  }

  async getLowStockMedications() {
    const lowStockMedications = this.mockMedications.filter(m => m.stock < 10);
    return Promise.resolve(lowStockMedications);
  }

  async getMedicationsByCategory(category: string) {
    const medicationsByCategory = this.mockMedications.filter(m => m.category === category);
    return Promise.resolve(medicationsByCategory);
  }
}

export default new MedicationService();
