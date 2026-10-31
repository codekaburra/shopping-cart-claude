export function StatCard({
  label,
  value,
  alert,
}: {
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <div className="rounded-xl border border-metal-silver/20 bg-concrete/10 p-4">
      <p className="text-xs text-text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${alert ? "text-red-400" : "text-text-primary"}`}>
        {value}
      </p>
    </div>
  );
}
