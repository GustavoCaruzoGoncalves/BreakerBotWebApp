'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageSquare, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const DDD_OPTIONS = [
  '11', '12', '13', '14', '15', '16', '17', '18', '19',
  '21', '22', '24',
  '27', '28',
  '31', '32', '33', '34', '35', '37', '38',
  '41', '42', '43', '44', '45', '46',
  '47', '48', '49',
  '51', '53', '54', '55',
  '61',
  '62', '64',
  '63',
  '65', '66',
  '67',
  '68',
  '69',
  '71', '73', '74', '75', '77',
  '79',
  '81', '87',
  '82',
  '83',
  '84',
  '85', '88',
  '86', '89',
  '91', '93', '94',
  '92', '97',
  '95',
  '96',
  '98', '99',
];

export default function LoginPage() {
  const router = useRouter();
  const { requestCode } = useAuth();
  const [ddd, setDdd] = useState('');
  const [number, setNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 9);
    if (digits.length > 5) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    return digits;
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumber(formatNumber(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanNumber = number.replace(/\D/g, '');
    
    if (!ddd || ddd.length !== 2) {
      toast({
        title: 'DDD inválido',
        description: 'Por favor, selecione um DDD válido.',
        variant: 'destructive',
      });
      return;
    }

    if (cleanNumber.length < 8 || cleanNumber.length > 9) {
      toast({
        title: 'Número inválido',
        description: 'O número deve ter 8 ou 9 dígitos.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const fullNumber = `55${ddd}${cleanNumber}`;
    
    const result = await requestCode(fullNumber);
    
    setIsLoading(false);

    if (result.success) {
      toast({
        title: 'Código enviado!',
        description: 'Verifique seu WhatsApp para obter o código.',
      });
      router.push('/verify');
    } else {
      toast({
        title: 'Erro',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="glass-strong rounded-2xl p-8 shadow-lg">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex flex-col items-center mb-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 shadow-glow">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">BreakerBot</h1>
            <p className="text-muted-foreground text-sm mt-1">Painel de Gerenciamento</p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <label className="block text-sm font-medium text-foreground mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Seu número do WhatsApp
              </label>
              
              <div className="flex gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    +55
                  </span>
                  <select
                    value={ddd}
                    onChange={(e) => setDdd(e.target.value)}
                    className="h-12 w-24 pl-10 pr-2 rounded-lg border border-input bg-background text-foreground text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:border-primary"
                    required
                  >
                    <option value="">DDD</option>
                    {DDD_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                
                <Input
                  type="tel"
                  placeholder="99999-9999"
                  value={number}
                  onChange={handleNumberChange}
                  className="flex-1"
                  required
                />
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                Um código de verificação será enviado para seu WhatsApp
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <Button
                type="submit"
                variant="glow"
                size="xl"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Receber código
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          Você precisa estar registrado no bot para acessar
        </motion.p>
      </motion.div>
    </div>
  );
}
