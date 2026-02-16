/**
 * Dados do sistema de Aura (espelhados de BreakerBot/src/commands/aura/auraCommand.js)
 * para exibição no frontend.
 */

export interface AuraTier {
  minPoints: number;
  name: string;
}

export interface MissionConfig {
  id: string;
  target: number;
  reward: number;
  label: string;
}

export interface RandomEvent {
  id: string;
  chance: number;
  message: string;
  command: string;
  type: 'first' | 'all';
  durationMs: number;
  effectSummary: string;
}

export const AURA_TIERS: AuraTier[] = [
  { minPoints: 50000, name: 'Deus do chat' },
  { minPoints: 10000, name: 'Entidade' },
  { minPoints: 5000, name: 'Sigma' },
  { minPoints: 2000, name: 'Dominante' },
  { minPoints: 500, name: 'Presença' },
  { minPoints: 0, name: 'NPC' },
];

export const MISSION_CONFIG: MissionConfig[] = [
  { id: 'messages_500', target: 500, reward: 1000, label: 'Mande 500 mensagens' },
  { id: 'reactions_500', target: 500, reward: 2000, label: 'Reaja 500x com 💀 ou ☠️' },
  { id: 'duel_win', target: 1, reward: 1000, label: 'Vença 1 duelo (!mog)' },
  { id: 'survive_attack', target: 1, reward: 2000, label: 'Sobreviva a um ataque (!mognow)' },
  { id: 'send_media', target: 1, reward: 200, label: 'Envie mídia (figurinha/vídeo/imagem/doc)' },
  { id: 'help_someone', target: 1, reward: 100, label: 'Ajude alguém (!respeito)' },
];

export const RANDOM_EVENTS: RandomEvent[] = [
  { id: 'energia_rara', chance: 0.30, message: '💠 Uma energia rara apareceu no chat!', command: '!absorver', type: 'first', durationMs: 60000, effectSummary: '+200 aura' },
  { id: 'fenda', chance: 0.14, message: '⚡ Uma fenda dimensional abriu!', command: '!entrar', type: 'all', durationMs: 45000, effectSummary: '+50 aura (todos)' },
  { id: 'cristal', chance: 0.11, message: '💎 Um cristal de aura surgiu!', command: '!pegar', type: 'first', durationMs: 50000, effectSummary: '+150 aura' },
  { id: 'vento', chance: 0.10, message: '🌬️ Um vento favorável passa pelo grupo!', command: '!aproveitar', type: 'first', durationMs: 55000, effectSummary: '+100 aura' },
  { id: 'oferenda', chance: 0.08, message: '👑 Os deuses deixaram uma oferenda!', command: '!aceitar', type: 'first', durationMs: 60000, effectSummary: '+300 aura' },
  { id: 'pocao', chance: 0.06, message: '🧪 Uma poção brilhante apareceu!', command: '!beber', type: 'first', durationMs: 40000, effectSummary: '+80 aura' },
  { id: 'espirito', chance: 0.05, message: '👻 O espírito do grupo se manifesta!', command: '!invocar', type: 'all', durationMs: 60000, effectSummary: '+30 aura (todos)' },
  { id: 'armadilha', chance: 0.04, message: '🕳️ Uma armadilha sombria está ativa!', command: '!tocar', type: 'first', durationMs: 50000, effectSummary: '-100 aura' },
  { id: 'fenda_maldita', chance: 0.03, message: '💀 Uma fenda maldita se abre!', command: '!entrar', type: 'first', durationMs: 45000, effectSummary: '-150 aura' },
  { id: 'caixa', chance: 0.03, message: '📦 Uma caixa misteriosa apareceu!', command: '!abrir', type: 'first', durationMs: 50000, effectSummary: 'Sorte ou azar' },
  { id: 'ruina', chance: 0.02, message: '🏛️ Ruínas antigas emanam energia!', command: '!explorar', type: 'first', durationMs: 55000, effectSummary: '+200 ou -100 aura' },
  { id: 'nuvem', chance: 0.02, message: '☁️ Uma nuvem de aura pairou no chat!', command: '!respirar', type: 'all', durationMs: 40000, effectSummary: '+40 aura (todos)' },
  { id: 'meteoro', chance: 0.01, message: '☄️ Um meteoro de aura está caindo!', command: '!pegar', type: 'first', durationMs: 45000, effectSummary: '+250 aura' },
  { id: 'ilusao', chance: 0.01, message: '🪞 Uma ilusão perigosa apareceu!', command: '!tocar', type: 'first', durationMs: 40000, effectSummary: '-50 aura' },
  { id: 'emanar', chance: 0.01, message: '🌟 Uma aura poderosa está emanando no chat!', command: '!emanar', type: 'first', durationMs: 55000, effectSummary: '+180 aura' },
  { id: 'manifestar', chance: 0.01, message: '👁️ Uma presença quer se manifestar no grupo!', command: '!manifestar', type: 'all', durationMs: 50000, effectSummary: '+60 aura (todos)' },
];

export const EVENT_SPAWN_CHANCE = 0.012;
export const EVENT_COOLDOWN_MS = 2 * 60 * 1000;
export const MOG_DURATION_MS = 15000;
export const MOGNOW_COUNTDOWN_SEC = 5;
export const MOGNOW_WINDOW_MS = 15000;

export interface AuraCommandItem {
  command: string;
  description: string;
  cooldown?: string;
}

export const AURA_COMMANDS_ACTION: AuraCommandItem[] = [
  { command: '!meditar', description: 'Chance de ganhar 0, 10, 20, 30, 40 ou 50 aura', cooldown: 'Sem cooldown' },
  { command: '!treinar', description: '50% +500 aura, 50% -1000 aura', cooldown: '1 hora' },
  { command: '!dominar', description: '50% +1000 aura, 50% nada', cooldown: '12 horas' },
  { command: '!ritual', description: '50% +5000 ou 50% -5000 aura', cooldown: 'Uma vez por dia' },
  { command: '!respeito @usuario', description: 'Transfere 50 de sua aura para a pessoa (precisa de 50+ aura)' },
  { command: '!elogiar @usuario', description: 'Dá +100 aura ao elogiado (sem tirar de você)' },
  { command: '!provocar @usuario', description: 'Mensagem de provocação' },
  { command: '!elogiados me', description: 'Lista quem te elogiou' },
  { command: '!elogiados @usuario', description: 'Lista quem elogiou a pessoa' },
];

export const AURA_COMMANDS_DUEL: AuraCommandItem[] = [
  { command: '!mog @usuario', description: 'Desafia para duelo. O desafiado usa !mog aceitar. Em 15s quem mandar mais mensagens vence e ganha 500 aura' },
  { command: '!mognow @usuario', description: 'Ataca alguém. Em 15s: se o alvo mandar mais mensagens, ganha 500 aura; se o atacante ganhar, recebe 5 aura' },
  { command: '!aura farmar @usuario', description: '50% você tira 100 do alvo e ganha 100; 50% você perde 200 aura' },
];

export const AURA_COMMANDS_AURA: AuraCommandItem[] = [
  { command: '!aura', description: 'Guia completo (tudo sobre aura)' },
  { command: '!aura info me', description: 'Suas informações (aura, nível, personagem, missões)' },
  { command: '!aura info @usuario', description: 'Informações de aura de outra pessoa' },
  { command: '!aura figurinha', description: 'Definir figurinha de aura (com figurinha anexada). Usar essa figurinha dá 50% de +100 aura' },
  { command: '!aura personagem "nome"', description: 'Definir seu personagem' },
  { command: '!aura missoes', description: 'Ver suas 3 missões do dia (reset 00:00)' },
  { command: '!aura ranking', description: 'Top 10 global por aura' },
];

function stripMarkdown(text: string): string {
  return text.replace(/\*([^*]+)\*/g, '$1').trim();
}

export function formatEventMessage(msg: string): string {
  return stripMarkdown(msg);
}
