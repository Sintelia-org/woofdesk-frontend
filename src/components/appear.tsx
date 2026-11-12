"use client";
import { motion, type HTMLMotionProps, type Variants } from "motion/react";

// Views stagger their direct building blocks (header, toolbar, content) on
// mount. MotionConfig in NavigationViewport disables movement when the user
// prefers reduced motion.
const appearGroupVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export const appearItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export function AppearGroup(props: HTMLMotionProps<"section">) {
  return (
    <motion.section
      variants={appearGroupVariants}
      initial="hidden"
      animate="show"
      {...props}
    />
  );
}

// For content that mounts after its data loads: it runs its own appear
// animation and staggers the AppearArticle elements inside it.
export function AppearList(props: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={appearGroupVariants}
      initial="hidden"
      animate="show"
      {...props}
    />
  );
}

export function AppearItem(props: HTMLMotionProps<"div">) {
  return <motion.div variants={appearItemVariants} {...props} />;
}

export function AppearArticle(props: HTMLMotionProps<"article">) {
  return <motion.article variants={appearItemVariants} {...props} />;
}

export function AppearHeader(props: HTMLMotionProps<"header">) {
  return <motion.header variants={appearItemVariants} {...props} />;
}
