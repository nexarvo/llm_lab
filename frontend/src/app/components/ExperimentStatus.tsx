"use client";

import { motion } from "framer-motion";
import { useExperimentPolling } from "../hooks/useExperimentPolling";
import { ExperimentStatus as ExperimentStatusType } from "@/lib/llm";

interface ExperimentStatusProps {
  experimentId: string;
  onComplete?: (status: ExperimentStatusType) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

export function ExperimentStatus({
  experimentId,
  onComplete,
  onError,
  onClose,
}: ExperimentStatusProps) {
  const { status, isLoading, error, isPolling } = useExperimentPolling({
    experimentId,
    pollInterval: 2000,
    onComplete,
    onError,
  });

  return (
    <div>
      {!error ? (
        <motion.h1
          className="bg-[linear-gradient(110deg,#404040,35%,#fff,50%,#404040,75%,#404040)] bg-[length:200%_100%] bg-clip-text text-base font-regular text-transparent"
          initial={{ backgroundPosition: "200% 0" }}
          animate={{ backgroundPosition: "-200% 0" }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "linear",
          }}
        >
          {status?.status}
        </motion.h1>
      ) : null}
    </div>
  );
}
