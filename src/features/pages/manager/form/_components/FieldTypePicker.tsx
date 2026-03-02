import React from "react";
import { Button } from "../../../../../components/ui/button";
import { FormField } from "../../../../../types/form.type";

interface Props {
  onAdd: (type: FormField["type"]) => void;
}

export default function FieldTypePicker({ onAdd }: Props) {
  return (
    <div className="rounded-md border bg-white p-4 space-y-2">
      <h3 className="font-semibold">Add Field</h3>

      {["text", "number", "date", "select", "textarea"].map((type) => (
        <Button
          key={type}
          variant="outline"
          className="w-full justify-start"
          onClick={() => onAdd(type as FormField["type"])}
        >
          + {type}
        </Button>
      ))}
    </div>
  );
}
