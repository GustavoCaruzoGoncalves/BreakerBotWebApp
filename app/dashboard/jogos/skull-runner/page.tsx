'use client';

import { motion } from 'framer-motion';
import { SkullPlatformer } from '@/components/skull-platformer';

export default function SkullRunnerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Skull Chase</h1>
        <p className="text-muted-foreground">
          Jogo estilo labirinto — colete as bolinhas, use o poder e devore os inimigos!
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SkullPlatformer />
      </motion.div>
    </div>
  );
}
