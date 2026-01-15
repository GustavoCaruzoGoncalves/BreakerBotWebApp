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
  Edit3,
  Check,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  const [editingPresente, setEditingPresente] = useState<string | null>(null);
  const [presenteValue, setPresenteValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userId) {
      loadGroups();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadGroups = async () => {
    if (!userId) return;

    try {
      const response = await api.amigoSecreto.getByUser(userId);
      if (response.success && response.groups) {
        setGroups(response.groups);
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
    if (newExpanded.has(groupId)) newExpanded.delete(groupId);
    else newExpanded.add(groupId);
    setExpandedGroups(newExpanded);
  };

  const filterParticipantes = (participantes: ParticipanteDetalhado[]) => {
    if (!search.trim()) return participantes;
    const searchLower = search.toLowerCase();
    return participantes.filter(
      (p) =>
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

  const startEditingPresente = (groupId: string, currentPresente: string | null) => {
    setEditingPresente(groupId);
    setPresenteValue(currentPresente || '');
  };

  const cancelEditingPresente = () => {
    setEditingPresente(null);
    setPresenteValue('');
  };

  const savePresente = async (groupId: string) => {
    if (!userId) return;

    setIsSaving(true);
    try {
      const response = await api.amigoSecreto.updatePresente(groupId, userId, presenteValue);
      
      if (response.success) {
        toast({
          title: 'Presente atualizado!',
          description: presenteValue ? `Seu presente desejado: ${presenteValue}` : 'Presente removido',
        });
        await loadGroups();
        setEditingPresente(null);
        setPresenteValue('');
      } else {
        toast({
          title: 'Erro',
          description: response.message || 'Não foi possível atualizar o presente',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o presente',
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
    // ✅ trava overflow horizontal da página inteira
    <div className="w-full max-w-full overflow-x-hidden space-y-6">
      {/* Page Title */}
      <div className="max-w-full">
        <h1 className="text-2xl font-bold text-foreground">Amigo Secreto</h1>
        <p className="text-muted-foreground">Grupos de amigo secreto que você participa</p>
      </div>

      {groups.length === 0 ? (
        <Card className="glass border-border/50 max-w-full">
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
          <Card className="glass border-border/50 max-w-full">
            <CardContent className="p-4">
              <div className="relative max-w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou presente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full max-w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Groups */}
          <div className="grid gap-6 max-w-full">
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
                  className="max-w-full"
                >
                  {/* ✅ max-w-full + min-w-0 pra evitar filho estourar */}
                  <Card className="glass border-border/50 overflow-hidden max-w-full min-w-0">
                    {/* Header - Clicável */}
                    <CardHeader
                      className="cursor-pointer hover:bg-accent/50 transition-colors p-4 sm:p-6 max-w-full"
                      onClick={() => toggleGroup(group.groupId)}
                    >
                      {/* ✅ min-w-0 no flex */}
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <CardTitle className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <PartyPopper className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          </div>

                          {/* ✅ min-w-0 pra truncates funcionarem e não estourar */}
                          <div className="min-w-0">
                            <h3 className="text-base sm:text-lg font-bold truncate">
                              {group.groupName}
                            </h3>

                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-normal text-muted-foreground min-w-0">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {group.totalParticipantes}
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

                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          // ✅ importante pra não aparecer overflow durante animação
                          className="max-w-full min-w-0 overflow-hidden"
                        >
                          <CardContent className="space-y-4 sm:space-y-6 pt-0 px-4 sm:px-6 max-w-full min-w-0">
                            {/* Meu Amigo Sorteado */}
                            {group.sorteioRealizado && group.amigoSorteado && (
                              <motion.div
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                className="p-3 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20 max-w-full min-w-0 overflow-hidden"
                              >
                                <div className="flex items-center gap-2 mb-2 min-w-0">
                                  <Heart className="w-4 h-4 text-primary flex-shrink-0" />
                                  <span className="font-semibold text-foreground text-sm truncate">
                                    Você tirou:
                                  </span>
                                </div>

                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                    <Gift className="w-5 h-5 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm sm:text-base font-bold text-foreground truncate">
                                      {group.amigoSorteado.nome}
                                    </p>
                                    {group.amigoSorteado.presente ? (
                                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                                        🎁 Quer:{' '}
                                        <span className="text-foreground font-medium">
                                          {group.amigoSorteado.presente}
                                        </span>
                                      </p>
                                    ) : (
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        Sem presente cadastrado
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {group.sorteioData && (
                                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground min-w-0">
                                    <Calendar className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{formatDate(group.sorteioData)}</span>
                                  </div>
                                )}
                              </motion.div>
                            )}

                            {/* Meu Presente */}
                            <div className="p-3 rounded-lg bg-secondary/50 max-w-full min-w-0 overflow-hidden">
                              <div className="flex items-center gap-2 mb-2 min-w-0">
                                <UserCheck className="w-4 h-4 text-primary flex-shrink-0" />
                                <span className="text-xs font-medium text-muted-foreground flex-shrink-0">
                                  Seu nome:
                                </span>
                                <span className="text-xs sm:text-sm font-medium text-foreground truncate min-w-0">
                                  {group.meuNome}
                                </span>
                              </div>
                              
                              {editingPresente === group.groupId ? (
                                <div className="flex items-center gap-2 pl-6">
                                  <Input
                                    type="text"
                                    placeholder="O que você quer ganhar?"
                                    value={presenteValue}
                                    onChange={(e) => setPresenteValue(e.target.value)}
                                    className="h-8 text-xs flex-1"
                                    maxLength={100}
                                    disabled={isSaving}
                                  />
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 flex-shrink-0"
                                    onClick={() => savePresente(group.groupId)}
                                    disabled={isSaving}
                                  >
                                    {isSaving ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Check className="w-4 h-4 text-primary" />
                                    )}
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 flex-shrink-0"
                                    onClick={cancelEditingPresente}
                                    disabled={isSaving}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-2 pl-6">
                                  <div className="text-xs text-muted-foreground break-words min-w-0 flex-1">
                                    {group.meuPresente ? (
                                      <>🎁 <span className="text-foreground">{group.meuPresente}</span></>
                                    ) : (
                                      <span className="italic text-muted-foreground/60">Nenhum presente cadastrado</span>
                                    )}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-xs flex-shrink-0"
                                    onClick={() => startEditingPresente(group.groupId, group.meuPresente || null)}
                                  >
                                    <Edit3 className="w-3 h-3 mr-1" />
                                    {group.meuPresente ? 'Editar' : 'Adicionar'}
                                  </Button>
                                </div>
                              )}
                            </div>

                            {/* Lista de Participantes */}
                            <div className="max-w-full min-w-0">
                              <div className="flex items-center flex-wrap gap-2 mb-3 min-w-0">
                                <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-xs sm:text-sm font-medium text-foreground">
                                  Participantes
                                </span>
                                {search.trim() && (
                                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                                    ({filteredParticipantes.length} encontrados)
                                  </span>
                                )}
                              </div>

                              {!hasSearchResults ? (
                                <div className="text-center py-4">
                                  <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                                  <p className="text-xs sm:text-sm text-muted-foreground">
                                    Nenhum participante para &quot;{search}&quot;
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-1.5 sm:space-y-2 max-w-full min-w-0">
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
                                          'flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg transition-colors max-w-full min-w-0',
                                          isMe
                                            ? 'bg-primary/10 border border-primary/20'
                                            : isMyTarget
                                            ? 'bg-amber-500/10 border border-amber-500/20'
                                            : 'bg-secondary/30 hover:bg-secondary/50'
                                        )}
                                      >
                                        <div
                                          className={cn(
                                            'w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5',
                                            isMe
                                              ? 'bg-primary/20 text-primary'
                                              : isMyTarget
                                              ? 'bg-amber-500/20 text-amber-500'
                                              : 'bg-secondary text-muted-foreground'
                                          )}
                                        >
                                          {idx + 1}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-1.5 min-w-0">
                                            {/* ✅ remove max-w fixo e deixa truncar naturalmente */}
                                            <span
                                              className={cn(
                                                'font-medium text-sm sm:text-base truncate min-w-0',
                                                isMe
                                                  ? 'text-primary'
                                                  : isMyTarget
                                                  ? 'text-amber-500'
                                                  : 'text-foreground'
                                              )}
                                            >
                                              {participante.nome}
                                            </span>

                                            {isMe && (
                                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary flex-shrink-0">
                                                você
                                              </span>
                                            )}
                                            {isMyTarget && (
                                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 flex-shrink-0">
                                                amigo
                                              </span>
                                            )}
                                          </div>

                                          {participante.presente ? (
                                            <p className="text-xs text-muted-foreground break-words mt-0.5">
                                              🎁 {participante.presente}
                                            </p>
                                          ) : (
                                            <p className="text-xs text-muted-foreground/50 italic mt-0.5">
                                              Sem presente
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
                              <div className="bg-amber-500/10 rounded-lg p-3 sm:p-4 border border-amber-500/20 max-w-full">
                                <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 font-medium">
                                  ⏳ Aguardando sorteio
                                </p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                                  O admin do grupo precisa realizar o sorteio pelo WhatsApp.
                                </p>
                              </div>
                            )}

                            {/* Dicas */}
                            <div className="bg-primary/5 rounded-lg p-3 sm:p-4 border border-primary/10 max-w-full min-w-0">
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                💡 Comandos do bot:
                              </p>

                              {/* ✅ aqui estava um dos maiores culpados: whitespace-nowrap + overflow */}
                              <div className="mt-2 space-y-1.5 text-xs sm:text-sm text-muted-foreground max-w-full">
                                <p className="break-words">
                                  •{' '}
                                  <code className="text-[10px] sm:text-xs bg-secondary px-1 rounded break-all">
                                    !amigoSecreto listaPresente add
                                  </code>{' '}
                                  - Cadastrar
                                </p>
                                <p className="break-words">
                                  •{' '}
                                  <code className="text-[10px] sm:text-xs bg-secondary px-1 rounded break-all">
                                    !amigoSecreto listaPresente edit
                                  </code>{' '}
                                  - Editar
                                </p>
                                <p className="break-words">
                                  •{' '}
                                  <code className="text-[10px] sm:text-xs bg-secondary px-1 rounded break-all">
                                    !amigoSecreto listaPresente
                                  </code>{' '}
                                  - Ver todos
                                </p>
                              </div>
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
