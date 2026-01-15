import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  LogOut,
  User,
  Trophy,
  Star,
  Zap,
  Bell,
  BellOff,
  Edit3,
  Check,
  X,
  Loader2,
  RefreshCw,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="glass border-border/50 hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">{label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
              {subValue && (
                <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
              )}
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, user, userId, logout, refreshUser } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [customName, setCustomName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      setCustomName(user.customName || '');
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshUser();
    setIsRefreshing(false);
    toast({
      title: 'Dados atualizados!',
      description: 'Suas informações foram sincronizadas.',
    });
  };

  const handleToggleMentions = async () => {
    if (!userId || !user) return;

    setIsSaving(true);
    try {
      await api.users.update(userId, {
        allowMentions: !user.allowMentions,
      });
      await refreshUser();
      toast({
        title: user.allowMentions ? 'Menções desativadas' : 'Menções ativadas',
        description: user.allowMentions
          ? 'Você não será mais mencionado no ranking.'
          : 'Agora você aparecerá nas menções do ranking.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as configurações.',
        variant: 'destructive',
      });
    }
    setIsSaving(false);
  };

  const handleToggleCustomName = async () => {
    if (!userId || !user) return;

    setIsSaving(true);
    try {
      await api.users.update(userId, {
        customNameEnabled: !user.customNameEnabled,
      });
      await refreshUser();
      toast({
        title: user.customNameEnabled ? 'Nome personalizado desativado' : 'Nome personalizado ativado',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as configurações.',
        variant: 'destructive',
      });
    }
    setIsSaving(false);
  };

  const handleSaveName = async () => {
    if (!userId) return;

    if (customName.length > 30) {
      toast({
        title: 'Nome muito longo',
        description: 'O nome deve ter no máximo 30 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await api.users.update(userId, {
        customName: customName.trim() || null,
      });
      await refreshUser();
      setIsEditingName(false);
      toast({
        title: 'Nome atualizado!',
        description: 'Seu nome personalizado foi salvo.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o nome.',
        variant: 'destructive',
      });
    }
    setIsSaving(false);
  };

  const calculateProgress = () => {
    if (!user) return 0;
    const xpForNextLevel = user.level * 100;
    return Math.min((user.xp / xpForNextLevel) * 100, 100);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-strong border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">BreakerBot</h1>
              <p className="text-xs text-muted-foreground">Painel</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative">
        {/* User Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="glass-strong rounded-2xl p-6 border border-border/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-glow">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-foreground">
                    {user.customNameEnabled && user.customName
                      ? user.customName
                      : user.pushName || 'Usuário'}
                  </h2>
                  {user.prestige > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                      ⭐ Prestígio {user.prestige}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground font-mono mt-1">
                  {userId?.replace('@s.whatsapp.net', '')}
                </p>
                
                {/* Level Progress */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Nível {user.level}</span>
                    <span className="text-muted-foreground">
                      {user.xp} / {user.level * 100} XP
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateProgress()}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Trophy}
            label="Nível"
            value={user.level}
            subValue={`${user.xp} XP atual`}
            delay={0.1}
          />
          <StatCard
            icon={Star}
            label="Prestígio"
            value={user.prestige}
            subValue={user.prestigeAvailable > 0 ? `${user.prestigeAvailable} disponível` : undefined}
            delay={0.15}
          />
          <StatCard
            icon={MessageSquare}
            label="Mensagens"
            value={user.totalMessages.toLocaleString()}
            delay={0.2}
          />
          <StatCard
            icon={Zap}
            label="Bônus Diário"
            value={`${user.dailyBonusMultiplier}x`}
            subValue={user.dailyBonusExpiry ? 'Ativo' : 'Inativo'}
            delay={0.25}
          />
        </div>

        {/* Settings Cards */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Custom Name Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Edit3 className="w-5 h-5 text-primary" />
                  Nome Personalizado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Usar nome personalizado</p>
                    <p className="text-xs text-muted-foreground">
                      Substitui seu nome do WhatsApp no ranking
                    </p>
                  </div>
                  <Switch
                    checked={user.customNameEnabled}
                    onCheckedChange={handleToggleCustomName}
                    disabled={isSaving}
                  />
                </div>

                {isEditingName ? (
                  <div className="flex gap-2">
                    <Input
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Seu nome personalizado"
                      maxLength={30}
                      className="flex-1"
                    />
                    <Button
                      size="icon"
                      onClick={handleSaveName}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setIsEditingName(false);
                        setCustomName(user.customName || '');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setIsEditingName(true)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {user.customName ? 'Editar nome' : 'Definir nome'}
                  </Button>
                )}

                {user.customName && !isEditingName && (
                  <p className="text-sm text-muted-foreground">
                    Nome atual: <span className="text-foreground font-medium">{user.customName}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Mentions Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="glass border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {user.allowMentions ? (
                    <Bell className="w-5 h-5 text-primary" />
                  ) : (
                    <BellOff className="w-5 h-5 text-muted-foreground" />
                  )}
                  Menções no Ranking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Permitir menções</p>
                    <p className="text-xs text-muted-foreground">
                      Ser marcado quando aparecer no ranking
                    </p>
                  </div>
                  <Switch
                    checked={user.allowMentions}
                    onCheckedChange={handleToggleMentions}
                    disabled={isSaving}
                  />
                </div>

                <div className={`p-3 rounded-lg ${user.allowMentions ? 'bg-primary/10' : 'bg-secondary'}`}>
                  <p className="text-sm text-muted-foreground">
                    {user.allowMentions
                      ? '✓ Você será mencionado quando aparecer no ranking diário ou semanal.'
                      : '✗ Seu nome aparecerá no ranking, mas sem marcar você.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Badges Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="glass border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="w-5 h-5 text-primary" />
                  Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.badges.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.badges.map((badge, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Award className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Nenhuma conquista ainda. Continue participando!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
