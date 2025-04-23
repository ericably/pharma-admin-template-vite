
import apiClient from '../apiClient';

export interface Pharmacist {
  '@id'?: string;
  id?: number;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: 'Actif' | 'Inactif';
  createdAt?: string;
  updatedAt?: string;
}

class PharmacistService {
  private endpoint = '/pharmacists';

  async getAllPharmacists(page = 1, itemsPerPage = 30) {
    // Pour le moment, retournons des données de test
    const mockPharmacists: Pharmacist[] = [
      {
        id: 1,
        name: "Dr. Marie Dupont",
        email: "marie.dupont@pharmacie.com",
        phone: "01 23 45 67 89",
        licenseNumber: "PH123456",
        status: "Actif"
      },
      {
        id: 2,
        name: "Dr. Pierre Martin",
        email: "pierre.martin@pharmacie.com",
        phone: "01 98 76 54 32",
        licenseNumber: "PH789012",
        status: "Actif"
      }
    ];
    
    return Promise.resolve({
      items: mockPharmacists,
      totalItems: mockPharmacists.length,
      itemsPerPage,
      totalPages: 1,
      currentPage: page
    });
  }

  async createPharmacist(pharmacist: Omit<Pharmacist, '@id' | 'id'>) {
    const mockResponse = {
      ...pharmacist,
      id: Math.floor(1000 + Math.random() * 9000),
      '@id': `/pharmacists/${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return Promise.resolve(mockResponse);
  }
}

export default new PharmacistService();
