export type FormFieldType = "text" | "number" | "date" | "select" | "textarea";

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  options?: string[]; // only for select
}
