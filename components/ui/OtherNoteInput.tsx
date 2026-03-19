"use client";

import { motion } from "framer-motion";
import { useSurveyStore } from "@/lib/store";

interface OtherNoteInputProps {
  noteKey: string;
  placeholder?: string;
}

export default function OtherNoteInput({ noteKey, placeholder }: OtherNoteInputProps) {
  const { data, setOtherNote } = useSurveyStore();
  const value = data.otherNotes[noteKey] ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="mt-2"
    >
      <input
        type="text"
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white/90 placeholder-white/30 focus:border-orange-400/60 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition text-sm"
        placeholder={placeholder ?? "请补充具体说明..."}
        value={value}
        onChange={(e) => setOtherNote(noteKey, e.target.value)}
      />
    </motion.div>
  );
}
