import React from "react";
import { FormField } from "../../../../../types/form.type";
import { Input } from "../../../../../components/ui/input";
import { Checkbox } from "../../../../../components/ui/checkbox";
import { Button } from "../../../../../components/ui/button";
import { X, GripVertical } from "lucide-react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  field: FormField;
  onChange: (f: FormField) => void;
  onDelete: () => void;
}

export default function FieldEditor({ field, onChange, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-md border p-4 space-y-3 bg-white"
    >
      <div className="flex items-center gap-2">
        {/* DRAG HANDLE */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-400 hover:text-gray-600"
        >
          <GripVertical size={18} />
        </button>

        <Input
          value={field.label}
          onChange={(e) => onChange({ ...field, label: e.target.value })}
          placeholder="Field label"
        />

        <Button size="icon" variant="ghost" onClick={onDelete}>
          <X size={16} />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          checked={field.required}
          onCheckedChange={(v) => onChange({ ...field, required: !!v })}
        />
        <span className="text-sm">Required</span>
      </div>

      {field.type === "select" && (
        <div className="space-y-2">
          {(field.options ?? []).map((opt, i) => (
            <Input
              key={i}
              value={opt}
              onChange={(e) => {
                const options = [...(field.options ?? [])];
                options[i] = e.target.value;
                onChange({ ...field, options });
              }}
            />
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              onChange({
                ...field,
                options: [...(field.options ?? []), "New Option"],
              })
            }
          >
            + Add Option
          </Button>
        </div>
      )}
    </div>
  );
}
