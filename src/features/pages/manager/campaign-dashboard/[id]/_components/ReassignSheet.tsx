"use client";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../../../../../components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../../components/ui/select";
import { Button } from "../../../../../../components/ui/button";
import { Input } from "../../../../../../components/ui/input";
import { Separator } from "../../../../../../components/ui/separator";
import { Users } from "lucide-react";

interface Employee {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  employees?: Employee[];

  selectedCount: number;

  selectedEmployeeId: string;
  onSelectEmployee: (id: string) => void;

  rangeFrom: number | "";
  rangeTo: number | "";
  setRangeFrom: (v: number | "") => void;
  setRangeTo: (v: number | "") => void;

  onReassign: () => void;
  loading: boolean;
}

export default function ReassignSheet({
  open,
  onOpenChange,

  employees,
  selectedCount,

  selectedEmployeeId,
  onSelectEmployee,

  rangeFrom,
  rangeTo,
  setRangeFrom,
  setRangeTo,

  onReassign,
  loading,
}: Props) {
  /** ✅ HARD SAFETY */
  const safeEmployees: Employee[] = Array.isArray(employees) ? employees : [];

  const hasRange =
    rangeFrom !== "" && rangeTo !== "" && Number(rangeTo) >= Number(rangeFrom);

  const canSubmit = !!selectedEmployeeId && (selectedCount > 0 || hasRange);

  const handleReassign = () => {
    if (canSubmit) {
      onReassign();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[760px] max-w-none p-6 flex flex-col">
        {/* HEADER */}
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-amber-600" />
            Reassign Leads
          </SheetTitle>
        </SheetHeader>

        {/* BODY */}
        <div className="flex-1 mt-6 space-y-6">
          {/* SUMMARY */}
          <div className="rounded-lg border bg-slate-50 p-4 text-sm">
            <p>
              Selected leads:{" "}
              <span className="font-semibold text-amber-600">
                {selectedCount}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You can reassign selected leads or use range selection.
            </p>
          </div>

          {/* RANGE */}
          <div>
            <p className="text-sm font-medium mb-2">
              Range Selection (optional)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                min={1}
                placeholder="From lead #"
                value={rangeFrom}
                onChange={(e) =>
                  setRangeFrom(e.target.value ? Number(e.target.value) : "")
                }
              />
              <Input
                type="number"
                min={1}
                placeholder="To lead #"
                value={rangeTo}
                onChange={(e) =>
                  setRangeTo(e.target.value ? Number(e.target.value) : "")
                }
              />
            </div>

            {rangeFrom !== "" && rangeTo !== "" && rangeTo < rangeFrom && (
              <p className="text-xs text-red-500 mt-1">
                "To" must be greater than or equal to "From"
              </p>
            )}
          </div>

          <Separator />

          {/* EMPLOYEE */}
          <div>
            <p className="text-sm font-medium mb-2">
              Assign To <span className="text-red-500">*</span>
            </p>

            <Select value={selectedEmployeeId} onValueChange={onSelectEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>

              <SelectContent>
                {safeEmployees.length === 0 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    No employees available
                  </div>
                )}

                {safeEmployees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* FOOTER */}
        <div className="pt-4 border-t">
          <Button
            className="w-full bg-[#b98b08] hover:bg-[#b98b08]/90"
            disabled={!canSubmit || loading}
            onClick={handleReassign}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Reassigning...
              </span>
            ) : (
              "Confirm Reassignment"
            )}
          </Button>

          {!canSubmit && (
            <p className="mt-2 text-xs text-muted-foreground text-center">
              {!selectedEmployeeId
                ? "Please select an employee"
                : "Please select leads or specify a range"}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
