
import { ApiPrescription, Prescription } from '../types/prescription';

// Utility function to convert API data to UI format
export const convertApiToUiFormat = (apiPrescription: any): Prescription => {
  const converted = {
    id: apiPrescription.id.toString(),
    '@id': apiPrescription['@id'],
    patient: `${apiPrescription.patient.firstName} ${apiPrescription.patient.lastName}`,
    patientId: apiPrescription.patient.id.toString(),
    items: apiPrescription.items.map((item: any) => ({
      id: item.id, // Add item ID
      medication: `${item.medication.name} ${item.medication.dosage}`,
      medicationId: item.medication.id.toString(),
      dosage: item.posology,
      quantity: item.quantity,
      instructions: item.instructions || ''
    })),
    doctor: `Dr. ${apiPrescription.doctor.firstName} ${apiPrescription.doctor.lastName}`,
    date: apiPrescription.issuedDate.split('T')[0],
    status: 'En attente' as const,
    notes: apiPrescription.notes || '',
    createdAt: apiPrescription.issuedDate,
    updatedAt: apiPrescription.issuedDate
  };
  
  return converted;
};

// Convert UI format to API format for creation/updates
export const convertUiToApiFormat = (prescription: Omit<Prescription, '@id' | 'id'>) => {
  const apiData = {
    patient: prescription.patientId,
    doctor: prescription.doctor,
    items: prescription.items.map(item => ({
      ...(item.id && { id: item.id }), // Include ID if it exists (for updates)
      medication: item.medicationId,
      posology: item.dosage,
      quantity: item.quantity,
      instructions: item.instructions || ''
    })),
    notes: prescription.notes || '',
    issuedDate: new Date().toISOString()
  };
  
  return apiData;
};
