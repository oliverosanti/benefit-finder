import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Upload, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { z } from "zod";

interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
}

const schema = z.object({
  name: z.string().trim().min(1, "Nombre requerido").max(100),
  website_url: z.string().trim().url("URL inválida").max(500).or(z.literal("")),
});

export const BrandsManager = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("brands").select("*").order("name");
    setBrands((data as Brand[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const reset = () => {
    setEditing(null); setName(""); setWebsite(""); setLogoFile(null);
  };

  const openNew = () => { reset(); setOpen(true); };
  const openEdit = (b: Brand) => {
    setEditing(b); setName(b.name); setWebsite(b.website_url ?? ""); setLogoFile(null); setOpen(true);
  };

  const save = async () => {
    const parsed = schema.safeParse({ name, website_url: website });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSaving(true);
    try {
      let logo_url = editing?.logo_url ?? null;
      if (logoFile) {
        const ext = logoFile.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("brand-logos").upload(path, logoFile, { upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("brand-logos").getPublicUrl(path);
        logo_url = pub.publicUrl;
      }
      const payload = { name, website_url: website || null, logo_url };
      if (editing) {
        const { error } = await supabase.from("brands").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Marca actualizada");
      } else {
        const { error } = await supabase.from("brands").insert(payload);
        if (error) throw error;
        toast.success("Marca creada");
      }
      setOpen(false); reset(); load();
    } catch (e: any) {
      toast.error(e.message);
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar marca? Sus beneficios también se eliminarán.")) return;
    const { error } = await supabase.from("brands").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Eliminada"); load();
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">Marcas</h2>
          <p className="text-sm text-muted-foreground">{brands.length} marcas</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="w-4 h-4 mr-1" />Nueva marca</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Editar marca" : "Nueva marca"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Nombre</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><Label>Sitio web</Label><Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." /></div>
              <div>
                <Label>Logo</Label>
                <div className="flex items-center gap-3 mt-1">
                  <label className="flex-1 border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Upload className="w-4 h-4" />
                      {logoFile ? logoFile.name : editing?.logo_url ? "Cambiar logo" : "Subir logo"}
                    </div>
                  </label>
                  {editing?.logo_url && !logoFile && (
                    <img src={editing.logo_url} alt="" className="w-14 h-14 object-contain rounded border" />
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {brands.map((b) => (
          <div key={b.id} className="flex items-center gap-3 p-3 border border-border rounded-xl">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
              {b.logo_url ? <img src={b.logo_url} alt={b.name} className="max-w-full max-h-full object-contain" /> : <ImageIcon className="w-5 h-5 text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{b.name}</p>
              <p className="text-xs text-muted-foreground truncate">{b.website_url}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => remove(b.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
