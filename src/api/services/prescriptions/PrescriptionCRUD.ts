
import apiClient from '../../apiClient';
import { ApiPrescription, Prescription, ApiPlatformCollectionResponse } from '../../types/prescription';
import { convertApiToUiFormat, convertUiToApiFormat } from '../../utils/prescriptionConverter';

export class PrescriptionCRUD {
  private endpoint = '/api/prescriptions';

  // Get all prescriptions with pagination
  async getAllPrescriptions(page = 1, itemsPerPage = 30, filters?: Record<string, any>) {
    console.log('🔄 Fetching prescriptions from API...');
    console.log('📍 Endpoint:', this.endpoint);
    
    try {
      const response = await apiClient.get<ApiPlatformCollectionResponse<ApiPrescription>>(this.endpoint);
      console.log('✅ API Response received:', response);
      console.log('📊 Response type:', typeof response);
      console.log('📋 Is Collection:', response?.['@type']);
      console.log('📏 Total items:', response?.totalItems);
      console.log('📏 Member length:', response?.member?.length);
      
      if (!response || !response.member) {
        console.warn('⚠️ API returned null/undefined or no member array');
        return {
          items: [],
          totalItems: 0,
          itemsPerPage,
          totalPages: 0,
          currentPage: page,
        };
      }

      if (!Array.isArray(response.member)) {
        console.warn('⚠️ API response member is not an array:', response.member);
        return {
          items: [],
          totalItems: 0,
          itemsPerPage,
          totalPages: 0,
          currentPage: page,
        };
      }
      
      console.log('🔄 Converting API data to UI format...');
      const convertedPrescriptions = response.member.map((prescription, index) => {
        console.log(`Converting prescription ${index + 1}:`, prescription);
        return convertApiToUiFormat(prescription);
      });
      
      console.log('✅ Converted prescriptions:', convertedPrescriptions);
      
      return {
        items: convertedPrescriptions,
        totalItems: response.totalItems || convertedPrescriptions.length,
        itemsPerPage,
        totalPages: Math.ceil((response.totalItems || convertedPrescriptions.length) / itemsPerPage),
        currentPage: page,
      };
    } catch (error) {
      console.error('❌ Error fetching prescriptions:', error);
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
