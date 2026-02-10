import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, Building2, FileText, Search, Plus, Users, ShieldCheck, ShieldX } from "lucide-react";
import InsuranceService from "@/api/services/InsuranceService";
import { InsuranceCompaniesTab } from "@/components/insurance/InsuranceCompaniesTab";
import { InsurancePlansTab } from "@/components/insurance/InsurancePlansTab";

export default function Insurance() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("companies");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: companiesData } = useQuery({
    queryKey: ['insurance-companies'],
    queryFn: () => InsuranceService.getAllCompanies(),
  });

  const { data: plansData } = useQuery({
    queryKey: ['insurance-plans'],
    queryFn: () => InsuranceService.getAllPlans(),
  });

  const companies = companiesData?.items || [];
  const plans = plansData?.items || [];

  const activeCompanies = companies.filter(c => c.status === 'Actif').length;
  const inactiveCompanies = companies.filter(c => c.status === 'Inactif').length;
  const totalPlans = plans.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-3 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-700 to-indigo-800 p-4 text-white shadow-xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Gestion des Assurances</h1>
                  <p className="text-purple-100 text-sm">Compagnies, plans et couvertures</p>
                </div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-purple-100 text-xs">Compagnies</div>
              <div className="text-2xl font-bold">{companies.length}</div>
            </div>
          </div>
        </div>
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-1 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Building2 className="h-4 w-4" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20 text-xs">Total</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold mb-1">{companies.length}</div>
            <p className="text-purple-100 text-sm">Compagnies</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20 text-xs">Actives</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold mb-1">{activeCompanies}</div>
            <p className="text-purple-100 text-sm">Compagnies actives</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <ShieldX className="h-4 w-4" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20 text-xs">Inactives</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold mb-1">{inactiveCompanies}</div>
            <p className="text-purple-100 text-sm">Compagnies inactives</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <FileText className="h-4 w-4" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20 text-xs">Plans</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold mb-1">{totalPlans}</div>
            <p className="text-purple-100 text-sm">Plans d'assurance</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl text-gray-800">Assurances & Plans</CardTitle>
              <CardDescription className="text-gray-600">Gérez les compagnies d'assurance et leurs plans de couverture</CardDescription>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="companies" className="gap-2">
                <Building2 className="h-4 w-4" />
                Compagnies
              </TabsTrigger>
              <TabsTrigger value="plans" className="gap-2">
                <FileText className="h-4 w-4" />
                Plans d'assurance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="companies">
              <InsuranceCompaniesTab
                searchQuery={searchQuery}
                onRefresh={() => queryClient.invalidateQueries({ queryKey: ['insurance-companies'] })}
              />
            </TabsContent>

            <TabsContent value="plans">
              <InsurancePlansTab
                searchQuery={searchQuery}
                companies={companies}
                onRefresh={() => queryClient.invalidateQueries({ queryKey: ['insurance-plans'] })}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
