"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StaggerGridProps {
  children: ReactNode;
  className?: string;
}

export function StaggerGrid({ children, className = "" }: StaggerGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      key={children ? JSON.stringify(Array.isArray(children) ? children.map((c: any) => c?.key || c?.props?.product?.id) : []) : ''}
      className={className}
    >
      {children}
    </motion.div>
  );
}



