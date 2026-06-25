import { motion } from 'framer-motion';
import {
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
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* ORBS */}
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-sky-300/30 blur-3xl"
      />

      <motion.div
        animate={{ rotate: -360, scale: [1, 1.2, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-pink-300/30 blur-3xl"
      />

      <motion.div
        animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-1/3 left-1/2 h-80 w-80 rounded-full bg-yellow-200/20 blur-3xl"
      />

      {/* ICON FIELD */}
      {Array.from({ length: 45 }).map((_, i) => {
        const Icon = icons[i % icons.length];

        return (
          <motion.div
            key={i}
            className="absolute text-sky-400/40"
            style={{
              left: `${(i * 7.3) % 100}%`,
              top: `${(i * 9.1) % 100}%`,
            }}
            animate={{
              y: [0, -18, 0],
              x: [0, 12, 0],
              rotate: [0, 15, -15, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4 + (i % 5),
              delay: (i % 7) * 0.1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Icon size={18 + (i % 3) * 8} />
          </motion.div>
        );
      })}
    </div>
  );
}
