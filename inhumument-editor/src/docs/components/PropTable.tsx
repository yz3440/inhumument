export interface PropRow {
  name: string;
  type: string;
  description: string;
}

export function PropTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="mb-6 overflow-x-auto">
      <table className="w-full min-w-[32rem] border-collapse text-left text-[12px]">
        <thead>
          <tr className="border-b border-border">
            <th className="py-2 pr-4 font-semibold text-foreground">Name</th>
            <th className="py-2 pr-4 font-semibold text-foreground">Type</th>
            <th className="py-2 pr-4 font-semibold text-foreground">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-border-soft last:border-0 align-top">
              <td className="py-2 pr-4 font-mono text-[11px] font-medium text-primary">{r.name}</td>
              <td className="py-2 pr-4 font-mono text-[11px] text-muted-foreground">{r.type}</td>
              <td className="py-2 pr-4 text-muted-foreground">{r.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
