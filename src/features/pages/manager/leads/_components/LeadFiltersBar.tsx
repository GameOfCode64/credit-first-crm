import { Input } from "../../../../../components/ui/input";
import { Button } from "../../../../../components/ui/button";
import { Checkbox } from "../../../../../components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../../../../components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { LeadStatus } from "../../../../../types/leads.types";
import EmployeeMultiSelect from "./EmployeeMultiSelect";
import React, { Dispatch, SetStateAction } from "react";

const STATUS_OPTIONS: LeadStatus[] = [
  "FRESH",
  "ASSIGNED",
  "IN_PROGRESS",
  "FOLLOW_UP",
  "WON",
  "LOST",
];

interface Props {
  /** 🔥 ALL lead ids in global order */
  allLeadIds: string[];

  statuses: LeadStatus[];
  setStatuses: Dispatch<SetStateAction<LeadStatus[]>>;

  selectedLeadIds: string[];
  setSelectedLeadIds: Dispatch<SetStateAction<string[]>>;

  rangeFrom: number | "";
  rangeTo: number | "";
  setRangeFrom: Dispatch<SetStateAction<number | "">>;
  setRangeTo: Dispatch<SetStateAction<number | "">>;

  selectedEmployeeIds: string[];
  setSelectedEmployeeIds: Dispatch<SetStateAction<string[]>>;

  filterEmployeeIds: string[];
  setFilterEmployeeIds: Dispatch<SetStateAction<string[]>>;

  onAssign: () => void;
  isAssigning: boolean;
}

export default function LeadFiltersBar({
  allLeadIds,
  statuses,
  setStatuses,
  selectedLeadIds,
  setSelectedLeadIds,
  rangeFrom,
  rangeTo,
  setRangeFrom,
  setRangeTo,
  selectedEmployeeIds,
  setSelectedEmployeeIds,
  filterEmployeeIds,
  setFilterEmployeeIds,
  onAssign,
  isAssigning,
}: Props) {
  /**
   * ✅ GLOBAL RANGE (1-based index)
   * Example: 10 → 500 selects across all pages
   */
  const applyRange = (from: number, to: number) => {
    if (from < 1 || to < from) return;

    const start = from - 1;
    const end = Math.min(to, allLeadIds.length);

    setSelectedLeadIds(allLeadIds.slice(start, end));
  };

  return (
    <div className="flex flex-wrap items-center gap-4 border rounded-md p-3 bg-gray-50">
      {/* STATUS FILTER */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button">
            <Button variant="outline" className="flex gap-2">
              Status ({statuses.length}) <ChevronDown size={14} />
            </Button>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="p-3 space-y-2 w-48">
          {STATUS_OPTIONS.map((status) => (
            <label key={status} className="flex gap-2 items-center">
              <Checkbox
                checked={statuses.includes(status)}
                onCheckedChange={() =>
                  setStatuses((prev) =>
                    prev.includes(status)
                      ? prev.filter((s) => s !== status)
                      : [...prev, status],
                  )
                }
              />
              <span className="text-sm">{status}</span>
            </label>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* EMPLOYEE FILTER */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filter by:</span>
        <EmployeeMultiSelect
          selectedEmployeeIds={filterEmployeeIds}
          setSelectedEmployeeIds={setFilterEmployeeIds}
        />
      </div>

      {/* RANGE INPUT */}
      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="From"
          className="w-24"
          min={1}
          value={rangeFrom}
          onChange={(e) => {
            const v = Number(e.target.value);
            setRangeFrom(v || "");
            if (v && rangeTo) applyRange(v, rangeTo);
          }}
        />

        <span className="text-sm text-muted-foreground">to</span>

        <Input
          type="number"
          placeholder="To"
          className="w-24"
          min={1}
          value={rangeTo}
          onChange={(e) => {
            const v = Number(e.target.value);
            setRangeTo(v || "");
            if (rangeFrom && v) applyRange(rangeFrom, v);
          }}
        />
      </div>

      {/* ASSIGN TO EMPLOYEE */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Assign to:</span>
        <EmployeeMultiSelect
          selectedEmployeeIds={selectedEmployeeIds}
          setSelectedEmployeeIds={setSelectedEmployeeIds}
        />
      </div>

      {/* ASSIGN BUTTON */}
      <Button
        disabled={
          selectedLeadIds.length === 0 ||
          selectedEmployeeIds.length === 0 ||
          isAssigning
        }
        className="bg-[#b98b08] hover:bg-[#b98b08]/90 text-white"
        onClick={onAssign}
      >
        {isAssigning ? "Assigning..." : "Assign"}
      </Button>
    </div>
  );
}
