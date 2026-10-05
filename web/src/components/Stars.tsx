export function Stars({ value = 5 }: { value?: number }) {
  return (
    <span className="tracking-[2px] text-gold-500" aria-label={`${value} out of 5 stars`}>
      {"★".repeat(Math.round(value))}
      {"☆".repeat(5 - Math.round(value))}
    </span>
  );
}
