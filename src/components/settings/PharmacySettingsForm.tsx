
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";

interface PharmacySettings {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export const PharmacySettingsForm = () => {
  const [settings, setSettings] = useState<PharmacySettings>({
    name: "Pharmacie Centrale",
    address: "123 Rue Principale",
    phone: "+33 1 23 45 67 89",
    email: "contact@pharmacie.fr"
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const updatedSettings = {
      name: formData.get("pharmacy-name") as string,
      address: formData.get("address") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string
    };
    
    setSettings(updatedSettings);
    toast.success("Paramètres sauvegardés avec succès");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="pharmacy-name">Nom de la pharmacie</Label>
        <Input 
          id="pharmacy-name" 
          name="pharmacy-name"
          defaultValue={settings.name}
          placeholder="Votre Pharmacie" 
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="address">Adresse</Label>
        <Input 
          id="address" 
          name="address"
          defaultValue={settings.address}
          placeholder="123 Rue Principale" 
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input 
          id="phone" 
          name="phone"
          defaultValue={settings.phone}
          placeholder="+33 1 23 45 67 89" 
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          name="email"
          type="email" 
          defaultValue={settings.email}
          placeholder="contact@pharmacie.fr" 
        />
      </div>
      <Button type="submit">Sauvegarder les modifications</Button>
    </form>
  );
};
