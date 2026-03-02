import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  fetchActiveForm,
  saveForm,
} from "../../../../../services/form.service";
import { FormField } from "../../../../../types/form.type";
import FieldEditor from "./FieldEditor";
import FieldPreview from "./FieldPreview";
import { Button } from "../../../../../components/ui/button";
import { nanoid } from "nanoid";
import toast from "react-hot-toast";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export default function FormBuilder() {
  const { data } = useQuery({
    queryKey: ["active-form"],
    queryFn: fetchActiveForm,
  });

  const [fields, setFields] = useState<FormField[]>([]);

  useEffect(() => {
    if (data?.schema) setFields(data.schema);
  }, [data]);

  const mutation = useMutation({
    mutationFn: saveForm,
    onSuccess: () => toast.success("Form saved"),
    onError: () => toast.error("Failed to save form"),
  });

  const addField = (type: FormField["type"]) => {
    setFields((prev) => [
      ...prev,
      {
        id: nanoid(),
        label: "Untitled Field",
        type,
        required: false,
        options: type === "select" ? ["Option 1"] : undefined,
      },
    ]);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setFields((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === active.id);
      const newIndex = prev.findIndex((f) => f.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      {/* LEFT */}
      <div className="space-y-3">
        <h3 className="font-semibold">Add Field</h3>
        {["text", "number", "date", "select", "textarea"].map((t) => (
          <Button
            key={t}
            variant="outline"
            className="w-full"
            onClick={() => addField(t as any)}
          >
            + {t}
          </Button>
        ))}
      </div>

      {/* CENTER + RIGHT */}
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FIELD EDITOR */}
        <div className="space-y-3">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field) => (
                <FieldEditor
                  key={field.id}
                  field={field}
                  onChange={(f) =>
                    setFields((prev) =>
                      prev.map((p) => (p.id === f.id ? f : p)),
                    )
                  }
                  onDelete={() =>
                    setFields((prev) => prev.filter((p) => p.id !== field.id))
                  }
                />
              ))}
            </SortableContext>
          </DndContext>

          <Button
            className="bg-[#b98b08]  hover:bg-[#b98b08]/90 text-white w-full"
            onClick={() =>
              mutation.mutate({
                name: "Sales Call Form",
                schema: fields,
              })
            }
          >
            Save Form
          </Button>
        </div>

        {/* PREVIEW */}
        <FieldPreview fields={fields} />
      </div>
    </div>
  );
}
