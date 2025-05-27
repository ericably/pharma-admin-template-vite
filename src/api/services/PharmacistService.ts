
import apiClient from '../apiClient';

export interface Pharmacist {
  '@id'?: string;
  id?: number;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

class PharmacistService {
  private endpoint = '/pharmacists';
  private mockPharmacists: Pharmacist[] = [
    {
      id: 1,
      name: "Dr. Marie Dupont",
      email: "marie.dupont@pharmacie.com",
      phone: "01 23 45 67 89",
      licenseNumber: "PH123456",
      status: true
    },
    {
      id: 2,
      name: "Dr. Pierre Martin",
      email: "pierre.martin@pharmacie.com",
      phone: "01 98 76 54 32",
      licenseNumber: "PH789012",
      status: true
    }
  ];

  async getAllPharmacists(page = 1, itemsPerPage = 30) {
    return Promise.resolve({
      items: this.mockPharmacists,
      totalItems: this.mockPharmacists.length,
      itemsPerPage,
      totalPages: 1,
      currentPage: page
    });
  }

  async createPharmacist(pharmacist: Omit<Pharmacist, '@id' | 'id'>) {
    const newPharmacist = {
      ...pharmacist,
      id: Math.floor(1000 + Math.random() * 9000),
      '@id': `/pharmacists/${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.mockPharmacists.push(newPharmacist);
    
    return Promise.resolve(newPharmacist);
  }
  
  async updatePharmacist(id: number, pharmacist: Partial<Pharmacist>) {
    const index = this.mockPharmacists.findIndex(p => p.id === id);
    if (index === -1) {
      return Promise.reject(new Error("Pharmacist not found"));
    }
    
    this.mockPharmacists[index] = {
      ...this.mockPharmacists[index],
      ...pharmacist,
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(this.mockPharmacists[index]);
  }
  
  async deletePharmacist(id: number) {
    const index = this.mockPharmacists.findIndex(p => p.id === id);
    if (index === -1) {
      return Promise.reject(new Error("Pharmacist not found"));
    }
    
    const deleted = this.mockPharmacists.splice(index, 1)[0];
    return Promise.resolve(deleted);
  }
}

export default new PharmacistService();
