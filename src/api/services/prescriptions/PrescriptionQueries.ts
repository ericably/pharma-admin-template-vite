
import apiClient from '../../apiClient';
import { ApiPrescription } from '../../types/prescription';
import { convertApiToUiFormat } from '../../utils/prescriptionConverter';

export class PrescriptionQueries {
  private endpoint = '/prescriptions';

  // Get prescriptions by patient
  async getPrescriptionsByPatient(patientId: string) {
    const response = await apiClient.get<ApiPrescription[]>(`${this.endpoint}?patient=${patientId}`);
    return response.map(convertApiToUiFormat);
  }

  // Get prescriptions by status
  async getPrescriptionsByStatus(status: string) {
    const response = await apiClient.get<ApiPrescription[]>(`${this.endpoint}?status=${status}`);
    return response.map(convertApiToUiFormat);
  }
}
