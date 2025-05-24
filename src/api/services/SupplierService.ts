
import apiClient from '../apiClient';

export interface Supplier {
  '@id'?: string;
  id?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'Actif' | 'Inactif';
  createdAt?: string;
  updatedAt?: string;
}

class SupplierService {
  private endpoint = '/suppliers';

  async getAllSuppliers(page = 1, itemsPerPage = 30) {
    // Pour le moment, retournons des données de test
    const mockSuppliers: Supplier[] = [
      {
        id: 1,
        name: "Pharma Wholesale Inc.",
        email: "contact@pharmawholesale.com",
        phone: "01 23 45 67 89",
        address: "123 Rue du Commerce, 75001 Paris",
        status: "Actif"
      },
      {
        id: 2,
        name: "MedSource Supply",
        email: "info@medsource.com",
        phone: "01 98 76 54 32",
        address: "456 Avenue des Distributeurs, 69001 Lyon",
        status: "Actif"
      },
      {
        id: 3,
        name: "HealthMed Suppliers",
        email: "contact@healthmed.com",
        phone: "01 45 67 89 01",
        address: "789 Boulevard des Fournisseurs, 33000 Bordeaux",
        status: "Actif"
      }
    ];
    
    return Promise.resolve({
      items: mockSuppliers,
      totalItems: mockSuppliers.length,
      itemsPerPage,
      totalPages: 1,
      currentPage: page
    });
  }

  async createSupplier(supplier: Omit<Supplier, '@id' | 'id'>) {
    console.log('Création du fournisseur:', supplier);
    const mockResponse = {
      ...supplier,
      id: Math.floor(1000 + Math.random() * 9000),
      '@id': `/suppliers/${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return Promise.resolve(mockResponse);
  }

  async updateSupplier(id: number, supplier: Partial<Supplier>) {
    console.log('Mise à jour du fournisseur:', id, supplier);
    const mockResponse = {
      ...supplier,
      id,
      '@id': `/suppliers/${id}`,
      updatedAt: new Date().toISOString()
    };
    return Promise.resolve(mockResponse as Supplier);
  }

  async deleteSupplier(id: number) {
    console.log('Suppression du fournisseur:', id);
    return Promise.resolve({});
  }
}

export default new SupplierService();
