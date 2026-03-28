// Componente desabilitado temporariamente — SkullCards está fora do ar.
//
// 'use client';
//
// import { useEffect, useMemo, useState } from 'react';
// import { io, Socket } from 'socket.io-client';
// import { motion } from 'framer-motion';
// import { ArrowLeft, Loader2 } from 'lucide-react';
// import Link from 'next/link';
// import { useAuth } from '@/contexts/AuthContext';
// import { api } from '@/lib/api';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { cn } from '@/lib/utils';
//
// type SkullCard = string;
//
// interface SkullcardsRoom {
//   room_id: string;
//   host_user_id: string;
//   status: string;
//   is_public?: boolean;
//   created_at: string;
//   players: { user_id: string; joined_at: string }[];
// }
//
// interface SkullcardsMatchState {
//   matchId: string;
//   roomId: string;
//   status: string;
//   currentTurnUserId: string;
//   direction: number;
//   currentColor: string;
//   pendingDraw: number;
//   discardTop: SkullCard;
//   winnerUserId: string | null;
//   hands: Record<string, SkullCard[]>;
//   drawPile: SkullCard[];
//   discardPile: SkullCard[];
// }
//
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
// const WS_URL = API_BASE_URL.replace(/^http/, 'ws');
//
// function translateSkullcardsError(type: string | undefined, reason?: string): string {
//   if (type === 'auth') return 'Sessão inválida ou expirada. Entre novamente.';
//   if (type === 'room') return 'Sala não encontrada ou não está mais disponível.';
//   if (type === 'internal') return 'Erro interno no SkullCards. Tente novamente em alguns segundos.';
//
//   if (type === 'play') {
//     switch (reason) {
//       case 'not_player_turn':
//         return 'Não é a sua vez de jogar.';
//       case 'must_resolve_draw_stack':
//         return 'Você está sob penalidade de compra. Só pode jogar cartas +2 ou +4 para empilhar, ou então comprar.';
//       case 'card_not_match':
//         return 'Essa carta não pode ser jogada: ela deve combinar a cor ou o número/símbolo do topo, ou ser uma carta coringa.';
//       case 'card_not_in_hand':
//         return 'Essa carta não está mais na sua mão.';
//       case 'invalid_color_choice':
//         return 'Cor inválida para a carta coringa. Use vermelho, amarelo, verde ou azul.';
//       case 'match_not_found':
//         return 'Partida não encontrada. Talvez a sala tenha sido encerrada.';
//       default:
//         return 'Não foi possível jogar essa carta.';
//     }
//   }
//
//   if (type === 'draw') {
//     switch (reason) {
//       case 'not_player_turn':
//         return 'Não é a sua vez de comprar.';
//       case 'match_not_found':
//         return 'Partida não encontrada. Talvez a sala tenha sido encerrada.';
//       default:
//         return 'Não foi possível comprar carta agora.';
//     }
//   }
//
//   if (type === 'pass') {
//     switch (reason) {
//       case 'not_player_turn':
//         return 'Não é a sua vez de jogar.';
//       case 'must_draw':
//         return 'Você precisa comprar as cartas da penalidade antes de passar a vez.';
//       case 'has_playable_cards':
//         return 'Você ainda tem cartas jogáveis. Jogue uma carta ou compre, não pode simplesmente passar.';
//       case 'match_not_found':
//         return 'Partida não encontrada. Talvez a sala tenha sido encerrada.';
//       default:
//         return 'Não foi possível passar a vez agora.';
//     }
//   }
//
//   return 'Ocorreu um erro no SkullCards. Tente novamente.';
// }
//
// type ParsedCardType = 'NUMBER' | 'SKIP' | 'REVERSE' | 'DRAW_TWO' | 'WILD' | 'WILD_DRAW_FOUR' | 'UNKNOWN';
//
// function parseClientCard(card: SkullCard): { type: ParsedCardType; value: number | null; color: string } {
//   if (card === 'W') return { type: 'WILD', value: null, color: 'wild' };
//   if (card === 'W+4') return { type: 'WILD_DRAW_FOUR', value: null, color: 'wild' };
//   const [prefix, suffix] = card.split('-');
//   const colorMap: Record<string, string> = {
//     R: 'red',
//     Y: 'yellow',
//     G: 'green',
//     B: 'blue',
//   };
//   const color = colorMap[prefix] ?? 'wild';
//   if (!suffix) return { type: 'UNKNOWN', value: null, color };
//   if (suffix === 'SKIP') return { type: 'SKIP', value: null, color };
//   if (suffix === 'REVERSE') return { type: 'REVERSE', value: null, color };
//   if (suffix === '+2') return { type: 'DRAW_TWO', value: null, color };
//   const num = parseInt(suffix, 10);
//   if (!Number.isNaN(num)) {
//     return { type: 'NUMBER', value: num, color };
//   }
//   return { type: 'UNKNOWN', value: null, color };
// }
//
// function canPlayClient(card: SkullCard, state: SkullcardsMatchState): boolean {
//   const parsed = parseClientCard(card);
//   const topParsed = parseClientCard(state.discardTop);
//
//   if (state.pendingDraw > 0) {
//     const isDrawStack =
//       parsed.type === 'DRAW_TWO' ||
//       parsed.type === 'WILD_DRAW_FOUR';
//     if (!isDrawStack) return false;
//   }
//
//   if (parsed.type === 'WILD' || parsed.type === 'WILD_DRAW_FOUR') {
//     return true;
//   }
//
//   const sameColor = parsed.color === state.currentColor;
//   const sameValue =
//     parsed.type === topParsed.type &&
//     ((parsed.type === 'NUMBER' && parsed.value === topParsed.value) ||
//       parsed.type !== 'NUMBER');
//
//   return sameColor || sameValue;
// }
//
// export function SkullcardsGame() {
//   const { token, userId } = useAuth();
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [room, setRoom] = useState<SkullcardsRoom | null>(null);
//   const [matchState, setMatchState] = useState<SkullcardsMatchState | null>(null);
//   const [isHost, setIsHost] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [joinCode, setJoinCode] = useState('');
//   const [creatingPublic, setCreatingPublic] = useState(true);
//   const [publicRooms, setPublicRooms] = useState<SkullcardsRoom[]>([]);
//
//   useEffect(() => {
//     if (!token || !userId) return;
//     let active = true;
//     async function loadPublicRooms() {
//       try {
//         const res = await api.skullcards.listPublicRooms();
//         if (!active) return;
//         if (res.success && Array.isArray(res.rooms)) {
//           setPublicRooms(res.rooms as SkullcardsRoom[]);
//         }
//       } catch {
//         // ignore falha de listagem
//       }
//     }
//     loadPublicRooms();
//     const interval = setInterval(loadPublicRooms, 15000);
//     return () => {
//       active = false;
//       clearInterval(interval);
//     };
//   }, [token, userId]);
//
//   useEffect(() => {
//     return () => {
//       if (socket) {
//         socket.disconnect();
//       }
//     };
//   }, [socket]);
//
//   const ensureSocket = () => {
//     if (socket) return socket;
//     const s = io(WS_URL, {
//       transports: ['websocket'],
//     });
//     setSocket(s);
//     return s;
//   };
//
//   const myHand = useMemo(() => {
//     if (!matchState || !userId) return [];
//     return matchState.hands[userId] || [];
//   }, [matchState, userId]);
//
//   const isMyTurn = matchState && userId && matchState.currentTurnUserId === userId;
//
//   const playersInRoom = room?.players ?? [];
//
//   const handleCreateRoom = async () => {
//     if (!token || !userId) return;
//     try {
//       setIsLoading(true);
//       setError(null);
//       const created = await api.skullcards.createRoom(token, creatingPublic);
//       if (!created.success || !created.room) {
//         setError(created.message || 'Falha ao criar sala');
//         return;
//       }
//       const r = created.room as SkullcardsRoom;
//       setRoom(r);
//       setIsHost(true);
//       const s = ensureSocket();
//       s.on('connect', () => {
//         s.emit('join_room', { roomId: r.room_id, token });
//       });
//       s.on('room_update', (payload: { room: SkullcardsRoom }) => {
//         setRoom(payload.room);
//       });
//       s.on('game_state_update', (payload: { state: SkullcardsMatchState }) => {
//         setMatchState(payload.state);
//       });
//       s.on('error', (payload: { type?: string; reason?: string; message?: string }) => {
//         const msg =
//           payload.reason || payload.type
//             ? translateSkullcardsError(payload.type, payload.reason)
//             : payload.message || 'Erro no SkullCards';
//         setError(msg);
//       });
//     } catch (e: any) {
//       setError(e?.message || 'Erro ao criar sala');
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   const handleJoinByCode = async (codeOverride?: string) => {
//     if (!token || !userId) return;
//     const raw = typeof codeOverride === 'string' ? codeOverride : joinCode;
//     const trimmed = raw.trim();
//     if (!trimmed) return;
//     try {
//       setIsLoading(true);
//       setError(null);
//       const joined = await api.skullcards.joinRoom(trimmed, token);
//       if (!joined.success || !joined.room) {
//         setError(joined.message || 'Falha ao entrar na sala');
//         return;
//       }
//       const r = joined.room as SkullcardsRoom;
//       setRoom(r);
//       setIsHost(r.host_user_id === userId);
//       const s = ensureSocket();
//       s.emit('join_room', { roomId: r.room_id, token });
//       s.on('room_update', (payload: { room: SkullcardsRoom }) => {
//         setRoom(payload.room);
//       });
//       s.on('game_state_update', (payload: { state: SkullcardsMatchState }) => {
//         setMatchState(payload.state);
//       });
//       s.on('error', (payload: { type?: string; reason?: string; message?: string }) => {
//         const msg =
//           payload.reason || payload.type
//             ? translateSkullcardsError(payload.type, payload.reason)
//             : payload.message || 'Erro no SkullCards';
//         setError(msg);
//       });
//     } catch (e: any) {
//       setError(e?.message || 'Erro ao entrar na sala');
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   const handleStartGame = async () => {
//     if (!room || !token || !isHost) return;
//     try {
//       setIsLoading(true);
//       const res = await api.skullcards.startRoom(room.room_id, token);
//       if (res.success && (res as any).match?.state) {
//         const nextState = (res as any).match.state as SkullcardsMatchState;
//         setMatchState(nextState);
//         const s = ensureSocket();
//         s.emit('join_room', { roomId: room.room_id, token });
//       } else if (!res.success) {
//         setError(res.message || 'Não foi possível iniciar a partida');
//       }
//     } catch (e: any) {
//       setError(e?.message || 'Erro ao iniciar partida');
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   const sendPlayCard = (card: SkullCard, chosenColor?: string) => {
//     if (!socket || !matchState || !token) return;
//     socket.emit('play_card', {
//       matchId: matchState.matchId,
//       card,
//       chosenColor,
//       token,
//     });
//   };
//
//   const sendDrawCard = () => {
//     if (!socket || !matchState || !token) return;
//     socket.emit('draw_card', {
//       matchId: matchState.matchId,
//       token,
//     });
//   };
//
//   const sendPassTurn = () => {
//     if (!socket || !matchState || !token) return;
//     socket.emit('pass_turn', {
//       matchId: matchState.matchId,
//       token,
//     });
//   };
//
//   const renderCard = (card: SkullCard, clickable: boolean, onClick?: () => void) => {
//     const [rawColor, value] = card.split('-');
//     const colorMap: Record<string, string> = {
//       R: 'bg-red-600/80 border-red-400',
//       Y: 'bg-yellow-500/80 border-yellow-300',
//       G: 'bg-emerald-600/80 border-emerald-400',
//       B: 'bg-sky-600/80 border-sky-400',
//       W: 'bg-slate-800/80 border-purple-400',
//     };
//     const cKey = rawColor === 'W' ? 'W' : rawColor;
//     const label =
//       card === 'W'
//         ? 'WILD'
//         : card === 'W+4'
//         ? '+4'
//         : value === 'SKIP'
//         ? '⛔'
//         : value === 'REVERSE'
//         ? '↺'
//         : value === '+2'
//         ? '+2'
//         : value;
//
//     return (
//       <button
//         key={card}
//         onClick={clickable && onClick ? onClick : undefined}
//         disabled={!clickable}
//         className={cn(
//           'relative flex h-24 w-16 items-center justify-center rounded-xl border-2 shadow-lg text-white text-xl font-bold select-none',
//           colorMap[cKey] || 'bg-slate-700/80 border-slate-400',
//           clickable
//             ? 'cursor-pointer hover:-translate-y-1 hover:shadow-2xl transition-transform'
//             : 'cursor-not-allowed opacity-60 brightness-90'
//         )}
//       >
//         <span className="drop-shadow-md">{label}</span>
//         <span className="absolute inset-1 rounded-lg border border-white/20" />
//       </button>
//     );
//   };
//
//   if (!token || !userId) {
//     return (
//       <div className="space-y-4">
//         <p className="text-muted-foreground">
//           Você precisa estar autenticado para jogar SkullCards.
//         </p>
//       </div>
//     );
//   }
//
//   return (
//     <div className="space-y-4">
//       <div className="flex items-center gap-4">
//         <Button variant="ghost" size="sm" asChild>
//           <Link href="/dashboard/jogos" className="gap-2">
//             <ArrowLeft className="w-4 h-4" />
//             Voltar aos jogos
//           </Link>
//         </Button>
//       </div>
//
//       <div>
//         <h1 className="text-2xl font-bold text-foreground">SkullCards</h1>
//         <p className="text-muted-foreground">
//           UNO com tema de caveiras — jogue em tempo real com outros jogadores.
//         </p>
//       </div>
//
//       {error && (
//         <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}
//
//       {!room && (
//         <Card className="glass border-border/60 bg-slate-900/60">
//           <CardHeader>
//             <CardTitle className="text-base sm:text-lg">Escolha como entrar no jogo</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="space-y-2">
//               <p className="text-xs text-muted-foreground">Criar nova sala</p>
//               <div className="flex items-center gap-3">
//                 <Button
//                   size="sm"
//                   disabled={isLoading}
//                   onClick={handleCreateRoom}
//                   className="gap-2"
//                 >
//                   {isLoading ? (
//                     <>
//                       <Loader2 className="w-4 h-4 animate-spin" />
//                       Criando...
//                     </>
//                   ) : (
//                     'Criar sala'
//                   )}
//                 </Button>
//                 <button
//                   type="button"
//                   onClick={() => setCreatingPublic((v) => !v)}
//                   className={cn(
//                     'text-xs rounded-full px-3 py-1 border',
//                     creatingPublic
//                       ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-200'
//                       : 'border-slate-600 bg-slate-800/60 text-slate-200'
//                   )}
//                 >
//                   {creatingPublic ? 'Sala pública' : 'Sala privada'}
//                 </button>
//               </div>
//               <p className="text-[11px] text-muted-foreground">
//                 Salas públicas podem ser listadas no futuro e são mais fáceis de achar.
//                 Salas privadas só podem ser acessadas com o código.
//               </p>
//             </div>
//
//             <div className="h-px w-full bg-slate-800/80" />
//
//             <div className="space-y-2">
//               <p className="text-xs text-muted-foreground">Entrar por código da sala</p>
//               <div className="flex flex-col sm:flex-row gap-2">
//                 <input
//                   value={joinCode}
//                   onChange={(e) => setJoinCode(e.target.value)}
//                   placeholder="Cole o código da sala aqui"
//                   className="flex-1 rounded-md border border-slate-700 bg-slate-950/70 px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
//                 />
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   disabled={isLoading || !joinCode.trim()}
//                   onClick={handleJoinByCode}
//                 >
//                   Entrar
//                 </Button>
//               </div>
//             </div>
//
//             {publicRooms.length > 0 && (
//               <>
//                 <div className="h-px w-full bg-slate-800/80" />
//                 <div className="space-y-2">
//                   <p className="text-xs text-muted-foreground">Salas públicas disponíveis</p>
//                   <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
//                     {publicRooms.map((r) => (
//                       <div
//                         key={r.room_id}
//                         className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-950/60 px-2 py-1.5 text-xs"
//                       >
//                         <div className="flex flex-col">
//                           <span className="font-medium text-slate-100">
//                             Sala #{r.room_id.slice(0, 8)}
//                           </span>
//                           <span className="text-[11px] text-muted-foreground">
//                             Jogadores: {r.players?.length ?? 0}
//                           </span>
//                         </div>
//                         <Button
//                           size="xs"
//                           variant="outline"
//                           onClick={() => handleJoinByCode(r.room_id)}
//                         >
//                           Entrar
//                         </Button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </>
//             )}
//           </CardContent>
//         </Card>
//       )}
//
//       {room && (
//         <Card className="glass border-border/60 bg-slate-900/60">
//           <CardHeader>
//             <CardTitle className="flex items-center justify-between">
//               <span>Sala #{room.room_id.slice(0, 8)}</span>
//               {isHost && (
//                 <span className="text-xs text-muted-foreground">
//                   Você é o host — compartilhe o ID com amigos
//                 </span>
//               )}
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-3">
//             <div className="flex flex-wrap gap-2 text-sm">
//               <span className="font-medium text-muted-foreground">Jogadores:</span>
//               {playersInRoom.map((p) => (
//                 <span
//                   key={p.user_id}
//                   className={cn(
//                     'rounded-full px-2 py-0.5 text-xs',
//                     p.user_id === room.host_user_id
//                       ? 'bg-purple-600/30 text-purple-100'
//                       : 'bg-slate-700/60 text-slate-100'
//                   )}
//                 >
//                   {p.user_id === userId ? 'Você' : p.user_id.split('@')[0]}
//                   {p.user_id === room.host_user_id ? ' (host)' : ''}
//                 </span>
//               ))}
//             </div>
//
//             {isHost && !matchState && (
//               <Button
//                 size="sm"
//                 onClick={handleStartGame}
//                 disabled={isLoading || playersInRoom.length < 2}
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                     Iniciando partida...
//                   </>
//                 ) : playersInRoom.length < 2 ? (
//                   'Aguardando pelo menos 2 jogadores'
//                 ) : (
//                   'Iniciar partida'
//                 )}
//               </Button>
//             )}
//           </CardContent>
//         </Card>
//       )}
//
//       {matchState && (
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.3 }}
//           className="space-y-4"
//         >
//           <Card className="glass border-purple-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
//             <CardHeader>
//               <CardTitle className="flex items-center justify-between gap-4 text-base sm:text-lg">
//                 <span>Estado da partida</span>
//                 <span className="text-xs font-normal text-muted-foreground">
//                   Vez de:{' '}
//                   <span className="font-semibold text-purple-300">
//                     {matchState.currentTurnUserId === userId
//                       ? 'Você'
//                       : matchState.currentTurnUserId.split('@')[0]}
//                   </span>
//                 </span>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
//                 <span
//                   className={cn(
//                     'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
//                     matchState.direction === 1
//                       ? 'bg-emerald-700/60 text-emerald-100'
//                       : 'bg-amber-700/60 text-amber-100'
//                   )}
//                 >
//                   Direção: {matchState.direction === 1 ? '↻ horário' : '↺ anti-horário'}
//                 </span>
//                 <span className="inline-flex items-center rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-100">
//                   Cor atual:{' '}
//                   <span className="ml-1 inline-flex h-3 w-3 rounded-full border border-white/40">
//                     <span
//                       className={cn(
//                         'h-full w-full rounded-full',
//                         matchState.currentColor === 'red' && 'bg-red-500',
//                         matchState.currentColor === 'yellow' && 'bg-yellow-400',
//                         matchState.currentColor === 'green' && 'bg-emerald-500',
//                         matchState.currentColor === 'blue' && 'bg-sky-500',
//                         matchState.currentColor === 'wild' && 'bg-gradient-to-r from-red-500 via-yellow-400 to-sky-500'
//                       )}
//                     />
//                   </span>
//                 </span>
//                 {matchState.pendingDraw > 0 && (
//                   <span className="inline-flex items-center rounded-full bg-rose-700/70 px-2 py-0.5 text-[10px] font-semibold text-rose-100">
//                     Compra pendente: +{matchState.pendingDraw}
//                   </span>
//                 )}
//               </div>
//
//               <div className="flex flex-wrap items-center gap-4">
//                 <div className="space-y-1">
//                   <p className="text-xs text-muted-foreground">Topo do descarte</p>
//                   <div className="flex items-center gap-2">
//                     {(() => {
//                       const card = matchState.discardTop;
//                       const [rawColor, value] = card.split('-');
//                       const colorMap: Record<string, string> = {
//                         R: 'bg-red-600/80 border-red-400',
//                         Y: 'bg-yellow-500/80 border-yellow-300',
//                         G: 'bg-emerald-600/80 border-emerald-400',
//                         B: 'bg-sky-600/80 border-sky-400',
//                         W: 'bg-slate-800/80 border-purple-400',
//                       };
//                       const cKey = rawColor === 'W' ? 'W' : rawColor;
//                       const label =
//                         card === 'W'
//                           ? 'WILD'
//                           : card === 'W+4'
//                           ? '+4'
//                           : value === 'SKIP'
//                           ? '⛔'
//                           : value === 'REVERSE'
//                           ? '↺'
//                           : value === '+2'
//                           ? '+2'
//                           : value;
//
//                       return (
//                         <div
//                           className={cn(
//                             'relative flex h-24 w-16 items-center justify-center rounded-xl border-2 shadow-lg text-white text-xl font-bold select-none',
//                             colorMap[cKey] || 'bg-slate-700/80 border-slate-400'
//                           )}
//                         >
//                           <span className="drop-shadow-md">{label}</span>
//                           <span className="absolute inset-1 rounded-lg border border-white/20" />
//                         </div>
//                       );
//                     })()}
//                   </div>
//                 </div>
//                 <div className="space-y-1">
//                   <p className="text-xs text-muted-foreground">Baralho</p>
//                   <p className="text-xs font-medium text-slate-200">
//                     Cartas restantes: {matchState.drawPile.length}
//                   </p>
//                 </div>
//               </div>
//
//               <div className="space-y-1">
//                 <p className="text-xs text-muted-foreground">Mãos dos jogadores</p>
//                 <div className="flex flex-wrap gap-2 text-xs">
//                   {Object.entries(matchState.hands).map(([pid, cards]) => (
//                     <span
//                       key={pid}
//                       className={cn(
//                         'rounded-full px-2 py-0.5',
//                         pid === userId ? 'bg-purple-700/60 text-purple-50' : 'bg-slate-800/70 text-slate-100'
//                       )}
//                     >
//                       {pid === userId ? 'Você' : pid.split('@')[0]}: {cards.length} cartas
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//
//           <Card className="glass border-slate-600/70 bg-slate-900/70">
//             <CardHeader>
//               <CardTitle className="text-base sm:text-lg">Sua mão</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <div className="flex flex-wrap gap-2">
//                 {myHand.map((card) =>
//                   (() => {
//                     const playable = !!(matchState && canPlayClient(card, matchState));
//                     const clickable = playable && !!isMyTurn;
//                     return renderCard(
//                       card,
//                       clickable,
//                       clickable
//                         ? () => {
//                             if (!matchState || !isMyTurn) return;
//                             if (card === 'W' || card === 'W+4') {
//                               const color = window.prompt(
//                                 'Escolha a cor (red, yellow, green, blue):',
//                                 'red'
//                               );
//                               if (!color) return;
//                               sendPlayCard(card, color.toLowerCase());
//                             } else {
//                               sendPlayCard(card);
//                             }
//                           }
//                         : undefined
//                     );
//                   })()
//                 )}
//                 {myHand.length === 0 && (
//                   <p className="text-xs text-muted-foreground">
//                     Você não tem cartas — se isso aconteceu, a partida deve encerrar em breve.
//                   </p>
//                 )}
//               </div>
//
//               <div className="flex flex-wrap gap-2">
//                 <Button
//                   size="sm"
//                   variant="secondary"
//                   disabled={!isMyTurn}
//                   onClick={sendDrawCard}
//                 >
//                   Comprar carta
//                 </Button>
//                 <Button size="sm" variant="outline" disabled={!isMyTurn} onClick={sendPassTurn}>
//                   Passar vez
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </motion.div>
//       )}
//     </div>
//   );
// }
