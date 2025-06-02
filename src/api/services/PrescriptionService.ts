
import { PrescriptionCRUD } from './prescriptions/PrescriptionCRUD';
import { PrescriptionQueries } from './prescriptions/PrescriptionQueries';
import { PrescriptionActions } from './prescriptions/PrescriptionActions';

// Re-export types for backward compatibility
export type { 
  Prescription, 
  PrescriptionItem,
  ApiPrescription,
  ApiPrescriptionItem,
  ApiMedication,
  ApiPatient,
  ApiDoctor
} from '../types/prescription';

class PrescriptionService {
  private crud = new PrescriptionCRUD();
  private queries = new PrescriptionQueries();
  private actions = new PrescriptionActions();

  // CRUD operations
  getAllPrescriptions = this.crud.getAllPrescriptions.bind(this.crud);
  getPrescriptionById = this.crud.getPrescriptionById.bind(this.crud);
  createPrescription = this.crud.createPrescription.bind(this.crud);
  updatePrescription = this.crud.updatePrescription.bind(this.crud);
  deletePrescription = this.crud.deletePrescription.bind(this.crud);

  // Query operations
  getPrescriptionsByPatient = this.queries.getPrescriptionsByPatient.bind(this.queries);
  getPrescriptionsByStatus = this.queries.getPrescriptionsByStatus.bind(this.queries);

  // Action operations
  updatePrescriptionStatus = this.actions.updatePrescriptionStatus.bind(this.actions);
  convertToCustomerOrder = this.actions.convertToCustomerOrder.bind(this.actions);
}

export default new PrescriptionService();
