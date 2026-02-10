import apiClient from '../apiClient';

// ===== Types =====

export interface InsuranceCompany {
  '@id'?: string;
  id?: string;
  name: string;
  code: string;
  phone: string;
  email: string;
  address: string;
  status: 'Actif' | 'Inactif';
  conventionDate: string;
  conditions: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InsurancePlanRate {
  medicamentsRemboursables: number;
  medicamentsGeneriques: number;
  medicamentsSpecialite: number;
  parapharmacie: number;
  materielMedical: number;
}

export interface InsurancePlan {
  '@id'?: string;
  id?: string;
  companyId: string;
  companyName?: string;
  name: string;
  rates: InsurancePlanRate;
  plafondAnnuel: number;
  franchiseAnnuelle: number;
  coPaiementMinimum: number;
  produitsExclus: string;
  status: 'Actif' | 'Inactif';
  createdAt?: string;
  updatedAt?: string;
}

// ===== Service =====

class InsuranceService {
  private companiesEndpoint = '/insurance-companies';
  private plansEndpoint = '/insurance-plans';

  // --- Mock data ---
  private mockCompanies: InsuranceCompany[] = [
    {
      id: 'IC-001',
      name: 'CPAM',
      code: 'CPAM-001',
      phone: '01 23 45 67 89',
      email: 'contact@cpam.fr',
      address: '12 Rue de la Santé, 75014 Paris',
      status: 'Actif',
      conventionDate: '2024-01-01',
      conditions: 'Convention nationale avec taux standard',
      createdAt: '2024-01-01T00:00:00',
    },
    {
      id: 'IC-002',
      name: 'MGEN',
      code: 'MGEN-001',
      phone: '01 98 76 54 32',
      email: 'contact@mgen.fr',
      address: '3 Square Max Hymans, 75015 Paris',
      status: 'Actif',
      conventionDate: '2024-03-15',
      conditions: 'Mutuelle complémentaire enseignement',
      createdAt: '2024-03-15T00:00:00',
    },
    {
      id: 'IC-003',
      name: 'AXA Santé',
      code: 'AXA-001',
      phone: '01 45 67 89 01',
      email: 'sante@axa.fr',
      address: '25 Avenue Matignon, 75008 Paris',
      status: 'Inactif',
      conventionDate: '2023-06-01',
      conditions: 'Convention expirée - en renouvellement',
      createdAt: '2023-06-01T00:00:00',
    },
  ];

  private mockPlans: InsurancePlan[] = [
    {
      id: 'IP-001',
      companyId: 'IC-001',
      companyName: 'CPAM',
      name: 'Plan Base',
      rates: { medicamentsRemboursables: 70, medicamentsGeneriques: 80, medicamentsSpecialite: 50, parapharmacie: 0, materielMedical: 60 },
      plafondAnnuel: 5000,
      franchiseAnnuelle: 50,
      coPaiementMinimum: 1,
      produitsExclus: 'Homéopathie, Compléments alimentaires',
      status: 'Actif',
    },
    {
      id: 'IP-002',
      companyId: 'IC-001',
      companyName: 'CPAM',
      name: 'Plan ALD',
      rates: { medicamentsRemboursables: 100, medicamentsGeneriques: 100, medicamentsSpecialite: 100, parapharmacie: 0, materielMedical: 100 },
      plafondAnnuel: 0,
      franchiseAnnuelle: 0,
      coPaiementMinimum: 0,
      produitsExclus: '',
      status: 'Actif',
    },
    {
      id: 'IP-003',
      companyId: 'IC-002',
      companyName: 'MGEN',
      name: 'Plan Bronze',
      rates: { medicamentsRemboursables: 60, medicamentsGeneriques: 70, medicamentsSpecialite: 40, parapharmacie: 10, materielMedical: 50 },
      plafondAnnuel: 3000,
      franchiseAnnuelle: 100,
      coPaiementMinimum: 2,
      produitsExclus: 'Cosmétiques, Compléments alimentaires',
      status: 'Actif',
    },
    {
      id: 'IP-004',
      companyId: 'IC-002',
      companyName: 'MGEN',
      name: 'Plan Or',
      rates: { medicamentsRemboursables: 90, medicamentsGeneriques: 100, medicamentsSpecialite: 80, parapharmacie: 50, materielMedical: 90 },
      plafondAnnuel: 15000,
      franchiseAnnuelle: 0,
      coPaiementMinimum: 0.5,
      produitsExclus: '',
      status: 'Actif',
    },
  ];

  // ===== Companies =====

  async getAllCompanies(page = 1, itemsPerPage = 30) {
    try {
      return await apiClient.getCollection<InsuranceCompany>(this.companiesEndpoint, page, itemsPerPage);
    } catch {
      return {
        items: this.mockCompanies,
        totalItems: this.mockCompanies.length,
        itemsPerPage,
        totalPages: 1,
        currentPage: page,
      };
    }
  }

  async createCompany(company: Omit<InsuranceCompany, '@id' | 'id'>) {
    try {
      return await apiClient.post<InsuranceCompany>(this.companiesEndpoint, company);
    } catch {
      const newCompany: InsuranceCompany = {
        ...company,
        id: `IC-${Math.floor(100 + Math.random() * 900)}`,
        createdAt: new Date().toISOString(),
      };
      this.mockCompanies.push(newCompany);
      return newCompany;
    }
  }

  async updateCompany(id: string, data: Partial<InsuranceCompany>) {
    try {
      return await apiClient.patch<InsuranceCompany>(`${this.companiesEndpoint}/${id}`, data);
    } catch {
      const idx = this.mockCompanies.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Company not found');
      this.mockCompanies[idx] = { ...this.mockCompanies[idx], ...data, updatedAt: new Date().toISOString() };
      return this.mockCompanies[idx];
    }
  }

  async deleteCompany(id: string) {
    try {
      await apiClient.delete(`${this.companiesEndpoint}/${id}`);
    } catch {
      const idx = this.mockCompanies.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Company not found');
      this.mockCompanies.splice(idx, 1);
    }
    return true;
  }

  // ===== Plans =====

  async getAllPlans(page = 1, itemsPerPage = 30, companyId?: string) {
    try {
      const filters = companyId ? { companyId } : undefined;
      return await apiClient.getCollection<InsurancePlan>(this.plansEndpoint, page, itemsPerPage, filters);
    } catch {
      const filtered = companyId
        ? this.mockPlans.filter(p => p.companyId === companyId)
        : this.mockPlans;
      return {
        items: filtered,
        totalItems: filtered.length,
        itemsPerPage,
        totalPages: 1,
        currentPage: page,
      };
    }
  }

  async createPlan(plan: Omit<InsurancePlan, '@id' | 'id'>) {
    try {
      return await apiClient.post<InsurancePlan>(this.plansEndpoint, plan);
    } catch {
      const company = this.mockCompanies.find(c => c.id === plan.companyId);
      const newPlan: InsurancePlan = {
        ...plan,
        id: `IP-${Math.floor(100 + Math.random() * 900)}`,
        companyName: company?.name || '',
        createdAt: new Date().toISOString(),
      };
      this.mockPlans.push(newPlan);
      return newPlan;
    }
  }

  async updatePlan(id: string, data: Partial<InsurancePlan>) {
    try {
      return await apiClient.patch<InsurancePlan>(`${this.plansEndpoint}/${id}`, data);
    } catch {
      const idx = this.mockPlans.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Plan not found');
      this.mockPlans[idx] = { ...this.mockPlans[idx], ...data, updatedAt: new Date().toISOString() };
      return this.mockPlans[idx];
    }
  }

  async deletePlan(id: string) {
    try {
      await apiClient.delete(`${this.plansEndpoint}/${id}`);
    } catch {
      const idx = this.mockPlans.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Plan not found');
      this.mockPlans.splice(idx, 1);
    }
    return true;
  }
}

export default new InsuranceService();
