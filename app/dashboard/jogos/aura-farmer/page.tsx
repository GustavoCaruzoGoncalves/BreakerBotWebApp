'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api, type AuraUserData } from '@/lib/api';
import { AuraSlotMachine } from '@/components/aura-slot-machine';
import { Button } from '@/components/ui/button';

export default function AuraFarmerPage() {
  const { userId } = useAuth();
  const [myAura, setMyAura] = useState<AuraUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const userRes = await api.aura.getUser(userId);
        if (userRes.success && userRes.aura) {
          setMyAura(userRes.aura);
        } else {
          setMyAura(null);
        }
      } catch {
        setError('Erro ao carregar');
        setMyAura(null);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [userId]);

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
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/jogos" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar aos jogos
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Aura Farmer</h1>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/jogos" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar aos jogos
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Aura Farmer</h1>
        <p className="text-muted-foreground">
          Caça-níqueis da aura — aposte e tente a sorte!
        </p>
      </div>

      {userId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AuraSlotMachine
            balance={myAura?.auraPoints ?? 0}
            onBalanceChange={(newBalance) =>
              setMyAura((prev) =>
                prev ? { ...prev, auraPoints: newBalance } : null
              )
            }
          />
        </motion.div>
      )}
    </div>
  );
}
