'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
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
  Award,
  MessageSquare,
  Smile,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const POPULAR_EMOJIS = ['❤️', '🔥', '😎', '🎉', '⭐', '💪', '🚀', '🌟', '💯', '🏆', '👑', '💎', '🦋', '🌈', '🐱', '🐶', '🦔', '🫏', '💀', '👻'];

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

export default function ProfilePage() {
  const { user, userId, refreshUser } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [customName, setCustomName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingEmoji, setIsEditingEmoji] = useState(false);
  const [customEmoji, setCustomEmoji] = useState('');

  useEffect(() => {
    if (user) {
      setCustomName(user.customName || '');
      setCustomEmoji(user.emoji || '');
    }
  }, [user]);

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
    } catch {
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
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as configurações.',
        variant: 'destructive',
      });
    }
    setIsSaving(false);
  };

  const handleToggleEmojiReaction = async () => {
    if (!userId || !user) return;

    setIsSaving(true);
    try {
      await api.users.update(userId, {
        emojiReaction: !user.emojiReaction,
      });
      await refreshUser();
      toast({
        title: user.emojiReaction ? 'Reação de emoji desativada' : 'Reação de emoji ativada',
        description: user.emojiReaction 
          ? 'O bot não vai mais reagir às suas mensagens.'
          : 'O bot vai reagir às suas mensagens com seu emoji.',
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

  const handleSaveEmoji = async (emoji?: string) => {
    if (!userId) return;

    const emojiToSave = emoji || customEmoji.trim();
    
    if (!emojiToSave) {
      toast({
        title: 'Emoji inválido',
        description: 'Por favor, selecione ou digite um emoji.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await api.users.update(userId, {
        emoji: emojiToSave,
      });
      await refreshUser();
      setIsEditingEmoji(false);
      setCustomEmoji(emojiToSave);
      toast({
        title: 'Emoji atualizado!',
        description: `Seu emoji de reação agora é ${emojiToSave}`,
      });
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o emoji.',
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
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o nome.',
        variant: 'destructive',
      });
    }
    setIsSaving(false);
  };

  const getProgressPercent = () => {
    if (!user) return 0;
    // Usa o valor calculado pela API, ou calcula manualmente como fallback
    if (user.progressPercent !== undefined) {
      return user.progressPercent;
    }
    // Fallback: cálculo simplificado
    if (user.progressXP !== undefined && user.nextLevelXP !== undefined) {
      return Math.min(100, Math.round((user.progressXP / user.nextLevelXP) * 100));
    }
    return 0;
  };

  if (!user) {
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
        <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações e preferências</p>
      </div>

      {/* User Header */}
      <Card className="glass-strong border-border/50">
        <CardContent className="p-6">
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
                    {(user.progressXP ?? 0).toLocaleString()} / {(user.nextLevelXP ?? 0).toLocaleString()} XP
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressPercent()}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  XP Total: {user.xp.toLocaleString()} • Faltam {(user.neededXP ?? 0).toLocaleString()} XP
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Trophy}
          label="Nível"
          value={user.level}
          subValue={`${user.xp.toLocaleString()} XP total`}
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

        {/* Mentions Card */}
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              {user.allowMentions ? (
                <Bell className="w-5 h-5 text-primary" />
              ) : (
                <BellOff className="w-5 h-5 text-muted-foreground" />
              )}
              Menções
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Permitir menções</p>
                <p className="text-xs text-muted-foreground">
                  Ser mencionado em qualquer situação que o bot mencione
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
                  ? '✓ Você será mencionado em qualquer situação em que o bot mencione usuários.'
                  : '✗ Seu nome aparecerá, mas sem marcar você.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emoji Reaction Card */}
      <Card className="glass border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smile className="w-5 h-5 text-primary" />
            Reação de Emoji
          </CardTitle>
          <CardDescription>
            O bot vai reagir automaticamente a todas as suas mensagens com seu emoji escolhido
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Ativar reação automática</p>
              <p className="text-xs text-muted-foreground">
                O bot reage a cada mensagem sua com o emoji
              </p>
            </div>
            <Switch
              checked={user.emojiReaction || false}
              onCheckedChange={handleToggleEmojiReaction}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Seu emoji</p>
              {user.emoji && !isEditingEmoji && (
                <span className="text-2xl">{user.emoji}</span>
              )}
            </div>

            {isEditingEmoji ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={customEmoji}
                    onChange={(e) => setCustomEmoji(e.target.value)}
                    placeholder="Digite ou cole um emoji"
                    maxLength={4}
                    className="flex-1 text-center text-xl"
                  />
                  <Button
                    size="icon"
                    onClick={() => handleSaveEmoji()}
                    disabled={isSaving || !customEmoji.trim()}
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
                      setIsEditingEmoji(false);
                      setCustomEmoji(user.emoji || '');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Sugestões:</p>
                  <div className="flex flex-wrap gap-1">
                    {POPULAR_EMOJIS.map((emoji) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        className="text-xl p-1 h-9 w-9 hover:bg-primary/10"
                        onClick={() => handleSaveEmoji(emoji)}
                        disabled={isSaving}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setIsEditingEmoji(true)}
              >
                <Smile className="w-4 h-4 mr-2" />
                {user.emoji ? 'Trocar emoji' : 'Escolher emoji'}
              </Button>
            )}
          </div>

          <div className={`p-3 rounded-lg ${user.emojiReaction && user.emoji ? 'bg-primary/10' : 'bg-secondary'}`}>
            <p className="text-sm text-muted-foreground">
              {user.emojiReaction && user.emoji
                ? `✓ O bot vai reagir às suas mensagens com ${user.emoji}`
                : user.emoji
                ? `✗ Reação desativada. Ative para o bot reagir com ${user.emoji}`
                : '✗ Escolha um emoji e ative a reação para começar'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Badges Card */}
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
    </div>
  );
}
