
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Users, UserPlus, Filter, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PharmacistsList } from "@/components/pharmacists/PharmacistsList";
import { PharmacistForm } from "@/components/pharmacists/PharmacistForm";
import PharmacistService, { type Pharmacist } from "@/api/services/PharmacistService";
import { useToast } from "@/hooks/use-toast";

export default function Pharmacists() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPharmacist, setEditingPharmacist] = useState<Pharmacist | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pharmacistsResponse, isLoading } = useQuery({
    queryKey: ['pharmacists'],
    queryFn: () => PharmacistService.getAllPharmacists(),
  });

  const pharmacists = pharmacistsResponse?.items || [];

  const filteredPharmacists = pharmacists.filter(pharmacist =>
    pharmacist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pharmacist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pharmacist.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activePharmacists = pharmacists.filter(p => p.status).length;
  const inactivePharmacists = pharmacists.filter(p => !p.status).length;

  const handleAdd = () => {
    setEditingPharmacist(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (pharmacist: Pharmacist) => {
    setEditingPharmacist(pharmacist);
    setIsFormOpen(true);
  };

  const handleDelete = async (pharmacist: Pharmacist) => {
    if (!pharmacist.id) return;

    try {
      await PharmacistService.deletePharmacist(pharmacist.id);
      queryClient.invalidateQueries({ queryKey: ['pharmacists'] });
      toast({
        title: "Succès",
        description: "Pharmacien supprimé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du pharmacien",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (data: Omit<Pharmacist, '@id' | 'id'>) => {
    try {
      if (editingPharmacist && editingPharmacist.id) {
        await PharmacistService.updatePharmacist(editingPharmacist.id, data);
        toast({
          title: "Succès",
          description: "Pharmacien modifié avec succès",
        });
      } else {
        await PharmacistService.createPharmacist(data);
        toast({
          title: "Succès",
          description: "Pharmacien ajouté avec succès",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['pharmacists'] });
      setIsFormOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: editingPharmacist ? "Erreur lors de la modification" : "Erreur lors de l'ajout",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 space-y-8 animate-fade-in">
      {/* Header Section with Enhanced Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Gestion des Pharmaciens</h1>
                  <p className="text-blue-100 text-lg mt-1">Gérez votre équipe de professionnels</p>
                </div>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="text-blue-100 text-sm">Total Pharmaciens</div>
              <div className="text-3xl font-bold">{pharmacists.length}</div>
            </div>
          </div>
        </div>
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Cards with Enhanced Design */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Users className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">Total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{pharmacists.length}</div>
            <p className="text-emerald-100">Pharmaciens enregistrés</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <UserPlus className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">Actifs</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{activePharmacists}</div>
            <p className="text-blue-100">Pharmaciens actifs</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Filter className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">Inactifs</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{inactivePharmacists}</div>
            <p className="text-orange-100">Pharmaciens inactifs</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions Section with Enhanced Styling */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-gray-800">Liste des Pharmaciens</CardTitle>
              <CardDescription className="text-gray-600">Recherchez et gérez vos pharmaciens</CardDescription>
            </div>
            <Button
              onClick={handleAdd}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Ajouter un Pharmacien
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Rechercher par nom, email ou numéro de licence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <PharmacistsList
                pharmacists={filteredPharmacists}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <PharmacistForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingPharmacist}
      />
    </div>
  );
}
