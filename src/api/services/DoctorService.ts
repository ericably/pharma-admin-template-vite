
import apiClient from '../apiClient';

export interface Doctor {
  '@id'?: string;
  id?: string;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  speciality: string;
  licenseNumber: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

class DoctorService {
  private endpoint = '/doctors';

  async getAllDoctors(page = 1, itemsPerPage = 30, filters?: Record<string, any>) {
    try {
      const response = await apiClient.getCollection<Doctor>(this.endpoint, page, itemsPerPage, filters);
      // Ensure we're returning the data in the expected format
      return {
        items: response.items, // This should contain the array of pharmacists from 'hydra:member'
        totalItems: response.totalItems,
        itemsPerPage,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
      };
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  }

  async createDoctor(doctor: Omit<Doctor, '@id' | 'id'>) {
    return apiClient.post<Doctor>(this.endpoint, doctor);
  }

  async updateDoctor(id: string, doctor: Partial<Doctor>) {
    return apiClient.put<Doctor>(`${this.endpoint}/${id}`, doctor);
  }

  async deleteDoctor(id: string) {
    return apiClient.delete(`${this.endpoint}/${id}`);
  }
}

export default new DoctorService();
