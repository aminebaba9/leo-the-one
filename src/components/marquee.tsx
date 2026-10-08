import { Sparkles } from "lucide-react";

interface MarqueeProps {
  items: string[];
  dark?: boolean;
}

export default function Marquee({ items, dark = false }: MarqueeProps) {
  const content = [...items, ...items];
  return (
    <div
      className={`overflow-hidden py-4 ${dark ? "bg-accent text-white" : "bg-ink text-paper"}`}
    >
      <div className="marquee-track">
        {content.map((item, i) => (
          <span
            key={i}
            className="mx-6 flex items-center gap-6 whitespace-nowrap font-display text-sm font-bold uppercase tracking-[0.2em]"
          >
            {item}
            <Sparkles className="h-4 w-4 text-lime" />
          </span>
        ))}
      </div>
    </div>
  );
}
