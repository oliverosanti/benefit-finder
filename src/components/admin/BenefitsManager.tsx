import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";

interface Tier { label: string; value: string; promo_code?: string }

interface Benefit {
  id: string;
  brand_id: string;
  category_id: string | null;
  slug: string | null;
  title: string;
  description: string | null;
  discount_badge: string;
  promo_code: string;
  target_url: string;
  expiry_date: string;
  is_featured: boolean;
  hero_image_url: string | null;
  instructions: string | null;
  terms: string | null;
  brand_about: string | null;
  discount_tiers: Tier[] | null;
  brand?: { name: string };
}

const schema = z.object({
  title: z.string().trim().min(1).max(200),
  discount_badge: z.string().trim().min(1).max(50),
  promo_code: z.string().trim().min(1).max(80),
  target_url: z.string().trim().url("URL inválida").max(500),
  expiry_date: z.string().min(1, "Fecha requerida"),
  brand_id: z.string().uuid("Seleccioná una marca"),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-_]+$/i, "Solo letras, números, - y _"),
});

const empty = {
  brand_id: "", category_id: "none", slug: "", title: "", description: "",
  discount_badge: "", promo_code: "", target_url: "", expiry_date: "",
  is_featured: false, hero_image_url: "", instructions: "", terms: "", brand_about: "",
  discount_tiers: [] as Tier[],
};

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

export const BenefitsManager = () => {
  const [items, setItems] = useState<Benefit[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [cats, setCats] = useState<{ id: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Benefit | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("benefits")
      .select("*, brand:brands(name)")
      .order("created_at", { ascending: false });
    setItems((data as any) ?? []);
  };

  useEffect(() => {
    (async () => {
      const [{ data: bs }, { data: cs }] = await Promise.all([
        supabase.from("brands").select("id,name").order("name"),
        supabase.from("categories").select("id,name").order("sort_order"),
      ]);
      setBrands(bs ?? []); setCats(cs ?? []);
      load();
    })();
  }, []);

  const openNew = () => { setEditing(null); setForm({ ...empty }); setOpen(true); };
  const openEdit = (b: Benefit) => {
    setEditing(b);
    setForm({
      brand_id: b.brand_id,
      category_id: b.category_id ?? "none",
      slug: b.slug ?? "",
      title: b.title,
      description: b.description ?? "",
      discount_badge: b.discount_badge,
      promo_code: b.promo_code,
      target_url: b.target_url,
      expiry_date: b.expiry_date.slice(0, 16),
      is_featured: b.is_featured,
      hero_image_url: b.hero_image_url ?? "",
      instructions: b.instructions ?? "",
      terms: b.terms ?? "",
      brand_about: b.brand_about ?? "",
      discount_tiers: Array.isArray(b.discount_tiers) ? b.discount_tiers : [],
    });
    setOpen(true);
  };

  const addTier = () =>
    setForm({ ...form, discount_tiers: [...form.discount_tiers, { label: "", value: "", promo_code: "" }] });
  const updateTier = (i: number, patch: Partial<Tier>) => {
    const next = [...form.discount_tiers];
    next[i] = { ...next[i], ...patch };
    setForm({ ...form, discount_tiers: next });
  };
  const removeTier = (i: number) =>
    setForm({ ...form, discount_tiers: form.discount_tiers.filter((_, j) => j !== i) });

  const onTitleBlur = () => {
    if (!form.slug && form.title) setForm({ ...form, slug: slugify(form.title) });
  };

  const save = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSaving(true);
    try {
      const payload: any = {
        brand_id: form.brand_id,
        category_id: form.category_id === "none" ? null : form.category_id,
        slug: form.slug,
        title: form.title,
        description: form.description || null,
        discount_badge: form.discount_badge,
        promo_code: form.promo_code,
        target_url: form.target_url,
        expiry_date: new Date(form.expiry_date).toISOString(),
        is_featured: form.is_featured,
        hero_image_url: form.hero_image_url || null,
        instructions: form.instructions || null,
        terms: form.terms || null,
        brand_about: form.brand_about || null,
        discount_tiers: form.discount_tiers.filter((t) => t.label && t.value),
      };
      if (editing) {
        const { error } = await supabase.from("benefits").update(payload).eq("id", editing.id);
        if (error) throw error; toast.success("Beneficio actualizado");
      } else {
        const { error } = await supabase.from("benefits").insert(payload);
        if (error) throw error; toast.success("Beneficio creado");
      }
      setOpen(false); load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar beneficio?")) return;
    const { error } = await supabase.from("benefits").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Eliminado"); load();
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">Beneficios</h2>
          <p className="text-sm text-muted-foreground">{items.length} cupones</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="w-4 h-4 mr-1" />Nuevo beneficio</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Editar beneficio" : "Nuevo beneficio"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Marca</Label>
                  <Select value={form.brand_id} onValueChange={(v) => setForm({ ...form, brand_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar marca" /></SelectTrigger>
                    <SelectContent>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Categoría</Label>
                  <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin categoría</SelectItem>
                      {cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Título</Label><Input value={form.title} onBlur={onTitleBlur} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div>
                <Label>Slug (URL: /c/slug)</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} placeholder="portsaid-15336" />
              </div>
              <div><Label>Descripción corta</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Badge descuento</Label><Input value={form.discount_badge} onChange={(e) => setForm({ ...form, discount_badge: e.target.value })} placeholder="20% OFF" /></div>
                <div><Label>Código promo (default)</Label><Input value={form.promo_code} onChange={(e) => setForm({ ...form, promo_code: e.target.value })} /></div>
              </div>
              <div><Label>URL destino</Label><Input value={form.target_url} onChange={(e) => setForm({ ...form, target_url: e.target.value })} placeholder="https://..." /></div>
              <div><Label>Imagen hero (URL)</Label><Input value={form.hero_image_url} onChange={(e) => setForm({ ...form, hero_image_url: e.target.value })} placeholder="https://..." /></div>
              <div><Label>Fecha expiración</Label><Input type="datetime-local" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} /></div>
              <div><Label>Instrucciones de uso</Label><Textarea rows={4} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="1- Ingresá en…&#10;2- Seleccioná…" /></div>
              <div><Label>Bases y condiciones</Label><Textarea rows={3} value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} /></div>
              <div><Label>Sobre la marca</Label><Textarea rows={3} value={form.brand_about} onChange={(e) => setForm({ ...form, brand_about: e.target.value })} /></div>

              {/* Condiciones / tiers */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
                  <div>
                    <Label>Condiciones del beneficio</Label>
                    <p className="text-xs text-muted-foreground">
                      Cargá una opción por cada tipo de usuario habilitado (ej. Residentes 50%, Vecinos 25%, Invitados 10%). Si solo querés habilitar una condición, agregá una sola fila.
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button type="button" size="sm" variant="outline" onClick={addTier}>
                      <Plus className="w-3.5 h-3.5 mr-1" />Agregar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setForm({
                          ...form,
                          discount_tiers: [
                            { label: "Residentes", value: "", promo_code: "" },
                            { label: "Vecinos", value: "", promo_code: "" },
                            { label: "Invitados", value: "", promo_code: "" },
                          ],
                        })
                      }
                    >
                      Usar preset (Res/Vec/Inv)
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {form.discount_tiers.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      Sin condiciones cargadas — se usará el descuento general del cupón.
                    </p>
                  )}
                  {form.discount_tiers.map((t, i) => (
                    <div key={i} className="grid grid-cols-[1fr_120px_1fr_auto] gap-2 items-center">
                      <Input placeholder="Condición (ej. Residentes)" value={t.label} onChange={(e) => updateTier(i, { label: e.target.value })} />
                      <Input placeholder="50%" value={t.value} onChange={(e) => updateTier(i, { value: e.target.value })} />
                      <Input placeholder="Código (opcional)" value={t.promo_code ?? ""} onChange={(e) => updateTier(i, { promo_code: e.target.value })} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeTier(i)}><X className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} /><Label>Destacado</Label></div>
            </div>
            <DialogFooter><Button onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {items.map((b) => (
          <div key={b.id} className="flex items-center gap-3 p-3 border border-border rounded-xl">
            <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded shrink-0">{b.discount_badge}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{b.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {b.brand?.name} · /c/{b.slug ?? "—"} · Vence {new Date(b.expiry_date).toLocaleDateString()}
                {Array.isArray(b.discount_tiers) && b.discount_tiers.length > 0 && ` · ${b.discount_tiers.length} tiers`}
              </p>
            </div>
            {b.is_featured && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">★ Destacado</span>}
            <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => remove(b.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
