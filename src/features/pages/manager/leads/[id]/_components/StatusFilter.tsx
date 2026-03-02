"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

import { api } from "@/lib/api";
import { useLeadsTableStore } from "@/hooks/useLeadsTableStore";

export default function StatusFilter() {
  const { search, setSearch, statuses, setStatuses, assignees, setAssignees } =
    useLeadsTableStore();

  /* ================= PIPELINE ================= */

  const { data: pipeline } = useQuery({
    queryKey: ["pipeline"],
    queryFn: async () => (await api.get("/pipeline")).data,
  });

  /* ================= EMPLOYEES ================= */

  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => (await api.get("/users/employees")).data,
  });

  /* ================= HELPERS ================= */

  const toggleStatus = (value: string) => {
    setStatuses(
      statuses.includes(value)
        ? statuses.filter((s) => s !== value)
        : [...statuses, value],
    );
  };

  const toggleEmployee = (id: string) => {
    setAssignees(
      assignees.includes(id)
        ? assignees.filter((a) => a !== id)
        : [...assignees, id],
    );
  };

  // Normalize initialStage to match the format of activeStage and closedStage
  const normalizedInitialStage =
    pipeline?.initialStage?.map((item: any) => {
      if (typeof item === "object" && item !== null) {
        return item;
      }
      return {
        name: item,
        color: "#9ca3af",
        key: item,
        stage: "INITIAL",
      };
    }) || [];

  /* ================= RENDER ================= */

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* ================= GLOBAL SEARCH ================= */}
      <Input
        placeholder="Search by name / phone / company"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-64"
      />

      {/* ================= STATUS SELECT ================= */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            Status
            {statuses.length > 0 && (
              <span className="text-xs bg-muted px-2 rounded">
                {statuses.length}
              </span>
            )}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-80 p-3" align="start">
          <ScrollArea className="h-72 pr-2">
            <div className="space-y-4">
              {/* INITIAL */}
              {normalizedInitialStage.length > 0 && (
                <StageGroup
                  label="Initial"
                  items={normalizedInitialStage}
                  selected={statuses}
                  onToggle={toggleStatus}
                />
              )}

              {/* ACTIVE */}
              {pipeline?.activeStage?.length > 0 && (
                <StageGroup
                  label="Active"
                  items={pipeline.activeStage}
                  selected={statuses}
                  onToggle={toggleStatus}
                />
              )}

              {/* CLOSED */}
              {pipeline?.closedStage?.length > 0 && (
                <StageGroup
                  label="Closed"
                  items={pipeline.closedStage}
                  selected={statuses}
                  onToggle={toggleStatus}
                />
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* ================= EMPLOYEE SELECT ================= */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            Assignees
            {assignees.length > 0 && (
              <span className="text-xs bg-muted px-2 rounded">
                {assignees.length}
              </span>
            )}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-72 p-3" align="start">
          <ScrollArea className="h-56 pr-2">
            <div className="space-y-2">
              {employees?.map((e: any) => (
                <label
                  key={e.id}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Checkbox
                    checked={assignees.includes(e.id)}
                    onCheckedChange={() => toggleEmployee(e.id)}
                  />
                  <span>{e.name}</span>
                </label>
              ))}

              {!employees?.length && (
                <p className="text-xs text-muted-foreground">
                  No employees found
                </p>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/* ================= SUB COMPONENT ================= */

function StageGroup({
  label,
  items,
  selected,
  onToggle,
}: {
  label: string;
  items: any[];
  selected: string[];
  onToggle: (name: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground mb-2">
        {label}
      </p>

      <div className="space-y-2">
        {items.map((s) => (
          <label
            key={s.name}
            className="flex items-center gap-2 text-sm cursor-pointer"
          >
            <Checkbox
              checked={selected.includes(s.name)}
              onCheckedChange={() => onToggle(s.name)}
            />
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span>{s.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
