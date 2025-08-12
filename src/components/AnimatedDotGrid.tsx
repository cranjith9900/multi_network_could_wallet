import { motion } from "framer-motion";

const rows = 14;
const cols = 14;

export default function AnimatedDotGrid() {
  return (
    <div className="fixed inset-0 z-0 flex items-center justify-center bg-black">
      <div className="grid grid-cols-14 grid-rows-14 gap-4 opacity-60">
        {Array.from({ length: rows * cols }).map((_, i) => (
          <motion.span
            key={i}
            className="block w-3 h-3 rounded-full bg-gradient-to-br from-gray-700 to-gray-900"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              delay: ((i % cols) + Math.floor(i / cols)) * 0.07,
            }}
          />
        ))}
      </div>
    </div>
  );
}
