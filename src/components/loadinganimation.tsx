import { motion } from 'framer-motion';

export function LoadingAnimation() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative">
        <motion.div
          className="w-20 h-20 border-4 border-blue-200 rounded-full"
          animate={{
            rotate: 360,
            borderColor: ['#BFDBFE', '#3B82F6', '#BFDBFE'],
          }}
          transition={{
            duration: 1.5,
            ease: "linear",
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-10 h-10 border-4 border-blue-500 rounded-full"
          initial={{ scale: 0 }}
          animate={{
            scale: [0.5, 1, 0.5],
            rotate: -360,
            borderColor: ['#3B82F6', '#BFDBFE', '#3B82F6'],
          }}
          transition={{
            duration: 1.5,
            ease: "linear",
            repeat: Infinity,
          }}
          style={{ transform: 'translate(-50%, -50%)' }}
        />
      </div>
    </div>
  );
}
