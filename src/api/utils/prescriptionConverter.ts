
import { ApiPrescription, Prescription } from '../types/prescription';

// Utility function to convert API data to UI format
export const convertApiToUiFormat = (apiPrescription: ApiPrescription): Prescription => {
  console.log('🔄 Converting API prescription:', apiPrescription);
  
  const converted = {
    id: `RX-${apiPrescription.id.toString().padStart(4, '0')}`,
    '@id': `/prescriptions/RX-${apiPrescription.id}`,
    patient: `${apiPrescription.patient.firstName} ${apiPrescription.patient.lastName}`,
    patientId: apiPrescription.patient.id.toString(),
    items: apiPrescription.items.map(item => ({
      medication: `${item.medication.name} ${item.medication.dosage}`,
      medicationId: item.medication.id.toString(),
      dosage: item.posology, // Using posology from API
      quantity: item.quantity,
      instructions: item.instructions
    })),
    doctor: `Dr. ${apiPrescription.doctor.firstName} ${apiPrescription.doctor.lastName}`,
    date: apiPrescription.issuedDate.split('T')[0],
    status: 'En attente' as const,
    notes: apiPrescription.notes,
    createdAt: apiPrescription.issuedDate,
    updatedAt: apiPrescription.issuedDate
  };
  
  console.log('✅ Converted prescription:', converted);
  return converted;
};

// Convert UI format to API format for creation/updates
export const convertUiToApiFormat = (prescription: Omit<Prescription, '@id' | 'id'>) => {
  console.log('🔄 Converting UI prescription to API format:', prescription);
  
  const apiData = {
    patient: prescription.patientId,
    doctor: prescription.doctor,
    items: prescription.items.map(item => ({
      medication: item.medicationId,
      posology: item.dosage, // Using posology for API
      quantity: item.quantity,
      instructions: item.instructions || ''
    })),
    notes: prescription.notes || '',
    issuedDate: new Date().toISOString()
  };
  
  console.log('✅ Converted to API format:', apiData);
  return apiData;
};
