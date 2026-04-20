"use client";

export interface ActiveIndicators {
  sma7: boolean;
  sma25: boolean;
  sma99: boolean;
  ema7: boolean;
  ema25: boolean;
  bollinger: boolean;
  rsi: boolean;
  macd: boolean;
  volume: boolean;
}

export const DEFAULT_INDICATORS: ActiveIndicators = {
  sma7: false,
  sma25: false,
  sma99: false,
  ema7: false,
  ema25: false,
  bollinger: false,
  rsi: false,
  macd: false,
  volume: true,
};

interface IndicatorToolbarProps {
  indicators: ActiveIndicators;
  onChange: (indicators: ActiveIndicators) => void;
}

const INDICATOR_BUTTONS: { key: keyof ActiveIndicators; label: string; color: string }[] = [
  { key: "sma7", label: "MA7", color: "#283750" },
  { key: "sma25", label: "MA25", color: "#496181" },
  { key: "sma99", label: "MA99", color: "#6c84a5" },
  { key: "ema7", label: "EMA7", color: "#90a6c2" },
  { key: "ema25", label: "EMA25", color: "#b4c8e1" },
  { key: "bollinger", label: "BOLL", color: "#496181" },
  { key: "rsi", label: "RSI", color: "#6c84a5" },
  { key: "macd", label: "MACD", color: "#90a6c2" },
  { key: "volume", label: "VOL", color: "#5f728c" },
];

export function IndicatorToolbar({ indicators, onChange }: IndicatorToolbarProps) {
  const toggle = (key: keyof ActiveIndicators) => {
    onChange({ ...indicators, [key]: !indicators[key] });
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {INDICATOR_BUTTONS.map(({ key, label, color }) => (
        <button
          key={key}
          type="button"
          onClick={() => toggle(key)}
          className={`rounded-lg border px-2 py-1 text-xs font-medium transition-colors ${
            indicators[key]
              ? "border-transparent text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
          style={indicators[key] ? { backgroundColor: color } : undefined}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
