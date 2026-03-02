"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { useLeadsTableStore } from "@/hooks/useLeadsTableStore";

interface Props {
  open: boolean;
  onClose: () => void;
  campaignId: string;
}

interface EmployeeDistribution {
  id: string;
  name: string;
  percentage: number;
  count: number;
}

export default function BulkAssignSheet({ open, onClose, campaignId }: Props) {
  const queryClient = useQueryClient();
  const { selectedIds, clearSelection } = useLeadsTableStore();

  const isSelectedMode = selectedIds.length > 0;

  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [fromValue, setFromValue] = useState<number>(1);
  const [toValue, setToValue] = useState<number>(0);
  const [selectedEmployees, setSelectedEmployees] = useState<
    EmployeeDistribution[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ================= FETCH CAMPAIGN TOTAL ================= */

  const { data: countData } = useQuery({
    queryKey: ["campaign-lead-count", campaignId],
    queryFn: async () =>
      (await api.get(`/leads/count`, { params: { campaignId } })).data,
    enabled: open && !isSelectedMode,
  });

  const totalLeads = countData?.total ?? 0;

  useEffect(() => {
    if (!isSelectedMode && totalLeads > 0) {
      setFromValue(1);
      setToValue(totalLeads);
    }
  }, [isSelectedMode, totalLeads]);

  /* ================= FETCH STATUS ================= */

  const { data: pipeline } = useQuery({
    queryKey: ["pipeline"],
    queryFn: async () => (await api.get("/pipeline")).data,
    enabled: open,
  });

  const allStatuses = [
    ...(pipeline?.initialStage?.map((item: any) => {
      if (typeof item === "object" && item !== null) {
        return item;
      }
      return {
        name: item,
        color: "#9ca3af",
        key: item,
        stage: "INITIAL",
      };
    }) ?? []),
    ...(pipeline?.activeStage ?? []),
    ...(pipeline?.closedStage ?? []),
  ];

  /* ================= FETCH EMPLOYEES ================= */

  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => (await api.get("/users/employees")).data,
    enabled: open,
  });

  /* ================= EMPLOYEE SELECTION ================= */

  const totalLeadsToAssign = isSelectedMode
    ? selectedIds.length
    : toValue - fromValue + 1;

  const toggleEmployee = (employee: any) => {
    setSelectedEmployees((prev) => {
      const exists = prev.find((e) => e.id === employee.id);

      if (exists) {
        const filtered = prev.filter((e) => e.id !== employee.id);
        return recalculatePercentages(filtered, totalLeadsToAssign);
      } else {
        const newList = [
          ...prev,
          {
            id: employee.id,
            name: employee.name,
            percentage: 0,
            count: 0,
          },
        ];
        return recalculatePercentages(newList, totalLeadsToAssign);
      }
    });
  };

  const recalculatePercentages = (
    employeeList: EmployeeDistribution[],
    totalCount: number,
  ): EmployeeDistribution[] => {
    if (employeeList.length === 0) return [];

    const equalPercentage = Math.floor(100 / employeeList.length);
    const remainder = 100 - equalPercentage * employeeList.length;

    return employeeList.map((emp, index) => {
      const percentage =
        index === 0 ? equalPercentage + remainder : equalPercentage;
      const count = Math.round((percentage / 100) * totalCount);

      return {
        ...emp,
        percentage,
        count,
      };
    });
  };

  const updateEmployeePercentage = (
    employeeId: string,
    newPercentage: number,
  ) => {
    setSelectedEmployees((prev) => {
      const updated = prev.map((emp) =>
        emp.id === employeeId
          ? {
              ...emp,
              percentage: newPercentage,
              count: Math.round((newPercentage / 100) * totalLeadsToAssign),
            }
          : emp,
      );
      return updated;
    });
  };

  useEffect(() => {
    if (selectedEmployees.length > 0) {
      setSelectedEmployees((prev) =>
        prev.map((emp) => ({
          ...emp,
          count: Math.round((emp.percentage / 100) * totalLeadsToAssign),
        })),
      );
    }
  }, [totalLeadsToAssign]);

  const totalPercentage = selectedEmployees.reduce(
    (sum, emp) => sum + emp.percentage,
    0,
  );

  /* ================= RESET ON CLOSE ================= */

  useEffect(() => {
    if (!open) {
      setSelectedStatus("");
      setSelectedEmployees([]);
      setFromValue(1);
      setToValue(0);
    }
  }, [open]);

  /* ================= APPLY ================= */

  const handleSubmit = async () => {
    if (!selectedStatus && selectedEmployees.length === 0) {
      toast.error("Please select at least a status or employees");
      return;
    }

    if (selectedEmployees.length > 0 && totalPercentage !== 100) {
      toast.error("Total percentage must equal 100%");
      return;
    }

    setIsSubmitting(true);

    try {
      const employeeDistribution =
        selectedEmployees.length > 0
          ? selectedEmployees.map((emp) => ({
              employeeId: emp.id,
              percentage: emp.percentage,
              count: emp.count,
            }))
          : undefined;

      if (isSelectedMode) {
        await api.post("/leads/bulk-update-selected", {
          leadIds: selectedIds,
          status: selectedStatus || undefined,
          employeeDistribution,
        });
      } else {
        const count = toValue - fromValue + 1;

        await api.post("/leads/bulk-update-campaign", {
          campaignId,
          limit: count,
          offset: fromValue - 1,
          status: selectedStatus || undefined,
          employeeDistribution,
        });
      }

      toast.success("Leads assigned successfully!");

      // Refresh leads data
      queryClient.invalidateQueries({ queryKey: ["leads", campaignId] });

      clearSelection();
      onClose();
    } catch (error: any) {
      console.error("Assignment error:", error);
      toast.error(error.response?.data?.error || "Failed to assign leads");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[700px] p-0">
        <SheetHeader className="relative pb-6 px-8 border-b border-[#b98b08]/20">
          <SheetTitle className="text-xl font-medium tracking-wide">
            Bulk Assign Leads
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="px-8 py-6 space-y-6">
            {/* ================= SELECTED INFO ================= */}

            <div className="text-base leading-relaxed bg-[#fef9e7] p-4 rounded-lg border border-[#b98b08]/30">
              {isSelectedMode ? (
                <p>
                  <span className="font-semibold text-[#7d6006]">
                    Selected Leads:
                  </span>{" "}
                  <span className="text-[#a47a07]">
                    {selectedIds.length} lead
                    {selectedIds.length !== 1 ? "s" : ""}
                  </span>
                </p>
              ) : (
                <p>
                  <span className="font-semibold text-[#7d6006]">
                    Total Campaign Leads:
                  </span>{" "}
                  <span className="text-[#a47a07]">{totalLeads} leads</span>
                </p>
              )}
            </div>

            {/* ================= FROM/TO RANGE ================= */}

            {!isSelectedMode && (
              <>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 flex-1">
                    <label className="text-base font-medium min-w-[60px]">
                      From:
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={toValue}
                      value={fromValue}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= 1 && val <= toValue) {
                          setFromValue(val);
                        }
                      }}
                      className="w-full h-11 border-2 border-[#b98b08]/40 focus:border-[#b98b08] rounded-lg text-center text-base"
                    />
                  </div>

                  <div className="flex items-center gap-3 flex-1">
                    <label className="text-base font-medium min-w-[40px]">
                      To:
                    </label>
                    <Input
                      type="number"
                      min={fromValue}
                      max={totalLeads}
                      value={toValue}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= fromValue && val <= totalLeads) {
                          setToValue(val);
                        }
                      }}
                      className="w-full h-11 border-2 border-[#b98b08]/40 focus:border-[#b98b08] rounded-lg text-center text-base"
                    />
                  </div>
                </div>

                <div className="text-sm text-gray-600 bg-[#fef9e7] p-3 rounded-lg border border-[#b98b08]/20">
                  Updating leads{" "}
                  <span className="font-semibold">{fromValue}</span> to{" "}
                  <span className="font-semibold">{toValue}</span> ({" "}
                  <span className="font-semibold text-[#b98b08]">
                    {toValue - fromValue + 1} leads
                  </span>{" "}
                  )
                </div>
              </>
            )}

            {/* ================= STATUS ================= */}

            <div className="space-y-3">
              <label className="text-base font-semibold block">
                Update Leads Status
              </label>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full h-12 border-2 border-[#b98b08]/40 focus:border-[#b98b08] rounded-lg text-base">
                  <SelectValue placeholder="Select Status (Optional)" />
                </SelectTrigger>

                <SelectContent>
                  {allStatuses.map((s: any) => (
                    <SelectItem
                      key={s.name}
                      value={s.name}
                      className="text-base"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        {s.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ================= EMPLOYEE DISTRIBUTION ================= */}

            <div className="space-y-4">
              <label className="text-base font-semibold block">
                Assign to Employees with Distribution
              </label>

              <div className="border-2 border-[#b98b08]/30 rounded-lg p-4 space-y-3 max-h-60 overflow-y-auto">
                {employees?.map((employee: any) => (
                  <label
                    key={employee.id}
                    className="flex items-center gap-3 cursor-pointer hover:bg-[#fef9e7] p-2 rounded-md transition-colors"
                  >
                    <Checkbox
                      checked={selectedEmployees.some(
                        (e) => e.id === employee.id,
                      )}
                      onCheckedChange={() => toggleEmployee(employee)}
                    />
                    <span className="font-medium text-sm">{employee.name}</span>
                  </label>
                ))}

                {!employees?.length && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No employees found
                  </p>
                )}
              </div>

              {selectedEmployees.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm font-semibold text-gray-700 pb-2 border-b border-[#b98b08]/30">
                    <span className="w-1/3">Employee</span>
                    <span className="w-1/3 text-center">Percentage</span>
                    <span className="w-1/3 text-right">Leads Count</span>
                  </div>

                  {selectedEmployees.map((emp) => (
                    <div key={emp.id} className="flex items-center gap-3">
                      <div className="w-1/3">
                        <span className="text-sm font-medium">{emp.name}</span>
                      </div>

                      <div className="w-1/3">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={emp.percentage}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              if (val >= 0 && val <= 100) {
                                updateEmployeePercentage(emp.id, val);
                              }
                            }}
                            className="h-9 text-center text-sm border-[#b98b08]/40 focus:border-[#b98b08]"
                          />
                          <span className="text-sm font-medium">%</span>
                        </div>
                      </div>

                      <div className="w-1/3 text-right">
                        <span className="text-sm font-semibold text-[#b98b08]">
                          {emp.count} leads
                        </span>
                      </div>
                    </div>
                  ))}

                  <div
                    className={`flex items-center justify-between p-3 rounded-lg font-semibold ${
                      totalPercentage === 100
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    <span>Total</span>
                    <span>{totalPercentage}%</span>
                    <span>
                      {selectedEmployees.reduce(
                        (sum, emp) => sum + emp.count,
                        0,
                      )}{" "}
                      leads
                    </span>
                  </div>

                  {totalPercentage !== 100 && (
                    <p className="text-xs text-red-600 text-center">
                      ⚠️ Total percentage must equal 100%
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ================= BUTTON ================= */}

            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                (!selectedStatus && selectedEmployees.length === 0) ||
                (selectedEmployees.length > 0 && totalPercentage !== 100)
              }
              className="w-full h-12 text-base bg-[#b98b08] hover:bg-[#a77907] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "Assigning..."
                : selectedEmployees.length > 0
                  ? `Distribute ${totalLeadsToAssign} Leads to ${selectedEmployees.length} Employees`
                  : "Assign Leads"}
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
