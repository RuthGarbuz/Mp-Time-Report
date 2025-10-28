import { motion, AnimatePresence } from "framer-motion";

interface Props {
  validateError: string;
}

export default function ErrorMessage({ validateError }: Props) {
  return (
    <AnimatePresence>
      {validateError && (
        <motion.div
          key="error"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: [0, -5, 5, -5, 5, 0] }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ opacity: { duration: 0.3 }, x: { duration: 0.4 } }}
          className="mt-2 p-3 rounded-lg bg-red-100 border border-red-400 text-red-700 text-sm"
          // אפקט ניעור קל
        >
          {validateError}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
