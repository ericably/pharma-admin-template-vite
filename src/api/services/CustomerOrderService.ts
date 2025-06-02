
import apiClient from '../apiClient';
import {Patient} from "@/api/services/PatientService.ts";
import {Medication} from "@/api/services/MedicationService.ts";
import {Doctor} from "@/api/services/DoctorService.ts";

// Type definitions
export interface CustomerOrderItem {
  medication: Medication;
  medicationId: string;
  quantity: number;
  unitPrice: number;
  posology: string;
  instructions?: string;
}

export interface CustomerOrder {
  '@id'?: string;
  id?: string;
  patient: Patient;
  patientId: string;
  prescriptionId?: string;
  orderDate: string;
  items: CustomerOrderItem[];
  totalAmount: number;
  status: 'En attente' | 'En préparation' | 'Prêt pour retrait' | 'Livré' | 'Annulé';
  doctor?: Doctor;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

class CustomerOrderService {
  private endpoint = '/customer-orders';
  
  // Mock data for demo
  // @ts-ignore
  private mockOrders: CustomerOrder[] = [];

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
