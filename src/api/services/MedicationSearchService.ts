import { apiClient } from '@/api/apiClient';
import { API_CONFIG } from '@/api/config';

export interface ApiMedicationResult {
  cis: string;
  denomination: string;
  forme_pharma: string;
  voies_admin: string;
  statut_amm: string;
  commercialisation: string;
  titulaire: string;
  type: string;
}

export interface MedicationSearchResult {
  id: string | null;
  codeCis: string;
  name: string;
  category: string;
  dosage: string;
  stock: number;
  price: number;
  supplier: string;
  status: string;
  distribution: string;
  description: string;
  expirationDate?: string;
}

export class MedicationSearchService {
  private mapApiResultToMedication(apiResult: ApiMedicationResult): MedicationSearchResult {
    // Extraire le dosage de la dénomination (ex: "ASPIRINE ARROW 100 mg" -> "100 mg")
     const dosageMatch = apiResult.denomination.match(/(\d+\s*mg)/i);
     const dosage = dosageMatch ? dosageMatch[1] : apiResult.forme_pharma;
     console.log('Mapped dosage:', apiResult);
    return {
      id: null,
      codeCis: apiResult.cis,
      name: apiResult.denomination,
      description: apiResult.denomination,
      category: apiResult.forme_pharma,
      dosage: dosage,
      stock: 0,
      price: 0,
      supplier: apiResult.titulaire,
      status: apiResult.statut_amm,
      distribution: apiResult.commercialisation,
    };
  }

  async searchMedications(query: string): Promise<MedicationSearchResult[]> {
    if (!query.trim()) return [];
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/drugs/search?name=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiResponse = await response.json();

      // L'API retourne { data: [...], pagination: {...}, metadata: {...} }
      const medications = apiResponse.data || [];

      return medications.map((med: ApiMedicationResult) => this.mapApiResultToMedication(med));
    } catch (error) {
      console.error('Erreur lors de la recherche de médicaments:', error);
      return [];
    }
  }
}

export default new MedicationSearchService();