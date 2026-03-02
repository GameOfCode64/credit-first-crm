import React from "react";
import OutcomeCard from "./OutcomeCard";
import { Plus } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { useOutcomeReasonModal } from "../../../../../hooks/useOutcomeModal";

interface Props {
  title: string;
  description: string;
  stage: "INITIAL" | "ACTIVE" | "CLOSED";
  items: any[];
  editable?: boolean;
  readOnly?: boolean;
}

export default function PipelineColumn({
  title,
  description,
  stage,
  items,
  editable,
  readOnly,
}: Props) {
  const { open } = useOutcomeReasonModal();

  return (
    <div className="rounded-lg border bg-white p-4 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>

        {editable && (
          <Button size="icon" variant="outline" onClick={() => open(stage)}>
            <Plus size={14} />
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) =>
          readOnly ? (
            <div
              key={item.id}
              className="rounded-md border px-3 py-2 text-sm bg-gray-50"
            >
              {item.name}
            </div>
          ) : (
            <OutcomeCard key={item.id} outcome={item} />
          ),
        )}
      </div>
    </div>
  );
}
