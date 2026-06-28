import { motion } from 'framer-motion';
import {
  BookOpen,
  Calculator,
  Gamepad2,
  Globe,
  GraduationCap,
  Lightbulb,
  Music,
  Pencil,
  Shapes,
  Smile,
  Sparkles,
  Star,
} from 'lucide-react';

const icons = [
  BookOpen,
  Sparkles,
  Pencil,
  Calculator,
  Globe,
  Star,
  Music,
  Gamepad2,
  Lightbulb,
  GraduationCap,
  Shapes,
  Smile,
];

export function LoginBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#f8fafc]">
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.18, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-44 -left-36 h-120 w-120 rounded-full bg-linear-to-br from-sky-200 via-indigo-100 to-violet-200 opacity-50 blur-3xl"
      />

      <motion.div
        animate={{ rotate: -360, scale: [1, 1.22, 1] }}
        transition={{ duration: 23, repeat: Infinity, ease: 'linear' }}
        className="absolute -right-44 -bottom-30 h-136 w-136 rounded-full bg-linear-to-br from-pink-200 via-rose-100 to-amber-200 opacity-45 blur-3xl"
      />

      <motion.div
        animate={{ y: [0, -55, 0], x: [0, 45, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 left-1/2 h-104 w-104 rounded-full bg-linear-to-br from-yellow-100 via-cyan-200 to-sky-100 opacity-40 blur-3xl"
      />

      {/* Extra soft mesh layers */}
      <div className="absolute inset-0 bg-[radial-gradient(at_45%_25%,rgba(165,243,252,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(at_70%_65%,rgba(251,207,232,0.10),transparent_55%)]" />

      {/* Floating Educational Icons */}
      {Array.from({ length: 48 }).map((_, i) => {
        const Icon = icons[i % icons.length];
        const size = 17 + (i % 4) * 7;

        return (
          <motion.div
            key={i}
            className="absolute text-sky-500/35"
            style={{
              left: `${(i * 7.7) % 102}%`,
              top: `${(i * 8.8) % 104}%`,
            }}
            animate={{
              y: [0, -24, 0],
              x: [0, 16, 0],
              rotate: [0, 20, -14, 0],
              scale: [0.88, 1.12, 0.96],
            }}
            transition={{
              duration: 4.2 + (i % 6),
              delay: (i % 8) * 0.1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Icon size={size} strokeWidth={1.5} />
          </motion.div>
        );
      })}
    </div>
  );
}
