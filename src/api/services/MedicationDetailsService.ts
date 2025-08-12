

export interface MedicationApiDetails {
  cis: string;
  denomination: string;
  forme_pharma: string;
  voies_admin: string;
  statut_amm: string;
  type_amm?: string;
  commercialisation: string;
  date_amm?: string;
  titulaire: string;
  surveillance_renforcee?: string;
  presentations?: Array<{
    cis: string;
    cip7?: string;
    libelle: string;
    statut_admin?: string;
    etat_commercialisation?: string;
    date_declaration?: string;
    cip13?: string;
    agrement_collectivite?: string;
    taux_remboursement?: string;
    prix_medicament?: string;
    prix_honoraires?: string;
    autre?: string;
  }>;
  compositions?: Array<{
    cis: string;
    designation_element?: string;
    code_substance?: string;
    denomination_substance?: string;
    dosage?: string;
    reference_dosage?: string;
    nature_composant?: string;
    numero_ordre?: string;
  }>;
  avis_smr?: Array<{
    cis: string;
    has_dossier?: string;
    motif_evaluation?: string;
    date_avis?: string;
    valeur_smr?: string;
    libelle_smr?: string;
  }>;
  avis_asmr?: Array<{
    cis: string;
    has_dossier?: string;
    motif_evaluation?: string;
    date_avis?: string;
    valeur_asmr?: string;
    libelle_asmr?: string;
  }>;
  conditions?: Array<{
    cis: string;
    condition: string;
  }>;
  metadata?: {
    last_updated?: string;
    source?: string;
  };
}

class MedicationDetailsService {
  // Keep consistent with MedicationSearchService base URL
  private baseUrl = 'http://localhost:3000/api';

  async getByCis(cis: string): Promise<MedicationApiDetails> {
    const res = await fetch(`${this.baseUrl}/medicaments/${encodeURIComponent(cis)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async findFirstByName(name: string): Promise<MedicationApiDetails | null> {
    const res = await fetch(`${this.baseUrl}/medicaments/search?q=${encodeURIComponent(name)}`);
    if (!res.ok) return null;
    const data = await res.json();
    const first = data?.data?.[0];
    if (!first?.cis) return null;
    return this.getByCis(first.cis);
  }
}

export default new MedicationDetailsService();
