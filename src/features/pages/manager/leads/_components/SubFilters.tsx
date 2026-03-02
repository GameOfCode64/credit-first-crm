import { Checkbox } from "../../../../../components/ui/checkbox";
import { CallOutcome } from "../../../../../types/leads.types";
import React, { Dispatch, SetStateAction } from "react";

const OPTIONS: CallOutcome[] = [
  "NOT_PICKED_UP",
  "BUSY",
  "SWITCHED_OFF",
  "CALL_LATER",
  "CALL_BACK_SCHEDULED",
  "INTERESTED",
  "NOT_INTERESTED",
  "WRONG_NUMBER",
];

const SubFilters = ({
  outcomes,
  setOutcomes,
}: {
  outcomes: CallOutcome[];
  setOutcomes: Dispatch<SetStateAction<CallOutcome[]>>;
}) => {
  const toggle = (o: CallOutcome) => {
    setOutcomes((prev) =>
      prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o],
    );
  };

  return (
    <div className="flex flex-wrap gap-4 border p-3 rounded-md">
      {OPTIONS.map((o) => (
        <label key={o} className="flex items-center gap-2">
          <Checkbox
            checked={outcomes.includes(o)}
            onCheckedChange={() => toggle(o)}
          />
          <span className="text-sm">{o}</span>
        </label>
      ))}
    </div>
  );
};

export default SubFilters;
