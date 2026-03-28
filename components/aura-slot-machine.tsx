// Componente desabilitado temporariamente — Aura Farmer está fora do ar.
//
// 'use client';
//
// import { useState, useRef, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Flame, Minus, Plus } from 'lucide-react';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { useAuth } from '@/contexts/AuthContext';
// import { api, type AuraSlotReelSymbol } from '@/lib/api';
// import { cn, formatAura } from '@/lib/utils';
//
// const BET_STEP = 1;
// const SPIN_COOLDOWN_MS = 800;
//
// export function AuraSlotMachine({
//   balance,
//   onBalanceChange,
// }: {
//   balance: number;
//   onBalanceChange: (newBalance: number) => void;
// }) {
//   const { token } = useAuth();
//   const [betInput, setBetInput] = useState('50');
//   const bet = Math.max(0, Math.floor(Number(betInput) || 0));
//   const [reels, setReels] = useState<AuraSlotReelSymbol[][] | null>(null);
//   const [lastWin, setLastWin] = useState<number | null>(null);
//   const [isSpinning, setIsSpinning] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [isCooldown, setIsCooldown] = useState(false);
//   const [cooldownRemaining, setCooldownRemaining] = useState(0);
//   const cooldownRef = useRef<{ timer: ReturnType<typeof setTimeout>; interval: ReturnType<typeof setInterval> } | null>(null);
//
//   const handleSpin = async () => {
//     if (!token) {
//       setError('Faça login para jogar');
//       return;
//     }
//     if (bet < 1) {
//       setError('Aposta mínima: 1 aura');
//       return;
//     }
//     if (balance < bet) {
//       setError('Saldo insuficiente');
//       return;
//     }
//     setIsSpinning(true);
//     setError(null);
//     setLastWin(null);
//     try {
//       const res = await api.aura.slot(token, bet);
//       if (res.success && res.reels) {
//         setReels(res.reels);
//         setLastWin(res.win ?? 0);
//         if (res.balance !== undefined) {
//           onBalanceChange(res.balance);
//         }
//       } else {
//         setError((res as { message?: string }).message || 'Erro ao girar');
//       }
//     } catch (e) {
//       setError(e instanceof Error ? e.message : 'Erro ao girar');
//     } finally {
//       setIsSpinning(false);
//       setIsCooldown(true);
//       setCooldownRemaining(SPIN_COOLDOWN_MS / 1000);
//       if (cooldownRef.current) {
//         clearTimeout(cooldownRef.current.timer);
//         clearInterval(cooldownRef.current.interval);
//       }
//       const start = Date.now();
//       const interval = setInterval(() => {
//         const remaining = Math.ceil(Math.max(0, (SPIN_COOLDOWN_MS - (Date.now() - start)) / 1000));
//         setCooldownRemaining(remaining);
//       }, 100);
//       const timer = setTimeout(() => {
//         if (cooldownRef.current) {
//           clearInterval(cooldownRef.current.interval);
//           cooldownRef.current = null;
//         }
//         setIsCooldown(false);
//         setCooldownRemaining(0);
//       }, SPIN_COOLDOWN_MS);
//       cooldownRef.current = { timer, interval };
//     }
//   };
//
//   const canSpin = token && bet >= 1 && balance >= bet && !isSpinning && !isCooldown;
//
//   useEffect(() => () => {
//     if (cooldownRef.current) {
//       clearTimeout(cooldownRef.current.timer);
//       clearInterval(cooldownRef.current.interval);
//     }
//   }, []);
//
//   const adjustBet = (delta: number) => {
//     const next = Math.max(0, bet + delta);
//     setBetInput(String(next));
//   };
//
//   return (
//     <Card className="glass border-border/50 bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-transparent border-orange-500/20">
//       <CardHeader className="pb-2">
//         <CardTitle className="flex items-center gap-2 text-lg">
//           <Flame className="w-5 h-5 text-orange-500" />
//           Caça-níqueis da Aura
//         </CardTitle>
//         <CardDescription>
//           Aposte aura e tente a sorte! Caveira 💀 é curinga.
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         {/* Grade 3x3 */}
//         <div className="relative overflow-hidden rounded-xl bg-black/30 border-2 border-orange-500/30 p-6">
//           <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
//             {[0, 1, 2].map((col) => (
//               <div key={col} className="flex flex-col gap-2">
//                 {[0, 1, 2].map((row) => (
//                   <motion.div
//                     key={`${col}-${row}`}
//                     className={cn(
//                       'min-w-[4.5rem] min-h-[4.5rem] aspect-square flex items-center justify-center rounded-lg',
//                       'bg-gradient-to-b from-orange-900/40 to-amber-900/30 border-2 border-orange-500/30'
//                     )}
//                     initial={false}
//                     animate={{
//                       scale: isSpinning ? [1, 1.05, 1] : 1,
//                       transition: { duration: 0.3, repeat: isSpinning ? Infinity : 0 },
//                     }}
//                   >
//                     <AnimatePresence mode="wait">
//                       {reels && reels[col]?.[row] ? (
//                         <motion.span
//                           key={`${col}-${row}-${reels[col][row].emoji}`}
//                           initial={{ opacity: 0, y: -20 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           exit={{ opacity: 0 }}
//                           className="text-5xl md:text-6xl lg:text-7xl"
//                         >
//                           {reels[col][row].id === 'wild' ? '💀' : reels[col][row].emoji}
//                         </motion.span>
//                       ) : (
//                         <span className="text-4xl md:text-5xl text-orange-400/50">?</span>
//                       )}
//                     </AnimatePresence>
//                   </motion.div>
//                 ))}
//               </div>
//             ))}
//           </div>
//           {isSpinning && (
//             <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
//               <motion.div
//                 animate={{ rotate: 360 }}
//                 transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
//                 className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"
//               />
//             </div>
//           )}
//         </div>
//
//         {/* Resultado */}
//         {lastWin !== null && !isSpinning && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className={cn(
//               'text-center py-2 rounded-lg font-bold',
//               lastWin > 0
//                 ? 'bg-green-500/20 text-green-400'
//                 : 'bg-muted text-muted-foreground'
//             )}
//           >
//             {lastWin > 0 ? `+${formatAura(lastWin)} aura!` : 'Sem ganhos'}
//           </motion.div>
//         )}
//
//         {error && (
//           <p className="text-sm text-destructive text-center">{error}</p>
//         )}
//
//         {/* Controles */}
//         <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
//           <div className="flex items-center gap-2">
//             <Button
//               variant="outline"
//               size="icon"
//               onClick={() => adjustBet(-BET_STEP)}
//               disabled={isSpinning || bet <= 0}
//             >
//               <Minus className="w-4 h-4" />
//             </Button>
//             <Input
//               type="number"
//               min={1}
//               value={betInput}
//               onChange={(e) => setBetInput(e.target.value.replace(/\D/g, '') || '')}
//               onBlur={() => setBetInput(bet > 0 ? String(bet) : '1')}
//               className="w-24 text-center font-mono font-bold"
//               disabled={isSpinning}
//             />
//             <Button
//               variant="outline"
//               size="icon"
//               onClick={() => adjustBet(BET_STEP)}
//               disabled={isSpinning}
//             >
//               <Plus className="w-4 h-4" />
//             </Button>
//             <span className="text-sm text-muted-foreground">aura</span>
//           </div>
//           <Button
//             onClick={handleSpin}
//             disabled={!canSpin}
//             className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-8"
//           >
//             {isSpinning ? 'Girando...' : isCooldown ? `Aguarde ${cooldownRemaining}s` : 'GIRAR'}
//           </Button>
//         </div>
//
//         <p className="text-xs text-muted-foreground text-center">
//           Saldo: {formatAura(balance)} aura
//         </p>
//       </CardContent>
//     </Card>
//   );
// }
