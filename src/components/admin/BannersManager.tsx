import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  benefit_id: string | null;
  sort_order: number;
  is_active: boolean;
}

const empty = {
  title: "",
  subtitle: "",
  image_url: "",
  link_url: "",
  benefit_id: "",
  sort_order: 0,
  is_active: true,
};

export const BannersManager = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [benefits, setBenefits] = useState<{ id: string; title: string; slug: string | null }[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);

  const load = async () => {
    const [{ data: bs }, { data: bn }] = await Promise.all([
      supabase.from("banners").select("*").order("sort_order"),
      supabase.from("benefits").select("id,title,slug").order("title"),
    ]);
    setBanners((bs as any) ?? []);
    setBenefits((bn as any) ?? []);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (b: Banner) => {
    setEditing(b);
    setForm({
      title: b.title,
      subtitle: b.subtitle ?? "",
      image_url: b.image_url,
      link_url: b.link_url ?? "",
      benefit_id: b.benefit_id ?? "",
      sort_order: b.sort_order,
      is_active: b.is_active,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.image_url.trim()) {
      toast.error("Título e imagen son obligatorios");
      return;
    }
    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      image_url: form.image_url.trim(),
      link_url: form.link_url.trim() || null,
      benefit_id: form.benefit_id || null,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };
    const { error } = editing
      ? await supabase.from("banners").update(payload).eq("id", editing.id)
      : await supabase.from("banners").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Banner actualizado" : "Banner creado");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar banner?")) return;
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Eliminado");
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Banners del Hero</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="w-4 h-4 mr-1" /> Nuevo banner</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Nuevo"} banner</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Título *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label>Subtítulo</Label>
                <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
              </div>
              <div>
                <Label>URL de imagen *</Label>
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <Label>Cupón vinculado</Label>
                <Select value={form.benefit_id || "none"} onValueChange={(v) => setForm({ ...form, benefit_id: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Ninguno" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno (usar URL externa)</SelectItem>
                    {benefits.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>URL externa (si no hay cupón vinculado)</Label>
                <Input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Orden</Label>
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
                </div>
                <div className="flex items-end gap-2">
                  <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                  <Label>Activo</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {banners.map((b) => (
          <Card key={b.id} className="p-4 flex items-center gap-4">
            <img src={b.image_url} alt={b.title} className="w-24 h-14 object-cover rounded" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{b.title}</div>
              {b.subtitle && <div className="text-sm text-muted-foreground truncate">{b.subtitle}</div>}
              <div className="text-xs text-muted-foreground">Orden: {b.sort_order} · {b.is_active ? "Activo" : "Inactivo"}</div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => openEdit(b)}><Pencil className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => remove(b.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </Card>
        ))}
        {banners.length === 0 && <p className="text-sm text-muted-foreground">Sin banners aún.</p>}
      </div>
    </div>
  );
};
