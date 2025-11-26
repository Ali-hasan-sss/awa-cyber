"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isQuotePage = pathname === "/quote";

  const initial = isQuotePage ? { x: "-100%", opacity: 0 } : { opacity: 1 };
  const animate = { x: 0, opacity: 1 };
  const exit = isQuotePage ? { x: "-100%", opacity: 0 } : { opacity: 1 };
  const transition = {
    duration: isQuotePage ? 0.6 : 0,
    ease: [0.4, 0, 0.2, 1] as const,
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
