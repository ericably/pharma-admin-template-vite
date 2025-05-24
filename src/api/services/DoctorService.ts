
import apiClient from '../apiClient';

export interface Doctor {
  '@id'?: string;
  id?: number;
  name: string;
  email: string;
  phone: string;
  speciality: string;
  licenseNumber: string;
  status: 'Actif' | 'Inactif';
  createdAt?: string;
  updatedAt?: string;
}

class DoctorService {
  private endpoint = '/doctors';

  async getAllDoctors(page = 1, itemsPerPage = 30) {
    // Pour le moment, retournons des données de test
    const mockDoctors: Doctor[] = [
      {
        id: 1,
        name: "Dr. Jean Dubois",
        email: "jean.dubois@clinique.com",
        phone: "01 23 45 67 89",
        speciality: "Généraliste",
        licenseNumber: "MD123456",
        status: "Actif"
      },
      {
        id: 2,
        name: "Dr. Sophie Lefebvre",
        email: "sophie.lefebvre@hopital.com",
        phone: "01 98 76 54 32",
        speciality: "Cardiologue",
        licenseNumber: "MD789012",
        status: "Actif"
      }
    ];
    
    return Promise.resolve({
      items: mockDoctors,
      totalItems: mockDoctors.length,
      itemsPerPage,
      totalPages: 1,
      currentPage: page
    });
  }

  async createDoctor(doctor: Omit<Doctor, '@id' | 'id'>) {
    const mockResponse = {
      ...doctor,
      id: Math.floor(1000 + Math.random() * 9000),
      '@id': `/doctors/${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return Promise.resolve(mockResponse);
  }
}

export default new DoctorService();
