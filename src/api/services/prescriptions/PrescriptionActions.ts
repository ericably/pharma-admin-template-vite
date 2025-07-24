
import apiClient from '../../apiClient';
import { ApiPrescription, Prescription } from '../../types/prescription';
import { convertApiToUiFormat } from '../../utils/prescriptionConverter';

export class PrescriptionActions {
  private endpoint = '/api/prescriptions';

  // Update prescription status
  async updatePrescriptionStatus(id: string, status: Prescription['status']) {
    
    
    const response = await apiClient.patch<ApiPrescription>(`${this.endpoint}/${id}`, { status });
    return convertApiToUiFormat(response);
  }

  // Convert prescription to customer order
  async convertToCustomerOrder(prescriptionId: string) {
    
    
    // Get the prescription details
    const response = await apiClient.get<ApiPrescription>(`${this.endpoint}/${prescriptionId}`);
    const prescription = convertApiToUiFormat(response);
    
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
    const { default: CustomerOrderService } = await import('../CustomerOrderService');
    return CustomerOrderService.createCustomerOrder(customerOrder);
  }
}
