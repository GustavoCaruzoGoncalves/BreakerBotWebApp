'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Trophy,
  Loader2,
  User,
  Medal,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { api, type AuraRankEntry, type AuraUserData, type AuraTier } from '@/lib/api';
import { MISSION_CONFIG } from '@/lib/aura-data';
import { cn } from '@/lib/utils';

const PROGRESS_KEY: Record<string, keyof NonNullable<AuraUserData['dailyMissions']>['progress']> = {
  messages_500: 'messages',
  reactions_500: 'reactions',
  duel_win: 'duelWin',
  survive_attack: 'surviveAttack',
  send_media: 'media',
  help_someone: 'helpSomeone',
};

function getMissionLabel(missionId: string): string {
  const m = MISSION_CONFIG.find((c) => c.id === missionId);
  return m?.label ?? missionId;
}

function getMissionTarget(missionId: string): number {
  const m = MISSION_CONFIG.find((c) => c.id === missionId);
  return m?.target ?? 1;
}

export default function AuraPage() {
  const { userId } = useAuth();
  const [ranking, setRanking] = useState<AuraRankEntry[]>([]);
  const [tiers, setTiers] = useState<AuraTier[]>([]);
  const [myAura, setMyAura] = useState<AuraUserData | null>(null);
  const [myDisplayName, setMyDisplayName] = useState<string>('');
  const [praisedBy, setPraisedBy] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [rankRes, tiersRes] = await Promise.all([
          api.aura.ranking(20),
          api.aura.tiers(),
        ]);

        if (rankRes.success && rankRes.ranking) {
          setRanking(rankRes.ranking);
        }
        if (tiersRes.success && tiersRes.tiers) {
          setTiers(tiersRes.tiers);
        }

        if (userId) {
          try {
            const userRes = await api.aura.getUser(userId);
            if (userRes.success && userRes.aura) {
              setMyAura(userRes.aura);
              setMyDisplayName(userRes.displayName ?? userId.replace('@s.whatsapp.net', ''));
              setPraisedBy(userRes.praisedBy ?? []);
            }
          } catch {
            setMyAura(null);
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar dados de aura');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [userId]);

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Flame className="w-7 h-7 text-orange-500" />
          Sistema de Aura
        </h1>
        <Card className="glass border-border/50 border-destructive/30">
          <CardContent className="p-6">
            <p className="text-destructive">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Verifique se a API do BreakerBot está rodando e se a URL está correta em NEXT_PUBLIC_API_URL.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Flame className="w-7 h-7 text-orange-500" />
          Sistema de Aura
        </h1>
        <p className="text-muted-foreground">
          Dados de aura vindos do bot: ranking e seu perfil
        </p>
      </div>

      {userId && myAura && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="glass border-border/50 bg-gradient-to-r from-orange-500/10 to-amber-500/5 border-orange-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-orange-500" />
                Meu perfil de aura
              </CardTitle>
              <CardDescription>
                {myDisplayName} — {myAura.tierName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold text-foreground">
                    {myAura.auraPoints.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">aura</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">{myAura.tierName}</span>
                  <span className="text-xs text-muted-foreground">(≥ {myAura.tierMinPoints.toLocaleString()} pts)</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  🎭 Personagem: {myAura.character ? myAura.character : 'Nenhum definido'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {myAura.hasStickerHash ? '🖼 Figurinha definida' : '🖼 Sem figurinha de aura'}
                </div>
              </div>

              {myAura.stickerDataUrl && (
                <div className="pt-2 border-t border-border/50">
                  <p className="text-sm font-medium text-foreground mb-2">Figurinha de aura</p>
                  <img
                    src={myAura.stickerDataUrl}
                    alt="Figurinha de aura"
                    className="w-24 h-24 object-contain rounded-lg bg-secondary/30"
                  />
                </div>
              )}

              {praisedBy.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Quem te elogiou: {praisedBy.length} pessoa(s)
                </p>
              )}

              {myAura.dailyMissions && (
                <div className="pt-3 border-t border-border/50">
                  <p className="text-sm font-medium text-foreground mb-2">
                    Missões de hoje ({myAura.dailyMissions.completedMissionIds.length}/3) — reset 00:00
                  </p>
                  <div className="space-y-2">
                    {myAura.dailyMissions.drawnMissions.map((missionId) => {
                      const completed = myAura.dailyMissions!.completedMissionIds.includes(missionId);
                      const progKey = PROGRESS_KEY[missionId];
                      const val = progKey ? (myAura.dailyMissions!.progress[progKey] ?? 0) : 0;
                      const target = getMissionTarget(missionId);
                      return (
                        <div
                          key={missionId}
                          className={cn(
                            'flex items-center justify-between text-sm py-1.5 px-2 rounded',
                            completed ? 'bg-green-500/10' : 'bg-secondary/30'
                          )}
                        >
                          <span>{completed ? '✅' : '⬜'} {getMissionLabel(missionId)}</span>
                          <span className="text-muted-foreground">
                            {completed ? 'Concluída' : `${val}/${target}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="w-5 h-5 text-primary" />
              Ranking de aura
            </CardTitle>
            <CardDescription>
              Quem tem mais aura (dados do bot)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ranking.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Ninguém no ranking de aura ainda.
              </div>
            ) : (
              <div className="space-y-2">
                {ranking.map((entry, index) => (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-lg',
                      entry.userId === userId ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-accent'
                    )}
                  >
                    <div className="w-8 h-8 flex items-center justify-center font-bold text-muted-foreground">
                      {getRankIcon(index)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {entry.displayName}
                        {entry.userId === userId && (
                          <span className="ml-2 text-xs text-primary">(você)</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.tierName}
                        {entry.character && (
                          <span className="ml-1"> · 🎭 {entry.character}</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        {entry.auraPoints.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">aura</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {tiers.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Card className="glass border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Medal className="w-5 h-5 text-primary" />
                Níveis de aura
              </CardTitle>
              <CardDescription>
                Títulos conforme os pontos (dados da API)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tiers.map((tier, i) => (
                  <div
                    key={tier.name}
                    className={cn(
                      'p-3 rounded-lg border flex items-center justify-between',
                      i === 0 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-secondary/30 border-border/50'
                    )}
                  >
                    <span className="font-medium text-foreground">{tier.name}</span>
                    <span className="text-sm text-muted-foreground font-mono">
                      ≥ {tier.minPoints.toLocaleString()} pts
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
