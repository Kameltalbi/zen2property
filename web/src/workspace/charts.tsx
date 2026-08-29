export function BarsChart({
  data,
}: {
  data: Array<{ label: string; income: number; expense: number }>;
}) {
  const max = Math.max(...data.flatMap((d) => [d.income, d.expense, 1]));
  return (
    <div className="ws-chart" role="img" aria-label="Revenus et dépenses">
      {data.map((d) => (
        <div key={d.label} className="ws-bar-col">
          <div className="ws-bars">
            <span style={{ height: `${(d.income / max) * 100}%` }} className="in" />
            <span style={{ height: `${(d.expense / max) * 100}%` }} className="out" />
          </div>
          <small>{d.label}</small>
        </div>
      ))}
    </div>
  );
}

export function Donut({
  slices,
}: {
  slices: Array<{ label: string; value: number; color: string }>;
}) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  let acc = 0;
  const stops = slices.map((s) => {
    const start = (acc / total) * 100;
    acc += s.value;
    const end = (acc / total) * 100;
    return `${s.color} ${start}% ${end}%`;
  });
  return (
    <div className="ws-donut-wrap">
      <div className="ws-donut" style={{ background: `conic-gradient(${stops.join(', ')})` }} />
      <ul className="ws-legend">
        {slices.map((s) => (
          <li key={s.label}>
            <i style={{ background: s.color }} />
            {s.label} · {s.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
