
import apiClient from '../../apiClient';
import { ApiPrescription, Prescription, ApiPlatformCollectionResponse } from '../../types/prescription';
import { convertApiToUiFormat, convertUiToApiFormat } from '../../utils/prescriptionConverter';

export class PrescriptionCRUD {
  private endpoint = '/api/prescriptions';

  // Get all prescriptions with pagination
  async getAllPrescriptions(page = 1, itemsPerPage = 30, filters?: Record<string, any>) {
    try {
      const response = await apiClient.get<ApiPlatformCollectionResponse<ApiPrescription>>(this.endpoint);
      
      if (!response || !response.member) {
        return {
          items: [],
          totalItems: 0,
          itemsPerPage,
          totalPages: 0,
          currentPage: page,
        };
      }

      if (!Array.isArray(response.member)) {
        return {
          items: [],
          totalItems: 0,
          itemsPerPage,
          totalPages: 0,
          currentPage: page,
        };
      }
      
      const convertedPrescriptions = response.member.map(prescription => 
        convertApiToUiFormat(prescription)
      );
      
      return {
        items: convertedPrescriptions,
        totalItems: response.totalItems || convertedPrescriptions.length,
        itemsPerPage,
        totalPages: Math.ceil((response.totalItems || convertedPrescriptions.length) / itemsPerPage),
        currentPage: page,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get a single prescription by ID
  async getPrescriptionById(id: string) {
    const response = await apiClient.get<ApiPrescription>(`${this.endpoint}/${id}`);
    return convertApiToUiFormat(response);
  }

  // Create a new prescription
  async createPrescription(prescription: Omit<Prescription, '@id' | 'id'>) {
    const apiData = convertUiToApiFormat(prescription);
    const response = await apiClient.post<ApiPrescription>(this.endpoint, apiData);
    return convertApiToUiFormat(response);
  }

  // Update an existing prescription
  async updatePrescription(id: string, prescription: Partial<Prescription>) {
    const response = await apiClient.patch<ApiPrescription>(`${this.endpoint}/${id}`, prescription);
    return convertApiToUiFormat(response);
  }

  // Delete a prescription
  async deletePrescription(id: string) {
    return await apiClient.delete(`${this.endpoint}/${id}`);
  }
}
