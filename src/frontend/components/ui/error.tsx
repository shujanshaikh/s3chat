import { AlertCircle, RotateCcw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ErrorProps {
  error: string | null
  reload: () => void
}

export default function Error({ error, reload }: ErrorProps) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex items-center justify-between gap-3 p-4 mx-auto max-w-md bg-red-400/20 border border-red-600 rounded-xl shadow-sm"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 flex-1">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700 font-medium">An error occurred. Please try again.</span>
          </div>

          <motion.button
            type="button"
            onClick={reload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Retry the failed operation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Retry
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
