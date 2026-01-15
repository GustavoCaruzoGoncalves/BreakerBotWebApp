'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Shield,
  Loader2,
  Globe,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api, MentionsData, AdminData } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const [mentions, setMentions] = useState<MentionsData | null>(null);
  const [admins, setAdmins] = useState<AdminData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [mentionsRes, adminsRes] = await Promise.all([
        api.mentions.get(),
        api.admins.list(),
      ]);

      if (mentionsRes.success) setMentions(mentionsRes.mentions || {});
      if (adminsRes.success) setAdmins(adminsRes.admins || []);
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleToggleGlobalMentions = async () => {
    if (!mentions) return;

    setIsSaving(true);
    try {
      const newValue = !mentions.globalEnabled;
      await api.mentions.update({ ...mentions, globalEnabled: newValue });
      setMentions({ ...mentions, globalEnabled: newValue });
      toast({
        title: newValue ? 'Menções ativadas' : 'Menções desativadas',
        description: newValue 
          ? 'As menções globais foram ativadas.' 
          : 'As menções globais foram desativadas.',
      });
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as configurações.',
        variant: 'destructive',
      });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Configurações gerais do sistema (somente administradores)</p>
      </div>

      <div className="grid gap-6">
        {/* Global Mentions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Menções Globais
              </CardTitle>
              <CardDescription>
                Controla se o sistema de menções está ativo para todos os usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Sistema de menções</p>
                  <p className="text-xs text-muted-foreground">
                    Quando ativo, permite que usuários sejam mencionados no ranking
                  </p>
                </div>
                <Switch
                  checked={mentions?.globalEnabled ?? false}
                  onCheckedChange={handleToggleGlobalMentions}
                  disabled={isSaving}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Admins List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Administradores
              </CardTitle>
              <CardDescription>
                Usuários com permissões administrativas no bot
              </CardDescription>
            </CardHeader>
            <CardContent>
              {admins.length > 0 ? (
                <div className="space-y-2">
                  {admins.map((admin, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground font-mono">
                          +{admin.number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Administrador
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Shield className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum administrador configurado
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Configure a variável ADMINS no arquivo .env
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* API Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Status do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Sistema Online
                  </p>
                  <p className="text-xs text-muted-foreground">
                    API e Bot funcionando normalmente
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
