
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PharmacySettingsForm } from "@/components/settings/PharmacySettingsForm";

export default function Settings() {
  return (
    <div className="space-y-4 p-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Gérez les paramètres de votre pharmacie
        </p>
      </div>

      <div className="grid gap-4">
        <Card className="p-4">
          <h3 className="text-base font-semibold mb-3">Informations de la Pharmacie</h3>
          <PharmacySettingsForm />
        </Card>

        <Card className="p-4">
          <h3 className="text-base font-semibold mb-3">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="stock-alerts">Alertes de stock</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des notifications quand le stock est bas
                </p>
              </div>
              <Switch id="stock-alerts" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="prescription-alerts">Alertes d'ordonnances</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications pour les nouvelles ordonnances
                </p>
              </div>
              <Switch id="prescription-alerts" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-base font-semibold mb-3">Sécurité</h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Mot de passe actuel</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <Button>Mettre à jour le mot de passe</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
