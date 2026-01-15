'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift,
  Users,
  Loader2,
  PartyPopper,
  UserCheck,
  Search,
  Calendar,
  Heart,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Package,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, AmigoSecretoGroup, ParticipanteDetalhado } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AmigoSecretoPage() {
  const { userId } = useAuth();
  const [groups, setGroups] = useState<AmigoSecretoGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (userId) {
      loadGroups();
    }
  }, [userId]);

  const loadGroups = async () => {
    if (!userId) return;
    
    try {
      const response = await api.amigoSecreto.getByUser(userId);
      if (response.success && response.groups) {
        setGroups(response.groups);
        // Expandir primeiro grupo automaticamente
        if (response.groups.length > 0) {
          setExpandedGroups(new Set([response.groups[0].groupId]));
        }
      }
    } catch {
      setGroups([]);
    }
    setIsLoading(false);
  };

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const filterParticipantes = (participantes: ParticipanteDetalhado[]) => {
    if (!search.trim()) return participantes;
    const searchLower = search.toLowerCase();
    return participantes.filter(p => 
      p.nome.toLowerCase().includes(searchLower) ||
      p.id.toLowerCase().includes(searchLower) ||
      (p.presente && p.presente.toLowerCase().includes(searchLower))
    );
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
        <h1 className="text-2xl font-bold text-foreground">Amigo Secreto</h1>
        <p className="text-muted-foreground">Grupos de amigo secreto que você participa</p>
      </div>

      {groups.length === 0 ? (
        <Card className="glass border-border/50">
          <CardContent className="py-12">
            <div className="text-center">
              <Gift className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum amigo secreto encontrado
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Você não está participando de nenhum grupo de amigo secreto no momento. 
                Use o comando no WhatsApp para criar ou participar de um!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search */}
          <Card className="glass border-border/50">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou presente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardContent>
          </Card>

          {/* Groups */}
          <div className="grid gap-6">
            {groups.map((group, index) => {
              const isExpanded = expandedGroups.has(group.groupId);
              const filteredParticipantes = filterParticipantes(group.participantes);
              const hasSearchResults = search.trim() === '' || filteredParticipantes.length > 0;

              return (
                <motion.div
                  key={group.groupId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass border-border/50 overflow-hidden">
                    {/* Header - Clicável */}
                    <CardHeader 
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => toggleGroup(group.groupId)}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <PartyPopper className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold">{group.groupName}</h3>
                            <div className="flex items-center gap-3 text-sm font-normal text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {group.totalParticipantes} participantes
                              </span>
                              {group.sorteioRealizado && (
                                <span className="flex items-center gap-1 text-primary">
                                  <Sparkles className="w-3 h-3" />
                                  Sorteado
                                </span>
                              )}
                            </div>
                          </div>
                        </CardTitle>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CardContent className="space-y-6 pt-0">
                            {/* Meu Amigo Sorteado */}
                            {group.sorteioRealizado && group.amigoSorteado && (
                              <motion.div
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                className="p-4 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20"
                              >
                                <div className="flex items-center gap-2 mb-3">
                                  <Heart className="w-5 h-5 text-primary" />
                                  <span className="font-semibold text-foreground">Você tirou:</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Gift className="w-6 h-6 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-lg font-bold text-foreground">
                                      {group.amigoSorteado.nome}
                                    </p>
                                    {group.amigoSorteado.presente ? (
                                      <div className="flex items-center gap-2 mt-1">
                                        <Package className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                          Quer ganhar: <span className="text-foreground font-medium">{group.amigoSorteado.presente}</span>
                                        </span>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">
                                        Ainda não cadastrou presente desejado
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {group.sorteioData && (
                                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    Sorteio realizado em {formatDate(group.sorteioData)}
                                  </div>
                                )}
                              </motion.div>
                            )}

                            {/* Meu Presente */}
                            <div className="p-3 rounded-lg bg-secondary/50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <UserCheck className="w-4 h-4 text-primary" />
                                  <span className="text-sm font-medium text-foreground">
                                    Seu nome: {group.meuNome}
                                  </span>
                                </div>
                                {group.meuPresente && (
                                  <span className="text-sm text-muted-foreground">
                                    Presente desejado: <span className="text-foreground">{group.meuPresente}</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Lista de Participantes */}
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-foreground">
                                  Participantes e Presentes
                                </span>
                                {search.trim() && (
                                  <span className="text-xs text-muted-foreground">
                                    ({filteredParticipantes.length} encontrados)
                                  </span>
                                )}
                              </div>

                              {!hasSearchResults ? (
                                <div className="text-center py-4">
                                  <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                                  <p className="text-sm text-muted-foreground">
                                    Nenhum participante encontrado para "{search}"
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {filteredParticipantes.map((participante, idx) => {
                                    const isMe = participante.id === group.userIdInGroup;
                                    const isMyTarget = group.amigoSorteado?.id === participante.id;
                                    
                                    return (
                                      <motion.div
                                        key={participante.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className={cn(
                                          "flex items-center gap-3 p-3 rounded-lg transition-colors",
                                          isMe ? "bg-primary/10 border border-primary/20" :
                                          isMyTarget ? "bg-amber-500/10 border border-amber-500/20" :
                                          "bg-secondary/30 hover:bg-secondary/50"
                                        )}
                                      >
                                        <div className={cn(
                                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                                          isMe ? "bg-primary/20 text-primary" :
                                          isMyTarget ? "bg-amber-500/20 text-amber-500" :
                                          "bg-secondary text-muted-foreground"
                                        )}>
                                          {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <p className={cn(
                                              "font-medium truncate",
                                              isMe ? "text-primary" :
                                              isMyTarget ? "text-amber-500" :
                                              "text-foreground"
                                            )}>
                                              {participante.nome}
                                            </p>
                                            {isMe && (
                                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                                                você
                                              </span>
                                            )}
                                            {isMyTarget && (
                                              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500">
                                                seu amigo
                                              </span>
                                            )}
                                          </div>
                                          {participante.presente ? (
                                            <p className="text-sm text-muted-foreground truncate">
                                              🎁 {participante.presente}
                                            </p>
                                          ) : (
                                            <p className="text-sm text-muted-foreground/50 italic">
                                              Sem presente cadastrado
                                            </p>
                                          )}
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Info Card */}
                            {!group.sorteioRealizado && (
                              <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
                                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                                  ⏳ Aguardando sorteio
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  O administrador do grupo precisa realizar o sorteio usando o comando no WhatsApp.
                                </p>
                              </div>
                            )}

                            {/* Dicas */}
                            <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                              <p className="text-sm text-muted-foreground">
                                💡 Use os comandos do bot no grupo do WhatsApp para:
                              </p>
                              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                <li>• <code className="text-xs bg-secondary px-1 rounded">!amigoSecreto listaPresente add</code> - Cadastrar seu presente</li>
                                <li>• <code className="text-xs bg-secondary px-1 rounded">!amigoSecreto listaPresente edit</code> - Editar seu presente</li>
                                <li>• <code className="text-xs bg-secondary px-1 rounded">!amigoSecreto listaPresente</code> - Ver todos os presentes</li>
                              </ul>
                            </div>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
