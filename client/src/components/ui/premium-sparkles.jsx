import { Sparkles } from "lucide-react";

export function PremiumSparkles({ className = "" }) {
  return (
    <>
      <svg width="0" height="0">
        <linearGradient id="premium-gradient">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="50%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </svg>

      <Sparkles
        className={className}
        style={{
          stroke: "url(#premium-gradient)",
        }}
      />
    </>
  );
}
