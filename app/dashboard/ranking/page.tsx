'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Medal,
  Search,
  Loader2,
  Star,
  MessageSquare,
  TrendingUp,
  Zap,
  Calendar,
  User,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api, UserData, DailyBonusData } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function RankingPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [dailyBonus, setDailyBonus] = useState<DailyBonusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'xp' | 'level' | 'messages' | 'prestige'>('xp');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = [...users];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(user => 
        user.pushName?.toLowerCase().includes(searchLower) ||
        user.customName?.toLowerCase().includes(searchLower) ||
        user.id?.includes(search)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'level':
          return b.level - a.level || b.xp - a.xp;
        case 'messages':
          return b.totalMessages - a.totalMessages;
        case 'prestige':
          return b.prestige - a.prestige || b.level - a.level;
        default:
          return b.xp - a.xp;
      }
    });

    setFilteredUsers(filtered);
  }, [users, search, sortBy]);

  const loadData = async () => {
    try {
      const [usersResponse, bonusResponse] = await Promise.all([
        api.users.list(),
        api.dailyBonus.get(),
      ]);

      if (usersResponse.success && usersResponse.users) {
        const validUsers = usersResponse.users.filter(u => 
          u.id?.includes('@s.whatsapp.net') && !u.id?.includes('@g.us')
        );
        setUsers(validUsers);
      }

      if (bonusResponse.success && bonusResponse.dailyBonus) {
        setDailyBonus(bonusResponse.dailyBonus);
      }
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o ranking.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{index + 1}</span>;
  };

  const getUserName = (user: UserData) => {
    if (user.customNameEnabled && user.customName) return user.customName;
    return user.pushName || 'Usuário';
  };

  const getBonusUserName = () => {
    if (!dailyBonus?.lastBonusUser) return 'Nenhum';
    const user = users.find(u => u.id === dailyBonus.lastBonusUser);
    if (user) return getUserName(user);
    return dailyBonus.lastBonusUser.replace('@s.whatsapp.net', '');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    } catch {
      return dateString;
    }
  };

  const sortOptions = [
    { value: 'xp', label: 'XP Total', icon: TrendingUp },
    { value: 'level', label: 'Nível', icon: Trophy },
    { value: 'messages', label: 'Mensagens', icon: MessageSquare },
    { value: 'prestige', label: 'Prestígio', icon: Star },
  ];

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
        <h1 className="text-2xl font-bold text-foreground">Ranking</h1>
        <p className="text-muted-foreground">Veja quem são os mais ativos do grupo</p>
      </div>

      {/* Daily Bonus Card */}
      {dailyBonus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass border-border/50 bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border-amber-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-amber-500" />
                Bônus Diário
              </CardTitle>
              <CardDescription>
                O primeiro a mandar mensagem no dia ganha XP em dobro!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3 flex-1 p-3 bg-background/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Última data</p>
                    <p className="text-sm font-medium text-foreground">
                      {dailyBonus.lastBonusDate ? formatDate(dailyBonus.lastBonusDate) : 'Nunca'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-1 p-3 bg-background/50 rounded-lg">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Último ganhador</p>
                    <p className="text-sm font-medium text-foreground">
                      {getBonusUserName()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <Card className="glass border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou número..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as typeof sortBy)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    sortBy === option.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  <option.icon className="w-4 h-4" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 3 */}
      {filteredUsers.length >= 3 && !search && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 0, 2].map((pos) => {
            const user = filteredUsers[pos];
            if (!user) return null;
            const isFirst = pos === 0;
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: pos * 0.1 }}
                className={cn(isFirst && "md:order-first md:-mt-4")}
              >
                <Card className={cn(
                  "glass border-border/50 text-center",
                  isFirst && "ring-2 ring-yellow-500/50 shadow-lg"
                )}>
                  <CardContent className="p-6">
                    <div className={cn(
                      "w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3",
                      isFirst ? "bg-yellow-500/20" : pos === 1 ? "bg-gray-400/20" : "bg-amber-600/20"
                    )}>
                      {getRankIcon(pos)}
                    </div>
                    <h3 className="font-bold text-foreground truncate">{getUserName(user)}</h3>
                    {user.prestige > 0 && (
                      <span className="text-xs text-primary">⭐ Prestígio {user.prestige}</span>
                    )}
                    <div className="mt-2 space-y-1">
                      <p className="text-2xl font-bold text-primary">
                        {sortBy === 'messages' ? user.totalMessages.toLocaleString() : 
                         sortBy === 'prestige' ? user.prestige :
                         sortBy === 'level' ? user.level :
                         user.xp.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sortBy === 'messages' ? 'mensagens' : 
                         sortBy === 'prestige' ? 'prestígios' :
                         sortBy === 'level' ? `nível` :
                         'XP total'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full List */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Classificação Geral
            <span className="text-sm font-normal text-muted-foreground">
              ({filteredUsers.length} usuários)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground">Nenhum usuário encontrado</p>
              </div>
            ) : (
              filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(index * 0.02, 0.5) }}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-lg transition-colors",
                    index < 3 ? "bg-primary/5" : "hover:bg-accent"
                  )}
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    {getRankIcon(index)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">
                        {getUserName(user)}
                      </p>
                      {user.prestige > 0 && (
                        <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-xs bg-primary/10 text-primary">
                          ⭐{user.prestige}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Nível {user.level} • {user.totalMessages.toLocaleString()} msgs
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">
                      {sortBy === 'messages' ? user.totalMessages.toLocaleString() : 
                       sortBy === 'prestige' ? user.prestige :
                       sortBy === 'level' ? user.level :
                       user.xp.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sortBy === 'messages' ? 'msgs' : 
                       sortBy === 'prestige' ? 'prest.' :
                       sortBy === 'level' ? 'nível' :
                       'XP'}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
