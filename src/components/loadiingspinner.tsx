import { motion } from "framer-motion";

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
      sm: 'w-4 h-4 border-2',
      md: 'w-8 h-8 border-3',
      lg: 'w-12 h-12 border-4'
    };
  
    return (
      <div className="flex items-center justify-center">
        <motion.div
          className={`${sizeClasses[size]} rounded-full border-blue-600 border-t-transparent`}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            ease: "linear",
            repeat: Infinity
          }}
        />
      </div>
    );
  }