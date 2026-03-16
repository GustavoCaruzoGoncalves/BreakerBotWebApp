'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Loader2,
  Search,
  Pencil,
  Trash2,
  Upload,
  Download,
  Plus,
  X,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api, UserData } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { formatAura } from '@/lib/utils';

interface UserWithAura extends UserData {
  aura?: {
    auraPoints: number;
    character: string | null;
    stickerHash?: string | null;
  };
}

export default function AdminUsuariosPage() {
  const { userId } = useAuth();
  const [users, setUsers] = useState<UserWithAura[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithAura[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<UserWithAura | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserWithAura>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    id: '',
    pushName: '',
    customName: '',
    customNameEnabled: false,
    allowMentions: false,
    xp: 0,
    level: 1,
    prestige: 0,
    auraPoints: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let filtered = [...users];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.pushName?.toLowerCase().includes(s) ||
          u.customName?.toLowerCase().includes(s) ||
          u.id?.toLowerCase().includes(s) ||
          u.jid?.toLowerCase().includes(s)
      );
    }
    setFilteredUsers(filtered);
  }, [users, search]);

  const loadUsers = async () => {
    try {
      const res = await api.users.list();
      if (res.success && res.users) {
        const valid = (res.users as UserWithAura[]).filter(
          (u) => u.id?.includes('@') && !u.id?.includes('@g.us') && u.id !== '__auraGlobal'
        );
        setUsers(valid);
      }
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const getUserName = (u: UserWithAura) => {
    if (u.customNameEnabled && u.customName) return u.customName;
    return u.pushName || u.id?.split('@')[0] || '—';
  };

  const handleEdit = (user: UserWithAura) => {
    setEditingUser(user);
    setEditForm({
      pushName: user.pushName ?? '',
      customName: user.customName ?? '',
      customNameEnabled: user.customNameEnabled ?? false,
      allowMentions: user.allowMentions ?? false,
      xp: user.xp,
      level: user.level,
      prestige: user.prestige,
      aura: user.aura
        ? {
            ...user.aura,
            auraPoints: user.aura.auraPoints ?? 0,
            character: user.aura.character ?? '',
          }
        : { auraPoints: 0, character: null },
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser?.id) return;
    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        pushName: editForm.pushName || null,
        customName: editForm.customName || null,
        customNameEnabled: editForm.customNameEnabled ?? false,
        allowMentions: editForm.allowMentions ?? false,
        xp: Number(editForm.xp) ?? 0,
        level: Number(editForm.level) ?? 1,
        prestige: Number(editForm.prestige) ?? 0,
      };
      if (editForm.aura) {
        payload.aura = {
          ...editingUser.aura,
          auraPoints: Number(editForm.aura?.auraPoints) ?? 0,
          character: editForm.aura?.character || null,
        };
      }
      await api.users.update(editingUser.id, payload as Partial<UserData>);
      toast({ title: 'Salvo!', description: 'Usuário atualizado com sucesso.' });
      setEditingUser(null);
      loadUsers();
    } catch (e) {
      toast({
        title: 'Erro',
        description: e instanceof Error ? e.message : 'Não foi possível salvar.',
        variant: 'destructive',
      });
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário? Será criado um backup por 30 dias.')) return;
    setDeletingId(id);
    try {
      await api.users.delete(id);
      toast({ title: 'Excluído!', description: 'Usuário removido (backup criado).' });
      loadUsers();
    } catch (e) {
      toast({
        title: 'Erro',
        description: e instanceof Error ? e.message : 'Não foi possível excluir.',
        variant: 'destructive',
      });
    }
    setDeletingId(null);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text) as Record<string, unknown>;
      const res = await api.adminUsers.import(data, userId);
      if (res.success) {
        toast({
          title: 'Importação concluída!',
          description: `${res.imported ?? 0} usuários importados.`,
        });
        loadUsers();
      }
    } catch (err) {
      toast({
        title: 'Erro na importação',
        description: err instanceof Error ? err.message : 'JSON inválido.',
        variant: 'destructive',
      });
    }
    setImporting(false);
    e.target.value = '';
  };

  const handleExport = async () => {
    if (!userId) return;
    setExporting(true);
    try {
      const res = await api.adminUsers.export(userId);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erro ao exportar');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Exportado!', description: 'Arquivo JSON baixado com sucesso.' });
    } catch (err) {
      toast({
        title: 'Erro na exportação',
        description: err instanceof Error ? err.message : 'Não foi possível exportar.',
        variant: 'destructive',
      });
    }
    setExporting(false);
  };

  const handleCreate = async () => {
    const rawId = createForm.id.trim();
    if (!rawId) {
      toast({ title: 'ID obrigatório', description: 'Informe o ID do usuário (ex: 5516996242810 ou 5516996242810@s.whatsapp.net)', variant: 'destructive' });
      return;
    }
    const id = rawId.includes('@') ? rawId : `${rawId}@s.whatsapp.net`;
    setIsCreating(true);
    try {
      await api.users.create(id, {
        pushName: createForm.pushName || null,
        customName: createForm.customName || null,
        customNameEnabled: createForm.customNameEnabled,
        allowMentions: createForm.allowMentions,
        xp: createForm.xp,
        level: createForm.level,
        prestige: createForm.prestige,
      });
      if (createForm.auraPoints > 0) {
        await api.users.update(id, { aura: { auraPoints: createForm.auraPoints } } as Partial<UserData>);
      }
      toast({ title: 'Usuário criado!', description: `${id} criado com sucesso.` });
      setShowCreateModal(false);
      setCreateForm({ id: '', pushName: '', customName: '', customNameEnabled: false, allowMentions: false, xp: 0, level: 1, prestige: 0, auraPoints: 0 });
      loadUsers();
    } catch (e) {
      toast({
        title: 'Erro ao criar',
        description: e instanceof Error ? e.message : 'Não foi possível criar o usuário.',
        variant: 'destructive',
      });
    }
    setIsCreating(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center min-h-[400px] items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-7 h-7 text-primary" />
          Gerenciar Usuários
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Listar, editar, excluir e importar usuários (somente administradores)
        </p>
      </div>

      <Card className="glass border-border/50 border-amber-500/20 bg-amber-500/5">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Área administrativa</p>
              <p className="text-xs text-muted-foreground mt-1">
                Importe um JSON no formato do arquivo users. Chaves são user_id (ex: 5516996242810@s.whatsapp.net).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, customName ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={importing || !userId}
        >
          {importing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <span className="ml-2">Importar JSON</span>
        </Button>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={exporting || !userId}
        >
          {exporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span className="ml-2">Exportar JSON</span>
        </Button>
        <Button
          onClick={() => setShowCreateModal(true)}
          disabled={!userId}
        >
          <Plus className="w-4 h-4" />
          <span className="ml-2">Criar usuário</span>
        </Button>
      </div>

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
          <CardDescription>Clique em Editar ou Excluir para gerenciar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium">Nome</th>
                  <th className="text-left py-3 px-2 font-medium">ID</th>
                  <th className="text-right py-3 px-2 font-medium">Nível</th>
                  <th className="text-right py-3 px-2 font-medium">XP</th>
                  <th className="text-right py-3 px-2 font-medium">Aura</th>
                  <th className="text-right py-3 px-2 w-24">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 px-2">
                      <span className="font-medium">{getUserName(u)}</span>
                      {u.customNameEnabled && u.customName && (
                        <span className="text-muted-foreground text-xs ml-1">({u.pushName})</span>
                      )}
                    </td>
                    <td className="py-2 px-2 font-mono text-xs truncate max-w-[140px]" title={u.id}>
                      {u.id}
                    </td>
                    <td className="py-2 px-2 text-right">{u.level}</td>
                    <td className="py-2 px-2 text-right">{u.xp?.toLocaleString?.() ?? u.xp}</td>
                    <td className="py-2 px-2 text-right">
                      {(u as UserWithAura).aura?.auraPoints != null
                        ? formatAura((u as UserWithAura).aura!.auraPoints)
                        : '—'}
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(u)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(u.id!)}
                          disabled={deletingId === u.id}
                        >
                          {deletingId === u.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Criar usuário</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">ID: número ou 5516996242810@s.whatsapp.net</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">ID *</label>
                  <Input
                    placeholder="5516996242810"
                    value={createForm.id}
                    onChange={(e) => setCreateForm((f) => ({ ...f, id: e.target.value }))}
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">pushName</label>
                  <Input
                    value={createForm.pushName}
                    onChange={(e) => setCreateForm((f) => ({ ...f, pushName: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">customName</label>
                  <Input
                    value={createForm.customName}
                    onChange={(e) => setCreateForm((f) => ({ ...f, customName: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
                  <label htmlFor="createCustomNameEnabled" className="text-sm font-medium cursor-pointer">
                    Usar nome customizado
                  </label>
                  <Switch
                    id="createCustomNameEnabled"
                    checked={createForm.customNameEnabled}
                    onCheckedChange={(checked) => setCreateForm((f) => ({ ...f, customNameEnabled: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
                  <label htmlFor="createAllowMentions" className="text-sm font-medium cursor-pointer">
                    Permitir menções
                  </label>
                  <Switch
                    id="createAllowMentions"
                    checked={createForm.allowMentions}
                    onCheckedChange={(checked) => setCreateForm((f) => ({ ...f, allowMentions: checked }))}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-sm font-medium">XP</label>
                    <Input
                      type="number"
                      value={createForm.xp}
                      onChange={(e) => setCreateForm((f) => ({ ...f, xp: parseInt(e.target.value) || 0 }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Nível</label>
                    <Input
                      type="number"
                      value={createForm.level}
                      onChange={(e) => setCreateForm((f) => ({ ...f, level: parseInt(e.target.value) || 1 }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Prestígio</label>
                    <Input
                      type="number"
                      value={createForm.prestige}
                      onChange={(e) => setCreateForm((f) => ({ ...f, prestige: parseInt(e.target.value) || 0 }))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Aura (auraPoints)</label>
                  <Input
                    type="number"
                    value={createForm.auraPoints}
                    onChange={(e) => setCreateForm((f) => ({ ...f, auraPoints: parseInt(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={isCreating || !createForm.id.trim()} className="flex-1">
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Criar
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Editar usuário</h2>
                <Button variant="ghost" size="icon" onClick={() => setEditingUser(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground font-mono mb-4">{editingUser.id}</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">pushName</label>
                  <Input
                    value={editForm.pushName ?? ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, pushName: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">customName</label>
                  <Input
                    value={editForm.customName ?? ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, customName: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
                  <label htmlFor="customNameEnabled" className="text-sm font-medium cursor-pointer">
                    Usar nome customizado
                  </label>
                  <Switch
                    id="customNameEnabled"
                    checked={editForm.customNameEnabled ?? false}
                    onCheckedChange={(checked) =>
                      setEditForm((f) => ({ ...f, customNameEnabled: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
                  <label htmlFor="allowMentions" className="text-sm font-medium cursor-pointer">
                    Permitir menções
                  </label>
                  <Switch
                    id="allowMentions"
                    checked={editForm.allowMentions ?? false}
                    onCheckedChange={(checked) =>
                      setEditForm((f) => ({ ...f, allowMentions: checked }))
                    }
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-sm font-medium">XP</label>
                    <Input
                      type="number"
                      value={editForm.xp ?? 0}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, xp: parseInt(e.target.value) || 0 }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Nível</label>
                    <Input
                      type="number"
                      value={editForm.level ?? 1}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, level: parseInt(e.target.value) || 1 }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Prestígio</label>
                    <Input
                      type="number"
                      value={editForm.prestige ?? 0}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, prestige: parseInt(e.target.value) || 0 }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Aura (auraPoints)</label>
                  <Input
                    type="number"
                    value={editForm.aura?.auraPoints ?? 0}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        aura: {
                          ...f.aura,
                          auraPoints: parseInt(e.target.value) || 0,
                          character: f.aura?.character ?? null,
                        },
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Personagem (aura)</label>
                  <Input
                    value={editForm.aura?.character ?? ''}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        aura: {
                          ...f.aura,
                          auraPoints: f.aura?.auraPoints ?? 0,
                          character: e.target.value || null,
                        },
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setEditingUser(null)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit} disabled={isSaving} className="flex-1">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Salvar
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
