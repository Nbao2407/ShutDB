import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./StatefulButton.module.css";

interface StatefulButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  onClickAsync?: () => Promise<void>;
}

/**
 * StatefulButton Component
 * Displays loading spinner and success checkmark with smooth animations
 * Usage:
 * <StatefulButton onClickAsync={async () => { await someAPI() }}>
 *   Send Message
 * </StatefulButton>
 */
export const StatefulButton: React.FC<StatefulButtonProps> = ({
  children,
  isLoading = false,
  onClickAsync,
  disabled,
  className,
  ...props
}) => {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClick = async () => {
    if (loading || showSuccess || disabled) return;

    setLoading(true);

    try {
      if (onClickAsync) {
        await onClickAsync();
      }

      // Show success state
      setShowSuccess(true);

      // Reset after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Button action failed:", error);
      setLoading(false);
    }
  };

  const isActive = loading || showSuccess || isLoading;

  const { onClick, ...restProps } = props;

  return (
    <motion.button
      layout
      onClick={handleClick}
      disabled={isActive || disabled}
      className={`${styles.button} ${isActive ? styles.active : ""} ${
        className || ""
      }`}
      whileHover={!isActive && !disabled ? { scale: 1.05 } : {}}
      whileTap={!isActive && !disabled ? { scale: 0.98 } : {}}
      {...(restProps as any)}
    >
      <motion.div layout className={styles.buttonContent}>
        <AnimatePresence mode="wait">
          {loading && !showSuccess && (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className={styles.loader}
            >
              <LoaderIcon />
            </motion.div>
          )}

          {showSuccess && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className={styles.success}
            >
              <CheckIcon />
            </motion.div>
          )}

          {!loading && !showSuccess && (
            <motion.span
              key="text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {children}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
};

/**
 * Animated Loader Icon
 */
const LoaderIcon: React.FC = () => (
  <motion.svg
    animate={{ rotate: 360 }}
    transition={{
      duration: 0.8,
      repeat: Infinity,
      ease: "linear",
    }}
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 3a9 9 0 1 0 9 9" />
  </motion.svg>
);

/**
 * Animated Check Icon
 */
const CheckIcon: React.FC = () => (
  <motion.svg
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
    <path d="M9 12l2 2l4 -4" />
  </motion.svg>
);

export default StatefulButton;
