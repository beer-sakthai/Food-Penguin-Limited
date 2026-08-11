import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

interface SplashScreenProps {
  onComplete: () => void;
  selectedBranch: string;
}

export default function SplashScreen({ onComplete, selectedBranch }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);

  // Hold onComplete in a ref so the countdown below runs exactly once on mount.
  // The parent re-renders every second (Dublin clock), which gives onComplete a
  // new identity each time; depending on it here would reset the timer forever
  // and leave the app stuck on this screen.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let exitTimer: ReturnType<typeof setTimeout>;
    const timer = setTimeout(() => {
      setIsExiting(true);
      exitTimer = setTimeout(() => onCompleteRef.current(), 600);
    }, 2400);

    return () => {
      clearTimeout(timer);
      clearTimeout(exitTimer);
    };
  }, []);

  const getBranchColor = () => {
    const normalized = selectedBranch.toLowerCase();
    if (normalized.includes("marks") || normalized.includes("m&s") || normalized.includes("spencer")) return "#e8bf66";
    if (normalized.includes("mahon")) return "#3b82f6";
    if (normalized.includes("cork")) return "#22c55e";
    return "#2dd4bf";
  };

  const branchColor = getBranchColor();

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 bg-gradient-to-br from-[#0b0c0f] via-[#14161d] to-[#0b0c0f] flex items-center justify-center z-50"
    >
      <div className="text-center">
        {/* Animated ring pulse */}
        <div className="relative w-32 h-32 mx-auto mb-8 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 rounded-full"
            style={{ background: branchColor, opacity: 0.08 }}
          />

          <motion.div
            animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: branchColor }}
          />

          {/* Wordmark */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-10 text-center"
          >
            <div className="text-4xl font-bold tracking-tight">
              <span style={{ color: branchColor }}>🐧</span>
            </div>
            <div className="text-xl font-bold text-white mt-2 tracking-tight">Food Penguin</div>
            <div className="text-xs font-semibold text-slate-400 mt-1">Limited</div>
          </motion.div>
        </div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="space-y-2"
        >
          <div className="text-base font-semibold text-white">Premium Sushi</div>
          <div className="text-sm text-slate-400">Precision Operations</div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs text-slate-500 mt-4"
          >
            Loading dashboard...
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
