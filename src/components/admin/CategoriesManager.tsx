import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
}

const ICON_OPTIONS = [
  "Tag", "Ticket", "Film", "Gamepad2", "Music", "Dumbbell", "Trophy", "HeartPulse",
  "Sparkles", "Shirt", "Laptop", "Smartphone", "UtensilsCrossed", "Coffee", "Plane",
  "Car", "Home", "Wrench", "GraduationCap", "Baby", "ShoppingBag", "Gift", "Briefcase",
];

const iconFor = (name: string) => {
  const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name] ?? Icons.Tag;
  return <Icon className="h-5 w-5" />;
};

export const CategoriesManager = () => {
  const [items, setItems] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Tag");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from("categories").select("id,name,icon,sort_order").order("sort_order").order("name");
    if (error) return toast.error(error.message);
    setItems(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setName("");
    setIcon("Tag");
    setOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setName(category.name);
    setIcon(category.icon);
    setOpen(true);
  };

  const save = async () => {
    const cleanName = name.trim();
    if (!cleanName) return toast.error("Ingresá un nombre para la categoría");
    setSaving(true);
    const payload = { name: cleanName, icon };
    const { error } = editing
      ? await supabase.from("categories").update(payload).eq("id", editing.id)
      : await supabase.from("categories").insert({ ...payload, sort_order: items.length ? Math.max(...items.map((item) => item.sort_order)) + 1 : 1 });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Categoría actualizada" : "Categoría creada");
    setOpen(false);
    load();
  };

  const move = async (index: number, direction: -1 | 1) => {
    const otherIndex = index + direction;
    if (!items[index] || !items[otherIndex]) return;
    const current = items[index];
    const other = items[otherIndex];
    const [{ error: currentError }, { error: otherError }] = await Promise.all([
      supabase.from("categories").update({ sort_order: other.sort_order }).eq("id", current.id),
      supabase.from("categories").update({ sort_order: current.sort_order }).eq("id", other.id),
    ]);
    if (currentError || otherError) return toast.error(currentError?.message ?? otherError?.message ?? "No se pudo cambiar el orden");
    load();
  };

  const remove = async (category: Category) => {
    if (!confirm(`¿Eliminar la categoría “${category.name}”?`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", category.id);
    if (error) return toast.error("No se puede eliminar mientras tenga beneficios asociados");
    toast.success("Categoría eliminada");
    load();
  };

  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Categorías</h2>
          <p className="text-sm text-muted-foreground">El orden de esta lista define el orden de la portada.</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4" />Nueva categoría</Button>
      </div>

      <div className="divide-y divide-border rounded-md border border-border">
        {items.map((category, index) => (
          <div key={category.id} className="flex items-center gap-3 p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              {iconFor(category.icon)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{category.name}</p>
              <p className="text-xs text-muted-foreground">Posición {index + 1}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => move(index, -1)} disabled={index === 0} title="Subir">
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => move(index, 1)} disabled={index === items.length - 1} title="Bajar">
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => openEdit(category)} title="Editar">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => remove(category)} title="Eliminar">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Editar categoría" : "Nueva categoría"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nombre</Label><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Deportes" /></div>
            <div>
              <Label>Icono</Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((option) => <SelectItem key={option} value={option}><span className="flex items-center gap-2">{iconFor(option)}{option}</span></SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};