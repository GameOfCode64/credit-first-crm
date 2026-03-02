import React from "react";
import { FormField } from "../../../../../types/form.type";
import { Input } from "../../../../../components/ui/input";
import { Textarea } from "../../../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";

interface Props {
  fields: FormField[];
}

export default function FieldPreview({ fields }: Props) {
  return (
    <div className="rounded-md border bg-white p-4">
      <h3 className="font-semibold mb-4">Form Preview (Test Mode)</h3>

      <div className="space-y-4">
        {fields.length === 0 && (
          <p className="text-sm text-muted-foreground">No fields added yet</p>
        )}

        {fields.map((field) => {
          const validOptions =
            field.type === "select"
              ? (field.options ?? []).filter(
                  (opt) => opt && opt.trim().length > 0,
                )
              : [];

          return (
            <div key={field.id} className="space-y-1">
              <label className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {/* TEXT */}
              {field.type === "text" && <Input placeholder="Enter text" />}

              {/* NUMBER */}
              {field.type === "number" && (
                <Input type="number" placeholder="Enter number" />
              )}

              {/* DATE */}
              {field.type === "date" && <Input type="date" />}

              {/* TEXTAREA */}
              {field.type === "textarea" && (
                <Textarea placeholder="Enter text" />
              )}

              {/* SELECT */}
              {field.type === "select" && (
                <>
                  {validOptions.length === 0 ? (
                    <div className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
                      No options available
                    </div>
                  ) : (
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        {validOptions.map((opt, i) => (
                          <SelectItem key={`${field.id}-${i}`} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
