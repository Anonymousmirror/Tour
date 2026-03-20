"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, SkipForward, Sparkles } from "lucide-react";
import { useSurveyStore } from "@/lib/store";
import { STEPS } from "@/lib/survey-config";
import { cn } from "@/lib/utils";
import ProgressBar from "./ProgressBar";

// First step is statically imported (needed for initial render)
import StepBasicInfo from "./StepBasicInfo";

// Remaining steps are dynamically imported to reduce initial JS bundle
const StepCompanion = dynamic(() => import("./StepCompanion"), { ssr: false });
const StepTransport = dynamic(() => import("./StepTransport"), { ssr: false });
const StepStyle = dynamic(() => import("./StepStyle"), { ssr: false });
const StepDining = dynamic(() => import("./StepDining"), { ssr: false });
const StepAttractions = dynamic(() => import("./StepAttractions"), { ssr: false });
const StepAccommodation = dynamic(() => import("./StepAccommodation"), { ssr: false });
const StepBudget = dynamic(() => import("./StepBudget"), { ssr: false });
const ResultPage = dynamic(() => import("@/components/result/ResultPage"), { ssr: false });

// Preload map: step number -> import function for next step
const preloadMap: Record<number, () => void> = {
  1: () => import("./StepCompanion"),
  2: () => import("./StepTransport"),
  3: () => import("./StepStyle"),
  4: () => import("./StepDining"),
  5: () => import("./StepAttractions"),
  6: () => import("./StepAccommodation"),
  7: () => import("./StepBudget"),
  8: () => import("@/components/result/ResultPage"),
};

const TOTAL_STEPS = STEPS.length; // 8

const slideVariants = {
  enterForward: { x: 60, opacity: 0 },
  enterBackward: { x: -60, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exitForward: { x: -60, opacity: 0 },
  exitBackward: { x: 60, opacity: 0 },
};

export default function SurveyWizard() {
  const { currentStep, nextStep, prevStep, goToResult, goToStep, data } = useSurveyStore();
  const directionRef = useRef<"forward" | "backward">("forward");
  const [validationError, setValidationError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Admin mode: ?admin=1 auto-jumps to result page with stored data
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "1") {
      setIsAdmin(true);
      // If there's saved survey data, jump to result page
      if (data.basicInfo.city && data.companion.length > 0) {
        goToStep(9);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Preload the next step component after current step renders
  useEffect(() => {
    const preload = preloadMap[currentStep];
    if (preload) preload();
  }, [currentStep]);

  const isResultPage = currentStep === 9;
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === TOTAL_STEPS;

  // Returns error message if current step has unfilled required fields
  const validateCurrentStep = (): string => {
    if (currentStep === 1) {
      const { basicInfo } = data;
      if (!basicInfo.city.trim()) return "请填写旅行城市";
      if (!basicInfo.startDate) return "请选择出发日期";
      if (!basicInfo.endDate) return "请选择返回日期";
      if (!basicInfo.departure.trim()) return "请填写出发地";
      if (!basicInfo.returnTo.trim()) return "请填写返回地";
    }
    if (currentStep === 2) {
      if (data.companion.length === 0) return "请选择出行成员";
    }
    return "";
  };

  const handleNext = () => {
    const error = validateCurrentStep();
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError("");
    directionRef.current = "forward";
    if (isLastStep) {
      goToResult();
    } else {
      nextStep();
    }
  };

  const handlePrev = () => {
    setValidationError("");
    directionRef.current = "backward";
    prevStep();
  };

  const handleSkip = () => {
    const error = validateCurrentStep();
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError("");
    directionRef.current = "forward";
    if (isLastStep) {
      goToResult();
    } else {
      nextStep();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <StepBasicInfo />;
      case 2: return <StepCompanion />;
      case 3: return <StepTransport />;
      case 4: return <StepStyle />;
      case 5: return <StepDining />;
      case 6: return <StepAttractions />;
      case 7: return <StepAccommodation />;
      case 8: return <StepBudget />;
      case 9: return <ResultPage isAdmin={isAdmin} />;
      default: return null;
    }
  };

  const direction = directionRef.current;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      {/* Glass card */}
      <div
        className={cn(
          "relative rounded-3xl overflow-hidden",
          "bg-white/[0.04] backdrop-blur-sm",
          "border border-white/10",
          "shadow-2xl shadow-black/40"
        )}
      >
        {/* Inner gradient highlight */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute top-0 left-1/4 w-1/2 h-32 bg-orange-500/5 blur-3xl rounded-full" />
        </div>

        {/* Progress section */}
        {!isResultPage && (
          <div className="px-6 pt-6 pb-2">
            <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
          </div>
        )}

        {/* Step title + content with animation */}
        <div className="px-6 pt-4 pb-6 min-h-[400px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial={direction === "forward" ? "enterForward" : "enterBackward"}
              animate="center"
              exit={direction === "forward" ? "exitForward" : "exitBackward"}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              {!isResultPage && currentStep <= TOTAL_STEPS && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white/90">
                    {STEPS[currentStep - 1].title}
                  </h2>
                  <p className="text-sm text-white/40 mt-1">
                    {STEPS[currentStep - 1].subtitle}
                  </p>
                </div>
              )}
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Validation error */}
      <AnimatePresence>
        {validationError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="px-4 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm font-medium text-center"
          >
            {validationError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation buttons */}
      {!isResultPage && (
        <div className="flex items-center gap-3 px-1">
          {/* Back button */}
          {!isFirstStep && (
            <motion.button
              onClick={handlePrev}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium",
                "border border-white/10 bg-white/5 text-white/60",
                "hover:border-white/20 hover:text-white/80 hover:bg-white/8",
                "transition-colors"
              )}
            >
              <ArrowLeft size={15} />
              上一步
            </motion.button>
          )}

          <div className="flex-1" />

          {/* Skip button */}
          <motion.button
            onClick={handleSkip}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium",
              "text-white/35 hover:text-white/55",
              "transition-colors"
            )}
          >
            <SkipForward size={14} />
            跳过
          </motion.button>

          {/* Next / Generate button */}
          <motion.button
            onClick={handleNext}
            whileHover={{ scale: 1.02, boxShadow: "0 0 24px rgba(249,115,22,0.4)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold",
              "text-white",
              isLastStep
                ? "bg-gradient-to-r from-orange-500 to-sky-500 shadow-lg shadow-orange-500/25"
                : "bg-orange-500 hover:bg-orange-400 shadow-lg shadow-orange-500/20"
            )}
          >
            {isLastStep ? (
              <>
                <Sparkles size={15} />
                生成行程
              </>
            ) : (
              <>
                下一步
                <ArrowRight size={15} />
              </>
            )}
          </motion.button>
        </div>
      )}
    </div>
  );
}
