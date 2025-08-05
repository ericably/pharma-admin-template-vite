import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Download, Truck, Building, UserCheck, UserX } from "lucide-react";
import { SuppliersList } from "@/components/suppliers/SuppliersList";
import { SupplierForm } from "@/components/suppliers/SupplierForm";
import SupplierService, { Supplier } from "@/api/services/SupplierService";
import { useQuery } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Suppliers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: suppliersData, refetch } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => SupplierService.getAllSuppliers()
  });

  const suppliers = suppliersData?.items || [];

  // Filter suppliers based on search query and filters
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch = 
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && supplier.status) ||
      (statusFilter === "inactive" && !supplier.status);

    const matchesCategory = categoryFilter === "all" || 
      supplier.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get unique categories for filter
  const uniqueCategories = [...new Set(suppliers.map(supplier => supplier.category))];

  const handleAddSupplier = async (supplier: Omit<Supplier, '@id' | 'id'>) => {
    try {
      await SupplierService.createSupplier(supplier);
      toast({
        title: "Succès",
        description: "Fournisseur ajouté avec succès",
      });
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout du fournisseur",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSupplier?.id) return;
    
    try {
      await SupplierService.deleteSupplier(selectedSupplier.id);
      toast({
        title: "Succès",
        description: "Fournisseur supprimé avec succès",
      });
      setIsConfirmDeleteOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du fournisseur",
        variant: "destructive",
      });
    }
  };

  const handleEditSubmit = async (supplierData: Omit<Supplier, '@id' | 'id'>) => {
    if (!selectedSupplier?.id) return;
    
    try {
      await SupplierService.updateSupplier(selectedSupplier.id, supplierData);
      toast({
        title: "Succès",
        description: "Fournisseur modifié avec succès",
      });
      setIsDialogOpen(false);
      setIsEditing(false);
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la modification du fournisseur",
        variant: "destructive",
      });
    }
  };

  const handleOpenDialog = () => {
    setIsEditing(false);
    setSelectedSupplier(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditing(false);
    setSelectedSupplier(null);
  };

  const handleExportPDF = () => {
    // Generate PDF content
    const pdfContent = `
      LISTE DES FOURNISSEURS
      
      Date d'export: ${new Date().toLocaleDateString('fr-FR')}
      Nombre total: ${filteredSuppliers.length}
      
      ${filteredSuppliers.map(supplier => `
        ID: ${supplier.id}
        Nom: ${supplier.name}
        Email: ${supplier.email}
        Téléphone: ${supplier.phone}
        Adresse: ${supplier.address}
        Catégorie: ${supplier.category}
        N° Licence: ${supplier.licenseNumber}
        Statut: ${supplier.status ? 'Actif' : 'Inactif'}
        ----------------------------------------
      `).join('')}
    `;

    // Create and download PDF
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fournisseurs_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Export réussi",
      description: "La liste des fournisseurs a été exportée avec succès",
    });
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
    setSearchQuery("");
  };

  const activeSuppliers = suppliers.filter(s => s.status).length;
  const inactiveSuppliers = suppliers.filter(s => !s.status).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-3 space-y-4 animate-fade-in">
      {/* Header Section with Enhanced Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-orange-700 to-red-800 p-4 text-white shadow-xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Gestion des Fournisseurs</h1>
                  <p className="text-orange-100 text-sm">Gérez vos fournisseurs partenaires</p>
                </div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-orange-100 text-xs">Total Fournisseurs</div>
              <div className="text-2xl font-bold">{suppliers.length}</div>
            </div>
          </div>
        </div>
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-orange-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Cards with Enhanced Design */}
      <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Building className="h-4 w-4" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20 text-xs">Total</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold mb-1">{suppliers.length}</div>
            <p className="text-emerald-100 text-sm">Fournisseurs enregistrés</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <UserCheck className="h-4 w-4" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20 text-xs">Actifs</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold mb-1">{activeSuppliers}</div>
            <p className="text-emerald-100 text-sm">Fournisseurs actifs</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <UserX className="h-4 w-4" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20 text-xs">Inactifs</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold mb-1">{inactiveSuppliers}</div>
            <p className="text-emerald-100 text-sm">Fournisseurs inactifs</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-gray-800">Liste des Fournisseurs</CardTitle>
              <CardDescription className="text-gray-600">Recherchez et gérez vos fournisseurs partenaires</CardDescription>
            </div>
            <Button 
              onClick={handleOpenDialog}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nouveau Fournisseur
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              {/* Barre de recherche */}
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher un fournisseur..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filtres */}
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {uniqueCategories.map((category) => (
                      <SelectItem key={category} value={category.toLowerCase()}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(statusFilter !== "all" || categoryFilter !== "all" || searchQuery) && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Effacer
                  </Button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <Download className="mr-2 h-4 w-4" />
                    Exporter en PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Résultats */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {filteredSuppliers.length} fournisseur(s) trouvé(s)
              {(statusFilter !== "all" || categoryFilter !== "all" || searchQuery) && 
                ` (${suppliers.length} au total)`
              }
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <SuppliersList 
              suppliers={filteredSuppliers}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onUpdate={async (supplier, updates) => {
                try {
                  await SupplierService.updateSupplier(supplier.id, updates);
                  await refetch();
                  toast({
                    title: "Succès",
                    description: "Fournisseur mis à jour avec succès",
                  });
                } catch (error) {
                  toast({
                    title: "Erreur",
                    description: "Erreur lors de la mise à jour du fournisseur",
                    variant: "destructive",
                  });
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      <SupplierForm 
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={isEditing ? handleEditSubmit : handleAddSupplier}
        initialData={isEditing ? selectedSupplier || undefined : undefined}
      />

      <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce fournisseur ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
