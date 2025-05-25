
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
  private mockDoctors: Doctor[] = [
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

  async getAllDoctors(page = 1, itemsPerPage = 30) {
    return Promise.resolve({
      items: this.mockDoctors,
      totalItems: this.mockDoctors.length,
      itemsPerPage,
      totalPages: 1,
      currentPage: page
    });
  }

  async createDoctor(doctor: Omit<Doctor, '@id' | 'id'>) {
    const newDoctor = {
      ...doctor,
      id: Math.floor(1000 + Math.random() * 9000),
      '@id': `/doctors/${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.mockDoctors.push(newDoctor);
    
    return Promise.resolve(newDoctor);
  }
  
  async updateDoctor(id: number, doctor: Partial<Doctor>) {
    const index = this.mockDoctors.findIndex(d => d.id === id);
    if (index === -1) {
      return Promise.reject(new Error("Doctor not found"));
    }
    
    this.mockDoctors[index] = {
      ...this.mockDoctors[index],
      ...doctor,
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(this.mockDoctors[index]);
  }
  
  async deleteDoctor(id: number) {
    const index = this.mockDoctors.findIndex(d => d.id === id);
    if (index === -1) {
      return Promise.reject(new Error("Doctor not found"));
    }
    
    const deleted = this.mockDoctors.splice(index, 1)[0];
    return Promise.resolve(deleted);
  }
}

export default new DoctorService();
