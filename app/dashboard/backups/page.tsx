'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Archive,
  RotateCcw,
  Loader2,
  Trash2,
  Clock,
  User,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api, BackupUser } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function BackupsPage() {
  const [backups, setBackups] = useState<BackupUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const response = await api.backup.list();
      if (response.success && response.backups) {
        setBackups(response.backups);
      }
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os backups.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleRestore = async (userId: string) => {
    setRestoringId(userId);
    try {
      const response = await api.backup.restore(userId);
      if (response.success) {
        toast({
          title: 'Usuário restaurado!',
          description: 'O usuário foi restaurado com sucesso.',
        });
        loadBackups();
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível restaurar o usuário.',
        variant: 'destructive',
      });
    }
    setRestoringId(null);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const getUserName = (backup: BackupUser) => {
    if (backup.data.customNameEnabled && backup.data.customName) {
      return backup.data.customName;
    }
    return backup.data.pushName || 'Usuário';
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
        <h1 className="text-2xl font-bold text-foreground">Backups</h1>
        <p className="text-muted-foreground">Usuários deletados que podem ser restaurados</p>
      </div>

      {/* Info Card */}
      <Card className="glass border-border/50 border-amber-500/20 bg-amber-500/5">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Backup automático por 30 dias
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Quando um usuário é deletado, seus dados são mantidos por 30 dias.
                Após esse período, os dados são removidos permanentemente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {backups.length === 0 ? (
        <Card className="glass border-border/50">
          <CardContent className="py-12">
            <div className="text-center">
              <Archive className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum backup disponível
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Não há usuários deletados para restaurar no momento.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-primary" />
              Usuários Deletados
              <span className="text-sm font-normal text-muted-foreground">
                ({backups.length})
              </span>
            </CardTitle>
            <CardDescription>
              Clique em restaurar para recuperar os dados do usuário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {backups.map((backup, index) => {
                const daysRemaining = getDaysRemaining(backup.expiresAt);
                const isExpiringSoon = daysRemaining <= 7;
                
                return (
                  <motion.div
                    key={backup.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-secondary/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <Trash2 className="w-5 h-5 text-destructive" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {getUserName(backup)}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {backup.id.replace('@s.whatsapp.net', '')}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Deletado: {formatDate(backup.deletedAt)}</span>
                        </div>
                        <div className={`flex items-center gap-1 ${isExpiringSoon ? 'text-amber-500' : ''}`}>
                          <AlertTriangle className="w-3 h-3" />
                          <span>{daysRemaining} dias restantes</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleRestore(backup.id)}
                        disabled={restoringId === backup.id}
                      >
                        {restoringId === backup.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RotateCcw className="w-4 h-4" />
                        )}
                        Restaurar
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {backups.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Archive className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{backups.length}</p>
                  <p className="text-xs text-muted-foreground">Total de backups</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {backups.filter(b => getDaysRemaining(b.expiresAt) <= 7).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Expirando em breve</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
