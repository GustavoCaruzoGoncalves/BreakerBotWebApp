'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { /* Gamepad2, Flame, */ ChevronRight, Skull } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const GAMES = [
  // {
  //   id: 'aura-farmer',
  //   name: 'Aura Farmer',
  //   description: 'Caça-níqueis da aura. Aposte e tente a sorte!',
  //   href: '/dashboard/jogos/aura-farmer',
  //   icon: Flame,
  //   color: 'from-orange-500/20 to-amber-500/10',
  //   borderColor: 'border-orange-500/30',
  // },
  {
    id: 'skull-runner',
    name: 'Skull Chase',
    description: 'Labirinto com caveira. Colete bolinhas e devore inimigos com o poder!',
    href: '/dashboard/jogos/skull-runner',
    icon: Skull,
    color: 'from-slate-500/20 to-zinc-500/10',
    borderColor: 'border-slate-500/30',
  },
  // {
  //   id: 'skullcards',
  //   name: 'SkullCards',
  //   description: 'UNO temático de caveiras, em tempo real com outros jogadores.',
  //   href: '/dashboard/jogos/skullcards',
  //   icon: Gamepad2,
  //   color: 'from-slate-900/70 via-slate-800/60 to-slate-900/80',
  //   borderColor: 'border-purple-500/40',
  // },
];

export default function JogosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Jogos</h1>
        <p className="text-muted-foreground">
          Escolha um jogo para começar a jogar
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link href={game.href}>
              <Card
                className={cn(
                  'glass border-border/50 cursor-pointer transition-all',
                  'hover:border-primary/30 hover:bg-primary/5',
                  `bg-gradient-to-br ${game.color} ${game.borderColor} border`
                )}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <game.icon className="w-5 h-5 text-orange-500" />
                    {game.name}
                  </CardTitle>
                  <CardDescription>{game.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Jogar
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
