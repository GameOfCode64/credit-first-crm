import React from "react";
import { Input } from "../../../../../../components/ui/input";
import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function LeadsSearch({ value, onChange }: Props) {
  return (
    <div className="bg-white border-b p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search by company, person or phone"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}
