'use client';

import { motion } from 'framer-motion';
import { SkullcardsGame } from '@/components/skullcards-game';

export default function SkullcardsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <SkullcardsGame />
    </motion.div>
  );
}

