
import apiClient from '../apiClient';

// Types basés sur votre structure API
export interface ApiMedication {
  id: number;
  name: string;
  description: string;
  dosage: string;
  price: number;
  expirationDate: string;
}

export interface ApiPatient {
  id: number;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  address: string;
  insurance: string;
  status: string;
  prescriptions: string[];
}

export interface ApiDoctor {
  id: number;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  speciality: string;
  status: boolean;
  prescriptions: any[];
}

export interface ApiPrescriptionItem {
  id: number;
  prescription: string;
  medication: ApiMedication;
  posology: string;
  quantity: number;
  instructions: string;
}

export interface ApiPrescription {
  id: number;
  issuedDate: string;
  patient: ApiPatient;
  items: ApiPrescriptionItem[];
  doctor: ApiDoctor;
  notes: string;
}

// Types adaptés pour l'interface utilisateur (compatibilité avec le code existant)
export interface PrescriptionItem {
  medication: string;
  medicationId: string;
  dosage: string;
  quantity: number;
  instructions?: string;
}

export interface Prescription {
  '@id'?: string;
  id?: string;
  patient: string;
  patientId: string;
  items: PrescriptionItem[];
  doctor: string;
  date: string;
  status: 'En attente' | 'Préparé' | 'Prêt pour retrait' | 'Livré';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

class PrescriptionService {
  private endpoint = '/api/prescriptions';

  // Fonction utilitaire pour convertir les données API vers le format UI
  private convertApiToUiFormat(apiPrescription: ApiPrescription): Prescription {
    return {
      id: `RX-${apiPrescription.id.toString().padStart(4, '0')}`,
      '@id': `/prescriptions/RX-${apiPrescription.id}`,
      patient: `${apiPrescription.patient.firstName} ${apiPrescription.patient.lastName}`,
      patientId: apiPrescription.patient.id.toString(),
      items: apiPrescription.items.map(item => ({
        medication: `${item.medication.name} ${item.medication.dosage}`,
        medicationId: item.medication.id.toString(),
        dosage: item.posology,
        quantity: item.quantity,
        instructions: item.instructions
      })),
      doctor: `Dr. ${apiPrescription.doctor.firstName} ${apiPrescription.doctor.lastName}`,
      date: apiPrescription.issuedDate.split('T')[0],
      status: 'En attente' as const, // Par défaut, vous pouvez adapter selon votre logique
      notes: apiPrescription.notes,
      createdAt: apiPrescription.issuedDate,
      updatedAt: apiPrescription.issuedDate
    };
  }

  // Get all prescriptions with pagination
  async getAllPrescriptions(page = 1, itemsPerPage = 30, filters?: Record<string, any>) {
    console.log('Fetching prescriptions from API...');
    
    const response = await apiClient.get<ApiPrescription[]>(this.endpoint);
    console.log('API Response:', response);
    
    // Conversion des données API vers le format UI
    const convertedPrescriptions = response.map(this.convertApiToUiFormat);
    
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
    return this.convertApiToUiFormat(response);
  }

  // Create a new prescription
  async createPrescription(prescription: Omit<Prescription, '@id' | 'id'>) {
    console.log('Création d\'ordonnance:', prescription);
    
    // Conversion du format UI vers le format API
    const apiData = {
      patient: prescription.patientId,
      doctor: prescription.doctor,
      items: prescription.items.map(item => ({
        medication: item.medicationId,
        posology: item.dosage,
        quantity: item.quantity,
        instructions: item.instructions || ''
      })),
      notes: prescription.notes || '',
      issuedDate: new Date().toISOString()
    };
    
    const response = await apiClient.post<ApiPrescription>(this.endpoint, apiData);
    return this.convertApiToUiFormat(response);
  }

  // Update an existing prescription
  async updatePrescription(id: string, prescription: Partial<Prescription>) {
    console.log('Mise à jour d\'ordonnance:', id, prescription);
    
    const response = await apiClient.patch<ApiPrescription>(`${this.endpoint}/${id}`, prescription);
    return this.convertApiToUiFormat(response);
  }

  // Delete a prescription
  async deletePrescription(id: string) {
    console.log('Suppression d\'ordonnance:', id);
    return await apiClient.delete(`${this.endpoint}/${id}`);
  }

  // Get prescriptions by patient
  async getPrescriptionsByPatient(patientId: string) {
    const response = await apiClient.get<ApiPrescription[]>(`${this.endpoint}?patient=${patientId}`);
    return response.map(this.convertApiToUiFormat);
  }

  // Get prescriptions by status
  async getPrescriptionsByStatus(status: string) {
    const response = await apiClient.get<ApiPrescription[]>(`${this.endpoint}?status=${status}`);
    return response.map(this.convertApiToUiFormat);
  }
  
  // Update prescription status
  async updatePrescriptionStatus(id: string, status: Prescription['status']) {
    console.log('Mise à jour du statut d\'ordonnance:', id, status);
    
    const response = await apiClient.patch<ApiPrescription>(`${this.endpoint}/${id}`, { status });
    return this.convertApiToUiFormat(response);
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
      dosage: item.dosage,
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
