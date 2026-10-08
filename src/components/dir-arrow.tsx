"use client";

import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-provider";

interface DirIconProps {
  className?: string;
}

/** Arrow that points in the reading direction (→ in LTR, ← in RTL). */
export function ArrowFlow({ className }: DirIconProps) {
  const { dir } = useLocale();
  const Icon: LucideIcon = dir === "rtl" ? ArrowLeft : ArrowRight;
  return <Icon className={className} />;
}

/** Back arrow (← in LTR, → in RTL). */
export function ArrowBack({ className }: DirIconProps) {
  const { dir } = useLocale();
  const Icon: LucideIcon = dir === "rtl" ? ArrowRight : ArrowLeft;
  return <Icon className={className} />;
}

/** Back chevron (‹ in LTR, › in RTL). */
export function ChevronBack({ className }: DirIconProps) {
  const { dir } = useLocale();
  const Icon: LucideIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  return <Icon className={className} />;
}
