import apiClient from '../apiClient';
import {Patient} from "@/api/services/PatientService.ts";
import {Doctor} from "@/api/services/DoctorService.ts";
import {Medication} from "@/api/services/MedicationService.ts";

// Type definitions for prescription items
export interface PrescriptionItem {
  medication: Medication;
  medicationId: string;
  posology: string;
  quantity: number;
  instructions?: string;
}

export interface Prescription {
  '@id'?: string;
  id?: string;
  patient: Patient;
  patientId: string;
  items: PrescriptionItem[];
  doctor: Doctor;
  issuedDate: string;
  status: 'En attente' | 'Préparé' | 'Prêt pour retrait' | 'Livré';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

class PrescriptionService {
  private endpoint = '/prescriptions';

  // Get all prescriptions with pagination
  async getAllPrescriptions(page = 1, itemsPerPage = 30, filters?: Record<string, any>) {
    try {
      const response = await apiClient.getCollection<Prescription>(this.endpoint, page, itemsPerPage, filters);
      // Ensure we're returning the data in the expected format
      return {
        items: response.items, // This should contain the array of patients from 'hydra:member'
        totalItems: response.totalItems,
        itemsPerPage,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
      };
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      throw error;
    }
  }

  // Get a single prescription by ID
  async getPrescriptionById(id: string) {
    return apiClient.get<Prescription>(`${this.endpoint}/${id}`);
  }

  // Create a new prescription
  async createPrescription(prescription: Omit<Prescription, '@id' | 'id'>) {
    return apiClient.post<Prescription>(this.endpoint, prescription);
  }

  // Update an existing prescription
  async updatePrescription(id: string, prescription: Partial<Prescription>) {
    return apiClient.patch<Prescription>(`${this.endpoint}/${id}`, prescription);
  }

  // Delete a prescription
  async deletePrescription(id: string) {
    return apiClient.delete(`${this.endpoint}/${id}`);
  }

  // Get prescriptions by patient
  async getPrescriptionsByPatient(patientId: string) {
    return apiClient.get<Prescription[]>(`${this.endpoint}?patientId=${patientId}`);
  }

  // Get prescriptions by status
  async getPrescriptionsByStatus(status: string) {
    return apiClient.get<Prescription[]>(`${this.endpoint}?status=${status}`);
  }
  
  // Update prescription status
  async updatePrescriptionStatus(id: string, status: Prescription['status']) {
    return apiClient.patch<Prescription>(`${this.endpoint}/${id}`, { status });
  }

  // Convert prescription to customer order
  async convertToCustomerOrder(prescriptionId: string) {
    console.log('Conversion d\'ordonnance en commande:', prescriptionId);

    // Get the prescription details
    const prescription = await this.getPrescriptionById(prescriptionId);

    // Convert prescription items to order items
    const orderItems = prescription.items.map(item => ({
      medication: item.medication,
      medicationId: item.medicationId,
      quantity: item.quantity,
      unitPrice: 1.50, // Mock price, should come from medication data
      posology: item.posology,
      instructions: item.instructions
    }));

    // Calculate total amount
    const totalAmount = orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    const customerOrder = {
      patient: prescription.patient,
      patientId: prescription.patientId,
      prescriptionId: prescription.id,
      orderDate: new Date().toISOString().split('T')[0],
      items: orderItems,
      totalAmount,
      status: 'En attente' as const,
      doctor: prescription.doctor,
      notes: prescription.notes
    };

    // Import and use CustomerOrderService
    const { default: CustomerOrderService } = await import('./CustomerOrderService');
    return CustomerOrderService.createCustomerOrder(customerOrder);
  }
}

export default new PrescriptionService();
