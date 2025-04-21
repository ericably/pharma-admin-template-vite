
import apiClient from '../apiClient';

// Type definitions
export interface Prescription {
  '@id'?: string;
  id?: string;
  patient: string;
  patientId: string;
  medication: string;
  medicationId: string;
  dosage: string;
  quantity: number;
  doctor: string;
  date: string;
  status: 'Pending' | 'Filled' | 'Ready for Pickup' | 'Delivered';
  instructions?: string;
  createdAt?: string;
  updatedAt?: string;
}

class PrescriptionService {
  private endpoint = '/prescriptions';

  // Get all prescriptions with pagination
  async getAllPrescriptions(page = 1, itemsPerPage = 30, filters?: Record<string, any>) {
    return apiClient.getCollection<Prescription>(this.endpoint, page, itemsPerPage, filters);
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
}

export default new PrescriptionService();
