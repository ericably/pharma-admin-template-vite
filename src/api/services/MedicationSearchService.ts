import { apiClient } from '@/api/apiClient';
import { API_CONFIG } from '@/api/config';

export interface MedicationSearchResult {
  id: number;
  name: string;
  category: string;
  dosage: string;
  stock: number;
  price: number;
  supplier: string;
  status: string;
}

export class MedicationSearchService {
  async searchMedications(query: string): Promise<MedicationSearchResult[]> {
    if (!query.trim()) return [];
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/drugs/search?name=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.items || data || [];
    } catch (error) {
      console.error('Erreur lors de la recherche de médicaments:', error);
      return [];
    }
  }
}

export default new MedicationSearchService();