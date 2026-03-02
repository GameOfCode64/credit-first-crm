import React from "react";

export default function ReasonList({
  reasons,
}: {
  reasons: { id: string; label: string }[];
}) {
  if (!reasons.length) {
    return <p className="text-xs text-muted-foreground">No reasons defined</p>;
  }

  return (
    <ul className="space-y-1">
      {reasons.map((r) => (
        <li key={r.id} className="text-sm text-muted-foreground">
          • {r.label}
        </li>
      ))}
    </ul>
  );
}
