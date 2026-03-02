import React from "react";
export default function PipelineSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-[400px] rounded-lg bg-gray-100 animate-pulse"
        />
      ))}
    </div>
  );
}
