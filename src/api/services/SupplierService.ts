import apiClient from '../apiClient';

export interface Supplier {
  '@id'?: string;
  id?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  licenseNumber: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

class SupplierService {
  private endpoint = '/suppliers';
  private mockSuppliers: Supplier[] = [
    {
      id: 1,
      name: "Pharma Wholesale Inc.",
      email: "contact@pharmawholesale.com",
      phone: "01 23 45 67 89",
      address: "123 Rue du Commerce, 75001 Paris",
      category: "Distributeur",
      licenseNumber: "SUP123456",
      status: true
    },
    {
      id: 2,
      name: "MedSource Supply",
      email: "info@medsource.com",
      phone: "01 98 76 54 32",
      address: "456 Avenue des Distributeurs, 69001 Lyon",
      category: "Grossiste",
      licenseNumber: "SUP789012",
      status: true
    },
    {
      id: 3,
      name: "HealthMed Suppliers",
      email: "contact@healthmed.com",
      phone: "01 45 67 89 01",
      address: "789 Boulevard des Fournisseurs, 33000 Bordeaux",
      category: "Fabricant",
      licenseNumber: "SUP345678",
      status: false
    }
  ];

  async getAllSuppliers(page = 1, itemsPerPage = 30) {
    return Promise.resolve({
      items: this.mockSuppliers,
      totalItems: this.mockSuppliers.length,
      itemsPerPage,
      totalPages: 1,
      currentPage: page
    });
  }

  async createSupplier(supplier: Omit<Supplier, '@id' | 'id'>) {
    const newSupplier = {
      ...supplier,
      id: Math.floor(1000 + Math.random() * 9000),
      '@id': `/suppliers/${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.mockSuppliers.push(newSupplier);
    
    return Promise.resolve(newSupplier);
  }

  async updateSupplier(id: number, supplier: Partial<Supplier>) {
    const index = this.mockSuppliers.findIndex(s => s.id === id);
    if (index === -1) {
      return Promise.reject(new Error("Supplier not found"));
    }
    
    this.mockSuppliers[index] = {
      ...this.mockSuppliers[index],
      ...supplier,
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(this.mockSuppliers[index]);
  }

  async deleteSupplier(id: number) {
    const index = this.mockSuppliers.findIndex(s => s.id === id);
    if (index === -1) {
      return Promise.reject(new Error("Supplier not found"));
    }
    
    const deleted = this.mockSuppliers.splice(index, 1)[0];
    return Promise.resolve(deleted);
  }
}

export default new SupplierService();