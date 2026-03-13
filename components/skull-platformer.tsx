'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

const CELL = 16;
const TUNNEL_ROW = 9;
const SKULL_SPEED = 1.9;
const ENEMY_SPEED = 0.9;
const POWER_DURATION = 360;

// 0=dot, 1=wall, 2=power, 3=empty
const MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,2,1],
  [1,0,1,1,1,0,1,1,0,1,0,1,1,0,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
  [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,0,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,1],
  [1,1,1,1,1,0,1,1,1,3,1,1,1,0,1,1,1,0,1,0,1],
  [3,3,3,3,0,0,0,0,0,3,0,0,0,0,0,0,0,0,1,0,1],
  [1,1,1,1,1,0,1,1,1,2,1,1,1,1,1,0,1,0,1,0,1],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
  [1,0,1,1,1,0,1,1,1,1,1,1,1,0,1,0,1,0,1,1,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,1,1,0,1,0,1,1,1,3,1,1,1,0,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
  [1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,0,1],
  [1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

interface Enemy {
  x: number;
  y: number;
  dir: number;
  homeX: number;
  homeY: number;
  color: string;
  dead: boolean;
  respawnTimer: number;
  deathX?: number;
  deathY?: number;
  respawnImmunity?: number;
}

export function SkullPlatformer() {
  const { token } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [started, setStarted] = useState(false);
  const [rewardSaved, setRewardSaved] = useState(false);
  const rewardSentRef = useRef(false);
  const gameStateRef = useRef({
    maze: MAZE.map(row => [...row]),
    skullX: CELL * 1.5,
    skullY: CELL * 9.5,
    skullDir: 0,
    nextDir: 0,
    powerTimer: 0,
    enemies: [] as Enemy[],
    totalDots: 0,
    score: 0,
  });

  const keysRef = useRef<Record<string, boolean>>({});
  const touchDirRef = useRef<number>(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isMobileRef = useRef(false);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const startedRef = useRef(started);
  const gameOverRef = useRef(gameOver);
  const wonRef = useRef(won);
  startedRef.current = started;
  gameOverRef.current = gameOver;
  wonRef.current = won;

  const initLevel = useCallback(() => {
    const maze = MAZE.map(row => row.map(c => (c === 1 ? 1 : c === 2 ? 2 : c === 0 ? 0 : 3)));
    let totalDots = 0;
    maze.forEach(row => row.forEach(c => { if (c === 0 || c === 2) totalDots++; }));

    const enemies: Enemy[] = [
      { x: CELL * 9.5, y: CELL * 9.5, dir: 0, homeX: 9, homeY: 9, color: '#ef4444', dead: false, respawnTimer: 0 },
      { x: CELL * 10.5, y: CELL * 9.5, dir: 0, homeX: 10, homeY: 9, color: '#eab308', dead: false, respawnTimer: 0 },
      { x: CELL * 11.5, y: CELL * 9.5, dir: 0, homeX: 11, homeY: 9, color: '#06b6d4', dead: false, respawnTimer: 0 },
      { x: CELL * 8.5, y: CELL * 9.5, dir: 0, homeX: 8, homeY: 9, color: '#22c55e', dead: false, respawnTimer: 0 },
    ];

    gameStateRef.current = {
      maze,
      skullX: CELL * 1.5,
      skullY: CELL * 9.5,
      skullDir: 0,
      nextDir: 0,
      powerTimer: 0,
      enemies,
      totalDots,
      score: 0,
    };
    setScore(0);
    setGameOver(false);
    setWon(false);
    setRewardSaved(false);
    rewardSentRef.current = false;
  }, []);

  useEffect(() => {
    initLevel();
  }, [initLevel]);

  useEffect(() => {
    if ((gameOver || won) && token && !rewardSentRef.current) {
      rewardSentRef.current = true;
      const s = gameStateRef.current.score;
      const reward = gameOver ? s - 300 : s + 1000;
      api.aura.gameReward(token, 'skull-chase', reward).then(res => {
        if (res.success) setRewardSaved(true);
      }).catch(() => {});
    }
  }, [gameOver, won, token]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const COLS = MAZE[0].length;
    const ROWS = MAZE.length;
    const W = COLS * CELL;
    const H = ROWS * CELL;

    const isWall = (c: number, r: number) => {
      if (r < 0 || r >= ROWS) return true;
      if (c < 0 || c >= COLS) return r !== TUNNEL_ROW;
      return gameStateRef.current.maze[r][c] === 1;
    };

    const handleResize = () => {
      const parent = containerRef.current;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
    };
    handleResize();
    const ro = new ResizeObserver(handleResize);
    const el = containerRef.current;
    if (el) ro.observe(el);
    window.addEventListener('resize', handleResize);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(handleResize, 100);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's'].includes(e.key)) {
        e.preventDefault();
        keysRef.current[e.key] = true;
        if (!startedRef.current) setStarted(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    isMobileRef.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const container = containerRef.current;
    const SWIPE_MIN = 25;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        if (!startedRef.current) setStarted(true);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current || e.touches.length === 0) return;
      const dx = e.touches[0].clientX - touchStartRef.current.x;
      const dy = e.touches[0].clientY - touchStartRef.current.y;
      if (Math.abs(dx) > SWIPE_MIN || Math.abs(dy) > SWIPE_MIN) {
        if (Math.abs(dx) > Math.abs(dy)) {
          touchDirRef.current = dx > 0 ? 2 : 1;
        } else {
          touchDirRef.current = dy > 0 ? 4 : 3;
        }
      }
    };
    const handleTouchEnd = () => {
      touchStartRef.current = null;
    };
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: true });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = (now: number = 0) => {
      const state = gameStateRef.current;
      const cw = canvas.width;
      const ch = canvas.height;

      const delta = lastTimeRef.current ? now - lastTimeRef.current : 16.67;
      lastTimeRef.current = now;
      const mult = Math.min(delta / 16.67, 4);

      if (startedRef.current && !gameOverRef.current && !wonRef.current) {
        const skullSpeed = SKULL_SPEED * mult;
        const enemySpeed = ENEMY_SPEED * mult;

        // 0=none, 1=left, 2=right, 3=up, 4=down
        state.nextDir = 0;
        if (keysRef.current['ArrowLeft'] || keysRef.current['a']) state.nextDir = 1;
        if (keysRef.current['ArrowRight'] || keysRef.current['d']) state.nextDir = 2;
        if (keysRef.current['ArrowUp'] || keysRef.current['w']) state.nextDir = 3;
        if (keysRef.current['ArrowDown'] || keysRef.current['s']) state.nextDir = 4;
        if (touchDirRef.current) state.nextDir = touchDirRef.current;

        const dirVec: [number,number][] = [[0,0], [-1,0], [1,0], [0,-1], [0,1]];
        const col = Math.floor(state.skullX / CELL);
        const row = Math.floor(state.skullY / CELL);
        const cx = (col + 0.5) * CELL;
        const cy = (row + 0.5) * CELL;
        const atCenter = Math.abs(state.skullX - cx) <= skullSpeed * 1.5 &&
                          Math.abs(state.skullY - cy) <= skullSpeed * 1.5;

        if (state.nextDir !== 0 && state.nextDir !== state.skullDir && atCenter) {
          const [ndx, ndy] = dirVec[state.nextDir];
          if (!isWall(col + ndx, row + ndy)) {
            state.skullDir = state.nextDir;
            state.skullX = cx;
            state.skullY = cy;
          }
        }

        if (state.skullDir !== 0) {
          const [dx, dy] = dirVec[state.skullDir];
          let nx = state.skullX + dx * skullSpeed;
          let ny = state.skullY + dy * skullSpeed;

          if (dx !== 0) ny = cy;
          if (dy !== 0) nx = cx;

          const aCol = col + (dx > 0 ? 1 : dx < 0 ? -1 : 0);
          const aRow = row + (dy > 0 ? 1 : dy < 0 ? -1 : 0);
          if (dx !== 0 && row === TUNNEL_ROW && (aCol === -1 || aCol === COLS)) {
            nx = aCol === -1 ? (COLS - 0.5) * CELL : 0.5 * CELL;
          } else if (isWall(aCol, aRow)) {
            if (dx > 0) nx = Math.min(nx, cx);
            else if (dx < 0) nx = Math.max(nx, cx);
            if (dy > 0) ny = Math.min(ny, cy);
            else if (dy < 0) ny = Math.max(ny, cy);
          }

          state.skullX = nx;
          state.skullY = ny;
          if (row === TUNNEL_ROW) {
            if (state.skullX < 0) state.skullX += W;
            if (state.skullX >= W) state.skullX -= W;
          }
        }

        const dotCol = Math.floor(state.skullX / CELL);
        const dotRow = Math.floor(state.skullY / CELL);
        if (dotRow >= 0 && dotRow < ROWS && dotCol >= 0 && dotCol < COLS) {
          const cell = state.maze[dotRow][dotCol];
          if (cell === 0) {
            state.maze[dotRow][dotCol] = 3;
            state.score += 10;
            setScore(state.score);
            state.totalDots--;
          } else if (cell === 2) {
            state.maze[dotRow][dotCol] = 3;
            state.powerTimer = POWER_DURATION;
            for (const en of state.enemies) en.respawnImmunity = 0;
            state.score += 50;
            setScore(state.score);
            state.totalDots--;
          }
        }

        if (state.powerTimer > 0) state.powerTimer -= mult;

        const opposite = [0, 2, 1, 4, 3];
        const pickDir = (opts: number[], tx: number, ty: number, ec: number, er: number, closest: boolean) => {
          let best = opts[0], bv = closest ? 99999 : -1;
          for (const d of opts) {
            const [ddx, ddy] = dirVec[d];
            const dist = Math.hypot((ec + ddx + 0.5) * CELL - tx, (er + ddy + 0.5) * CELL - ty);
            if (closest ? dist < bv : dist > bv) { bv = dist; best = d; }
          }
          return best;
        };

        for (let ei = 0; ei < state.enemies.length; ei++) {
          const e = state.enemies[ei];
          if (e.dead) {
            e.respawnTimer -= mult;
            if (e.respawnTimer <= 0) {
              e.dead = false;
              e.x = e.homeX * CELL + CELL / 2;
              e.y = e.homeY * CELL + CELL / 2;
              e.dir = 0;
              e.respawnImmunity = state.powerTimer;
            }
            continue;
          }

          const eCol = Math.floor(e.x / CELL);
          const eRow = Math.floor(e.y / CELL);
          const eCx = (eCol + 0.5) * CELL;
          const eCy = (eRow + 0.5) * CELL;
          const eAtCenter = Math.abs(e.x - eCx) < enemySpeed * 0.5 &&
                            Math.abs(e.y - eCy) < enemySpeed * 0.5;

          if (eAtCenter) {
            e.x = eCx;
            e.y = eCy;
            const vulnerable = state.powerTimer > 0;
            const opts: number[] = [];
            for (let d = 1; d <= 4; d++) {
              if (d === opposite[e.dir]) continue;
              const [ddx, ddy] = dirVec[d];
              if (!isWall(eCol + ddx, eRow + ddy)) opts.push(d);
            }
            if (opts.length === 0) {
              for (let d = 1; d <= 4; d++) {
                const [ddx, ddy] = dirVec[d];
                if (!isWall(eCol + ddx, eRow + ddy)) opts.push(d);
              }
            }

            if (opts.length > 0) {
              if (vulnerable) {
                e.dir = pickDir(opts, state.skullX, state.skullY, eCol, eRow, false);
              } else if (ei === 0) {
                e.dir = Math.random() < 0.4
                  ? opts[Math.floor(Math.random() * opts.length)]
                  : pickDir(opts, state.skullX, state.skullY, eCol, eRow, true);
              } else if (ei === 1) {
                const [pdx, pdy] = dirVec[state.skullDir];
                e.dir = Math.random() < 0.3
                  ? opts[Math.floor(Math.random() * opts.length)]
                  : pickDir(opts, state.skullX + pdx * CELL * 3, state.skullY + pdy * CELL * 3, eCol, eRow, true);
              } else if (ei === 2) {
                e.dir = opts[Math.floor(Math.random() * opts.length)];
              } else {
                const d = Math.hypot(e.x - state.skullX, e.y - state.skullY);
                e.dir = d < CELL * 5
                  ? pickDir(opts, state.skullX, state.skullY, eCol, eRow, true)
                  : opts[Math.floor(Math.random() * opts.length)];
              }
            }
          }

          if (e.dir !== 0) {
            const [edx, edy] = dirVec[e.dir];
            let enx = e.x + edx * enemySpeed;
            let eny = e.y + edy * enemySpeed;
            if (edx !== 0) eny = eCy;
            if (edy !== 0) enx = eCx;
            const eaCol = eCol + (edx > 0 ? 1 : edx < 0 ? -1 : 0);
            const eaRow = eRow + (edy > 0 ? 1 : edy < 0 ? -1 : 0);
            if (edx !== 0 && eRow === TUNNEL_ROW && (eaCol === -1 || eaCol === COLS)) {
              enx = eaCol === -1 ? (COLS - 0.5) * CELL : 0.5 * CELL;
            } else if (isWall(eaCol, eaRow)) {
              if (edx > 0) enx = Math.min(enx, eCx);
              else if (edx < 0) enx = Math.max(enx, eCx);
              if (edy > 0) eny = Math.min(eny, eCy);
              else if (edy < 0) eny = Math.max(eny, eCy);
            }
            e.x = enx;
            e.y = eny;
            if (eRow === TUNNEL_ROW) {
              if (e.x < 0) e.x += W;
              if (e.x >= W) e.x -= W;
            }
          }

          const dist = Math.hypot(state.skullX - e.x, state.skullY - e.y);
          if (dist < CELL * 0.6) {
            if (state.powerTimer > 0 && (e.respawnImmunity ?? 0) <= 0) {
              e.dead = true;
              e.deathX = e.x;
              e.deathY = e.y;
              e.respawnTimer = 120;
              state.score += 20;
              setScore(state.score);
            } else {
              setGameOver(true);
            }
          }
        }

        if (state.totalDots <= 0) setWon(true);
      }

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, cw, ch);

      const scale = Math.min(cw / W, ch / H);
      const offX = (cw - W * scale) / 2;
      const offY = (ch - H * scale) / 2;
      ctx.save();
      ctx.translate(offX, offY);
      ctx.scale(scale, scale);

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cell = state.maze[r][c];
          const x = c * CELL;
          const y = r * CELL;
          if (cell === 1) {
            ctx.fillStyle = '#1e3a5f';
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4);
            ctx.strokeRect(x + 2, y + 2, CELL - 4, CELL - 4);
          } else if (cell === 0) {
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.arc(x + CELL/2, y + CELL/2, 3, 0, Math.PI * 2);
            ctx.fill();
          } else if (cell === 2) {
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(x + CELL/2, y + CELL/2, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
      }

      for (const e of state.enemies) {
        if (e.dead) {
          const homePx = e.homeX * CELL + CELL / 2;
          const homePy = e.homeY * CELL + CELL / 2;
          const fromX = e.deathX ?? e.x;
          const fromY = e.deathY ?? e.y;
          const total = 120;
          const t = 1 - e.respawnTimer / total;
          const shakePhase = Math.min(1, e.respawnTimer / 25);
          const shake = shakePhase * (Math.sin(e.respawnTimer * 0.8) * 2 + Math.cos(e.respawnTimer * 0.6) * 2);
          const flyT = t < 0.2 ? 0 : (t - 0.2) / 0.8;
          const easeFly = 1 - (1 - flyT) * (1 - flyT);
          const ax = fromX + (homePx - fromX) * easeFly + shake;
          const ay = fromY + (homePy - fromY) * easeFly + shake * 0.5;
          const alpha = 0.5 + 0.5 * t;
          const scale = 1 + (1 - shakePhase) * 0.3;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(ax, ay);
          ctx.scale(scale, scale);
          ctx.fillStyle = shakePhase > 0 ? '#ef4444' : e.color;
          ctx.strokeStyle = shakePhase > 0 ? '#dc2626' : '#1f2937';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, CELL/2 - 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          if (shakePhase > 0) {
            ctx.strokeStyle = '#fca5a5';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-3, -2);
            ctx.lineTo(1, 1);
            ctx.moveTo(3, -2);
            ctx.lineTo(-1, 1);
            ctx.stroke();
          }
          ctx.restore();
          continue;
        }
        const v = state.powerTimer > 0 && (e.respawnImmunity ?? 0) <= 0;
        ctx.fillStyle = v ? '#6366f1' : e.color;
        ctx.beginPath();
        ctx.arc(e.x, e.y, CELL/2 - 2, 0, Math.PI * 2);
        ctx.fill();
        if (v) {
          ctx.strokeStyle = '#818cf8';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      const sx = state.skullX;
      const sy = state.skullY;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.fillStyle = '#f5f5f4';
      ctx.strokeStyle = '#a8a29e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, -2, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.ellipse(-4.5, -4, 2.5, 3.2, 0, 0, Math.PI * 2);
      ctx.ellipse(4.5, -4, 2.5, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-1.5, 2);
      ctx.lineTo(0, 0);
      ctx.lineTo(1.5, 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#292524';
      ctx.fillRect(-6, 5, 12, 3);
      ctx.fillStyle = '#f5f5f4';
      for (let i = -2; i <= 2; i++) {
        ctx.fillRect(i * 2.5 - 0.6, 5.2, 1, 2);
      }
      ctx.restore();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 18px system-ui';
      ctx.fillText(`Aura: ${state.score}`, 12, 24);
      if (state.powerTimer > 0) {
        ctx.fillStyle = '#6366f1';
        ctx.fillText('PODER!', 12, 44);
      }

      ctx.restore();

      if (!startedRef.current) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, cw, ch);
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        if (isMobileRef.current) {
          ctx.font = 'bold 44px system-ui';
          ctx.fillText('Skull Chase', cw / 2, ch / 2 - 70);
          ctx.font = 'bold 34px system-ui';
          ctx.fillText('Arraste o dedo para mover', cw / 2, ch / 2 - 15);
          const cx = cw / 2, cy = ch / 2 + 55, s = 28;
          ctx.fillStyle = 'rgba(248,250,252,0.9)';
          ctx.strokeStyle = 'rgba(148,163,184,0.8)';
          ctx.lineWidth = 2;
          [[cx - s, cy, Math.PI], [cx + s, cy, 0], [cx, cy - s, -Math.PI/2], [cx, cy + s, Math.PI/2]].forEach(([x, y, rot]) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rot);
            ctx.beginPath();
            ctx.moveTo(-14, -9); ctx.lineTo(-14, 9); ctx.lineTo(7, 0); ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          });
          ctx.fillStyle = '#f8fafc';
          ctx.font = '26px system-ui';
          ctx.fillText('Colete as bolinhas. Poder = inimigos vulneráveis!', cw / 2, ch / 2 + 115);
          ctx.font = 'bold 30px system-ui';
          ctx.fillText('Toque para começar', cw / 2, ch / 2 + 160);
        } else {
          ctx.font = 'bold 22px system-ui';
          ctx.fillText('Skull Chase', cw / 2, ch / 2 - 30);
          ctx.font = '14px system-ui';
          ctx.fillText('← → ↑ ↓ ou WASD para mover', cw / 2, ch / 2 + 5);
          ctx.fillText('Colete as bolinhas. Poder = inimigos vulneráveis!', cw / 2, ch / 2 + 30);
          ctx.fillText('Pressione qualquer tecla para começar', cw / 2, ch / 2 + 60);
        }
        ctx.textAlign = 'left';
      }

      if (gameOverRef.current) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, cw, ch);
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'center';
        if (isMobileRef.current) {
          ctx.font = 'bold 48px system-ui';
          ctx.fillText('Game Over!', cw / 2, ch / 2 - 55);
          ctx.fillStyle = '#f8fafc';
          ctx.font = '30px system-ui';
          ctx.fillText(`+${state.score} - 300 = ${state.score - 300} aura`, cw / 2, ch / 2 + 5);
          if (rewardSaved) {
            ctx.fillStyle = '#22c55e';
            ctx.font = '26px system-ui';
            ctx.fillText('✓ Aura atualizada na sua conta', cw / 2, ch / 2 + 55);
          }
          ctx.fillStyle = '#94a3b8';
          ctx.font = '30px system-ui';
          ctx.fillText('Toque para jogar novamente', cw / 2, ch / 2 + 105);
        } else {
          ctx.font = 'bold 28px system-ui';
          ctx.fillText('Game Over!', cw / 2, ch / 2 - 30);
          ctx.fillStyle = '#f8fafc';
          ctx.font = '18px system-ui';
          ctx.fillText(`+${state.score} - 300 = ${state.score - 300} aura`, cw / 2, ch / 2 + 5);
          if (rewardSaved) {
            ctx.fillStyle = '#22c55e';
            ctx.font = '13px system-ui';
            ctx.fillText('✓ Aura atualizada na sua conta', cw / 2, ch / 2 + 28);
          }
          ctx.fillStyle = '#94a3b8';
          ctx.font = '14px system-ui';
          ctx.fillText('Clique para jogar novamente', cw / 2, ch / 2 + 55);
        }
        ctx.textAlign = 'left';
      }

      if (wonRef.current) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, cw, ch);
        ctx.fillStyle = '#22c55e';
        ctx.textAlign = 'center';
        if (isMobileRef.current) {
          ctx.font = 'bold 48px system-ui';
          ctx.fillText('Você venceu!', cw / 2, ch / 2 - 55);
          ctx.fillStyle = '#f8fafc';
          ctx.font = '30px system-ui';
          ctx.fillText(`+${state.score + 1000} aura`, cw / 2, ch / 2 + 5);
          if (rewardSaved) {
            ctx.fillStyle = '#22c55e';
            ctx.font = '26px system-ui';
            ctx.fillText('✓ Aura adicionada à sua conta', cw / 2, ch / 2 + 55);
          }
          ctx.fillStyle = '#94a3b8';
          ctx.font = '30px system-ui';
          ctx.fillText('Toque para jogar novamente', cw / 2, ch / 2 + 105);
        } else {
          ctx.font = 'bold 28px system-ui';
          ctx.fillText('Você venceu!', cw / 2, ch / 2 - 30);
          ctx.fillStyle = '#f8fafc';
          ctx.font = '18px system-ui';
          ctx.fillText(`+${state.score + 1000} aura`, cw / 2, ch / 2 + 5);
          if (rewardSaved) {
            ctx.fillStyle = '#22c55e';
            ctx.font = '13px system-ui';
            ctx.fillText('✓ Aura adicionada à sua conta', cw / 2, ch / 2 + 28);
          }
          ctx.fillStyle = '#94a3b8';
          ctx.font = '14px system-ui';
          ctx.fillText('Clique para jogar novamente', cw / 2, ch / 2 + 55);
        }
        ctx.textAlign = 'left';
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop(performance.now());

    return () => {
      ro.disconnect();
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const handleRestart = () => {
    if (gameOver || won) {
      initLevel();
      setStarted(true);
    }
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch {
      // Fullscreen not supported
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/jogos" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar aos jogos
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          className="gap-2"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-4 h-4" />
              Sair da tela cheia
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4" />
              Tela cheia
            </>
          )}
        </Button>
      </div>

      <div
        ref={containerRef}
        className={cn(
          'rounded-xl overflow-hidden border-2 border-slate-600/50 bg-slate-900/50 shadow-xl flex items-center justify-center bg-slate-900',
          !isFullscreen ? 'w-[336px] h-[304px]' : 'w-screen h-screen max-w-[100vw] max-h-[100vh]',
          (gameOver || won) && 'cursor-pointer'
        )}
        onClick={() => (gameOver || won) && handleRestart()}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
          style={{ display: 'block' }}
        />
      </div>

      <p className="text-sm text-muted-foreground">
        Colete todas as bolinhas. As bolas de poder deixam os inimigos vulneráveis — coma-os para pontos extras!
      </p>
    </div>
  );
}
