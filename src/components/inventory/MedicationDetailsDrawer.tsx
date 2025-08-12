import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Search, Pill, Calendar, Building2, Syringe, FileText } from 'lucide-react';
import MedicationDetailsService, { MedicationApiDetails } from '@/api/services/MedicationDetailsService';
import MedicationSearchService from '@/api/services/MedicationSearchService';
import MedicationService, { Medication } from '@/api/services/MedicationService';
import { useToast } from '@/hooks/use-toast';

interface MedicationDetailsDrawerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  medication: Medication | null;
  onUpdated?: () => void;
}

export default function MedicationDetailsDrawer({ open, onOpenChange, medication, onUpdated }: MedicationDetailsDrawerProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [details, setDetails] = useState<MedicationApiDetails | null>(null);
  const [saving, setSaving] = useState(false);

  // Editable fields for local medication
  const [price, setPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [expirationDate, setExpirationDate] = useState<string>('');

  useEffect(() => {
    if (!open) return;
    setQuery(medication?.name || '');
    setPrice(medication?.price ?? '');
    setStock(medication?.stock ?? '');
    setExpirationDate(medication?.expirationDate || '');

    // Prefetch details by name when opening
    const load = async () => {
      try {
        const d = await MedicationDetailsService.findFirstByName(medication?.name || '');
        setDetails(d);
      } catch (e) {
        setDetails(null);
      }
    };
    load();
  }, [open, medication?.name]);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (!text || text.length < 2) {
      setSearchResults([]);
      return;
    }
    setLoadingSearch(true);
    try {
      const res = await MedicationSearchService.searchMedications(text);
      setSearchResults(res);
    } catch (e) {
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handlePick = async (item: any) => {
    setQuery(item.name);
    setSearchResults([]);
    try {
      const d = await MedicationDetailsService.getByCis(item.id);
      setDetails(d);
    } catch (e) {
      toast({ title: 'Erreur', description: "Impossible de charger les détails", variant: 'destructive' });
    }
  };

  const onSave = async () => {
    if (!medication?.id) return;
    setSaving(true);
    try {
      await MedicationService.updateMedication(medication.id, {
        price: price === '' ? medication.price : Number(price),
        stock: stock === '' ? medication.stock : Number(stock),
        expirationDate: expirationDate || undefined,
      });
      toast({ title: 'Enregistré', description: 'Produit mis à jour.' });
      onUpdated?.();
      onOpenChange(false);
    } catch (e) {
      toast({ title: 'Erreur', description: "Échec de l'enregistrement", variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const header = (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      <div className="p-3">
        <DialogHeader className="p-0">
          <DialogTitle className="text-base">Détails du produit</DialogTitle>
        </DialogHeader>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit (API)"
            className="pl-8"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div className="absolute mt-1 w-full max-h-56 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md z-[1000]">
              {searchResults.map((it) => (
                <button
                  key={it.id}
                  className="w-full text-left px-3 py-2 hover:bg-muted/50 text-sm"
                  onClick={() => handlePick(it)}
                >
                  <div className="font-medium">{it.name}</div>
                  <div className="text-xs text-muted-foreground">{it.category} {it.dosage ? `- ${it.dosage}` : ''}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        {header}
        <div className="p-4 space-y-4">
          {/* Summary */}
          <div className="rounded-md border p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">{details?.denomination || medication?.name}</h3>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {details?.forme_pharma && (
                    <span className="mr-2 inline-flex items-center gap-1"><Syringe className="h-3 w-3" /> {details.forme_pharma}</span>
                  )}
                  {details?.voies_admin && (
                    <span className="mr-2 inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {details.voies_admin}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline">{details?.commercialisation || medication?.status}</Badge>
                <div className="text-xs text-muted-foreground mt-1">CIS: {details?.cis || '-'}</div>
              </div>
            </div>
          </div>

          {/* Editable local fields */}
          <div className="rounded-md border p-3">
            <h4 className="text-sm font-medium mb-2">Modifier ce produit (local)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="text-xs text-muted-foreground">Prix (€)</label>
                <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Stock</label>
                <Input type="number" value={stock} onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Date de péremption (YYYY-MM-DD)</label>
                <Input placeholder="2025-12-31" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
              </div>
              <div className="sm:col-span-3 flex justify-end items-center gap-2">
                <Button size="sm" className="h-7 w-7 p-0 rounded-full" onClick={onSave} disabled={saving} aria-label="Valider">
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-full" onClick={() => onOpenChange(false)} aria-label="Annuler">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Holder/company and status */}
          <div className="rounded-md border p-3">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Informations AMM</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">Titulaire:</span> {details?.titulaire || '-'}</div>
              <div><span className="text-muted-foreground">Statut AMM:</span> {details?.statut_amm || '-'}</div>
              <div><span className="text-muted-foreground">Type AMM:</span> {details?.type_amm || '-'}</div>
              <div><span className="text-muted-foreground">Date AMM:</span> {details?.date_amm || '-'}</div>
              <div><span className="text-muted-foreground">Surveillance:</span> {details?.surveillance_renforcee || '-'}</div>
            </div>
          </div>

          {/* Presentations */}
          {details?.presentations && details.presentations.length > 0 && (
            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Présentations</h4>
              </div>
              <div className="space-y-2">
                {details.presentations.map((p, idx) => (
                  <div key={idx} className="text-xs border rounded p-2">
                    <div className="font-medium">{p.libelle}</div>
                    <div className="text-muted-foreground mt-1">CIP13: {p.cip13 || '-'} | Prix: {p.prix_medicament || '-'} € | Remboursement: {p.taux_remboursement || '-'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compositions */}
          {details?.compositions && details.compositions.length > 0 && (
            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 mb-2">
                <Syringe className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Compositions</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {details.compositions.map((c, idx) => (
                  <div key={idx} className="text-xs border rounded p-2">
                    <div className="font-medium">{c.denomination_substance} {c.dosage ? `- ${c.dosage}` : ''}</div>
                    <div className="text-muted-foreground">{c.designation_element} • {c.reference_dosage}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Avis SMR */}
          {details?.avis_smr && details.avis_smr.length > 0 && (
            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Avis SMR</h4>
              </div>
              <div className="space-y-2">
                {details.avis_smr.map((a, idx) => (
                  <div key={idx} className="text-xs border rounded p-2">
                    <div className="font-medium">{a.valeur_smr} • {a.date_avis}</div>
                    <div className="text-muted-foreground mt-1" dangerouslySetInnerHTML={{ __html: a.libelle_smr || '' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Avis ASMR */}
          {details?.avis_asmr && details.avis_asmr.length > 0 && (
            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Avis ASMR</h4>
              </div>
              <div className="space-y-2">
                {details.avis_asmr.map((a, idx) => (
                  <div key={idx} className="text-xs border rounded p-2">
                    <div className="font-medium">ASMR {a.valeur_asmr} • {a.date_avis}</div>
                    <div className="text-muted-foreground mt-1">{a.libelle_asmr}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conditions */}
          {details?.conditions && details.conditions.length > 0 && (
            <div className="rounded-md border p-3">
              <h4 className="text-sm font-medium mb-2">Conditions</h4>
              <div className="flex flex-wrap gap-2">
                {details.conditions.map((c, idx) => (
                  <Badge key={idx} variant="secondary">{c.condition}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          {details?.metadata && (
            <div className="text-[11px] text-muted-foreground text-right">Dernière mise à jour: {details.metadata.last_updated} • Source: {details.metadata.source}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
