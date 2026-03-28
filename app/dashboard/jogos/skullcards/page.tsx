// 'use client';
//
// import { motion } from 'framer-motion';
// import { SkullcardsGame } from '@/components/skullcards-game';
//
// export default function SkullcardsPage() {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.25 }}
//       className="space-y-6"
//     >
//       <SkullcardsGame />
//     </motion.div>
//   );
// }

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SkullcardsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/jogos"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar aos jogos
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
        <h1 className="text-2xl font-bold text-foreground">SkullCards</h1>
        <p className="text-muted-foreground mt-2">
          Este jogo está temporariamente desabilitado.
        </p>
      </div>
    </div>
  );
}
