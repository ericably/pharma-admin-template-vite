import { Patient } from "@/api/services/PatientService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle 
} from "@/components/ui/drawer";
import { Shield, User, Mail, Phone, Calendar, MapPin, FileText } from "lucide-react";

interface PatientDetailsDrawerProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onCreatePrescription: (patient: Patient) => void;
}

export function PatientDetailsDrawer({ 
  patient, 
  isOpen, 
  onClose, 
  onCreatePrescription 
}: PatientDetailsDrawerProps) {
  if (!patient) return null;

  const getStatusBadge = (status: string) => {
    return status === "Actif" ? 
      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Actif</Badge> :
      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Inactif</Badge>;
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Détails du Patient - {patient.name}
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="p-6 overflow-y-auto">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Informations Personnelles */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Informations Personnelles
              </h3>
              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nom complet</label>
                    <p className="text-base font-semibold">{patient.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-base">{patient.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Téléphone</label>
                    <p className="text-base">{patient.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date de naissance</label>
                    <p className="text-base">{patient.dob}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Adresse</label>
                    <p className="text-base">{patient.address || 'Non renseignée'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations Médicales */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Informations Médicales
              </h3>
              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <div>
                    <label className="text-sm font-medium text-blue-600">Assurance</label>
                    <p className="text-base font-semibold">{patient.insurance || 'Aucune assurance'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <div className={`w-2 h-2 rounded-full ${patient.status === 'Actif' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-green-600">Statut</label>
                    <div className="mt-1">{getStatusBadge(patient.status)}</div>
                  </div>
                </div>

                {/* Historique placeholder */}
                <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Historique des Ordonnances
                  </h4>
                  <p className="text-sm text-gray-500">Aucune ordonnance récente</p>
                </div>

                {/* Actions */}
                <div className="mt-6 space-y-2">
                  <Button 
                    onClick={() => onCreatePrescription(patient)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    size="lg"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Créer une Ordonnance
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={onClose}
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}