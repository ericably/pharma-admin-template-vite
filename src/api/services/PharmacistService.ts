
import apiClient from '../apiClient';

export interface Pharmacist {
  '@id'?: string;
  id?: string;
  lastName: string;
  firstName: string;
  pharmacy: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

class PharmacistService {
  private endpoint = '/pharmacists';

  async getAllPharmacists(page = 1, itemsPerPage = 30, filters?: Record<string, any>) {
    try {
      const response = await apiClient.getCollection<Pharmacist>(this.endpoint, page, itemsPerPage, filters);
      // Ensure we're returning the data in the expected format
      return {
        items: response.items, // This should contain the array of pharmacists from 'hydra:member'
        totalItems: response.totalItems,
        itemsPerPage,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
      };
    } catch (error) {
      console.error('Error fetching pharmacists:', error);
      throw error;
    }
  }

  async createPharmacist(pharmacist: Omit<Pharmacist, '@id' | 'id'>) {
    return apiClient.post<Pharmacist>(this.endpoint, pharmacist);
  }

  async updatePharmacist(id: string, pharmacist: Partial<Pharmacist>) {
    return apiClient.put<Pharmacist>(`${this.endpoint}/${id}`, pharmacist);
  }

  async deletePharmacist(id: string) {
    return apiClient.delete(`${this.endpoint}/${id}`);
  }
}

export default new PharmacistService();
