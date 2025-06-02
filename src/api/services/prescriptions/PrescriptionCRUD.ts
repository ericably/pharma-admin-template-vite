
import apiClient from '../../apiClient';
import { ApiPrescription, Prescription } from '../../types/prescription';
import { convertApiToUiFormat, convertUiToApiFormat } from '../../utils/prescriptionConverter';

export class PrescriptionCRUD {
  private endpoint = '/api/prescriptions';

  // Get all prescriptions with pagination
  async getAllPrescriptions(page = 1, itemsPerPage = 30, filters?: Record<string, any>) {
    console.log('Fetching prescriptions from API...');
    
    const response = await apiClient.get<ApiPrescription[]>(this.endpoint);
    console.log('API Response:', response);
    
    const convertedPrescriptions = response.map(convertApiToUiFormat);
    
    return {
      items: convertedPrescriptions,
      totalItems: convertedPrescriptions.length,
      itemsPerPage,
      totalPages: Math.ceil(convertedPrescriptions.length / itemsPerPage),
      currentPage: page,
    };
  }

  // Get a single prescription by ID
  async getPrescriptionById(id: string) {
    const response = await apiClient.get<ApiPrescription>(`${this.endpoint}/${id}`);
    return convertApiToUiFormat(response);
  }

  // Create a new prescription
  async createPrescription(prescription: Omit<Prescription, '@id' | 'id'>) {
    console.log('Création d\'ordonnance:', prescription);
    
    const apiData = convertUiToApiFormat(prescription);
    const response = await apiClient.post<ApiPrescription>(this.endpoint, apiData);
    return convertApiToUiFormat(response);
  }

  // Update an existing prescription
  async updatePrescription(id: string, prescription: Partial<Prescription>) {
    console.log('Mise à jour d\'ordonnance:', id, prescription);
    
    const response = await apiClient.patch<ApiPrescription>(`${this.endpoint}/${id}`, prescription);
    return convertApiToUiFormat(response);
  }

  // Delete a prescription
  async deletePrescription(id: string) {
    console.log('Suppression d\'ordonnance:', id);
    return await apiClient.delete(`${this.endpoint}/${id}`);
  }
}
