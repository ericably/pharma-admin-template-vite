
import apiClient from '../apiClient';

// Type definitions
export interface CustomerOrderItem {
  medication: string;
  medicationId: string;
  quantity: number;
  unitPrice: number;
  dosage: string;
  instructions?: string;
}

export interface CustomerOrder {
  '@id'?: string;
  id?: string;
  patient: string;
  patientId: string;
  prescriptionId?: string;
  orderDate: string;
  items: CustomerOrderItem[];
  totalAmount: number;
  status: 'En attente' | 'En préparation' | 'Prêt pour retrait' | 'Livré' | 'Annulé';
  doctor?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

class CustomerOrderService {
  private endpoint = '/customer-orders';
  
  // Mock data for demo
  private mockOrders: CustomerOrder[] = [
    {
      id: 'CO-2023-001',
      patient: 'Jean Dupont',
      patientId: 'P-1001',
      prescriptionId: 'RX-0001',
      orderDate: '2023-05-15',
      items: [
        { 
          medication: 'Amoxicilline 500mg', 
          medicationId: 'M-001', 
          quantity: 30, 
          unitPrice: 0.85,
          dosage: '1 comprimé 3x par jour',
          instructions: 'Prendre avec de la nourriture'
        }
      ],
      totalAmount: 25.50,
      status: 'En préparation',
      doctor: 'Dr. Howard Lee',
      createdAt: '2023-05-15T10:30:00',
      updatedAt: '2023-05-15T14:20:00'
    },
    {
      id: 'CO-2023-002',
      patient: 'Marie Martin',
      patientId: 'P-1002',
      prescriptionId: 'RX-0002',
      orderDate: '2023-05-14',
      items: [
        { 
          medication: 'Lisinopril 10mg', 
          medicationId: 'M-002', 
          quantity: 30, 
          unitPrice: 0.45,
          dosage: '1 comprimé par jour',
          instructions: 'Prendre le matin'
        }
      ],
      totalAmount: 13.50,
      status: 'Prêt pour retrait',
      doctor: 'Dr. Sarah Chen',
      createdAt: '2023-05-14T09:20:00',
      updatedAt: '2023-05-14T16:45:00'
    },
    {
      id: 'CO-2023-003',
      patient: 'Robert Brown',
      patientId: 'P-1003',
      orderDate: '2023-05-13',
      items: [
        { 
          medication: 'Atorvastatin 20mg', 
          medicationId: 'M-003', 
          quantity: 30, 
          unitPrice: 1.25,
          dosage: '1 comprimé au coucher'
        }
      ],
      totalAmount: 37.50,
      status: 'Livré',
      doctor: 'Dr. James Wilson',
      createdAt: '2023-05-13T11:15:00',
      updatedAt: '2023-05-13T18:30:00'
    }
  ];

  async getAllCustomerOrders(page = 1, itemsPerPage = 30) {
    return Promise.resolve({
      items: this.mockOrders,
      totalItems: this.mockOrders.length,
      itemsPerPage,
      totalPages: Math.ceil(this.mockOrders.length / itemsPerPage),
      currentPage: page
    });
  }

  async createCustomerOrder(order: Omit<CustomerOrder, '@id' | 'id'>) {
    console.log('Création de commande client:', order);
    const newOrder = {
      ...order,
      id: `CO-${new Date().getFullYear()}-${(this.mockOrders.length + 1).toString().padStart(3, '0')}`,
      '@id': `/customer-orders/${this.mockOrders.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.mockOrders.unshift(newOrder);
    return Promise.resolve(newOrder);
  }

  async updateCustomerOrder(id: string, order: Partial<CustomerOrder>) {
    console.log('Mise à jour de commande client:', id, order);
    const index = this.mockOrders.findIndex(o => o.id === id);
    if (index === -1) {
      return Promise.reject(new Error("Customer order not found"));
    }
    
    this.mockOrders[index] = {
      ...this.mockOrders[index],
      ...order,
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(this.mockOrders[index]);
  }

  async updateOrderStatus(id: string, status: CustomerOrder['status']) {
    return this.updateCustomerOrder(id, { status });
  }

  async deleteCustomerOrder(id: string) {
    console.log('Suppression de commande client:', id);
    const index = this.mockOrders.findIndex(o => o.id === id);
    if (index === -1) {
      return Promise.reject(new Error("Customer order not found"));
    }
    
    const deleted = this.mockOrders.splice(index, 1)[0];
    return Promise.resolve(deleted);
  }

  async getOrdersByPatient(patientId: string) {
    const patientOrders = this.mockOrders.filter(order => order.patientId === patientId);
    return Promise.resolve(patientOrders);
  }
}

export default new CustomerOrderService();
