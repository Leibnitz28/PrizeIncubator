"use client";

export function PriceLine({ label, value, className = "", strikethrough = false }: {
  label: string; value?: number | null; className?: string; strikethrough?: boolean;
}) {
  if (value == null) return null;
  const isNeg = value < 0;
  const formatted = `${isNeg ? "-" : ""}₹${Math.abs(value).toLocaleString("en-IN")}`;
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <span>{label}</span>
      <span className={`tabular-nums ${strikethrough ? "line-through opacity-60" : ""}`}>{formatted}</span>
    </div>
  );
}
