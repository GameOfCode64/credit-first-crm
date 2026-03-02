import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../../../../components/ui/button";
import { Checkbox } from "../../../../../components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../../../../components/ui/dropdown-menu";
import { ChevronDown, Users } from "lucide-react";
import { fetchEmployees } from "../../../../../services/leads.service";

interface Employee {
  id: string;
  name: string;
  email: string;
}

interface Props {
  selectedEmployeeIds: string[];
  setSelectedEmployeeIds: (
    ids: string[] | ((prev: string[]) => string[]),
  ) => void;
}

const EmployeeMultiSelect = ({
  selectedEmployeeIds,
  setSelectedEmployeeIds,
}: Props) => {
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });

  const toggleEmployee = (id: string) => {
    setSelectedEmployeeIds((prev: string[]) =>
      prev.includes(id) ? prev.filter((x: string) => x !== id) : [...prev, id],
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button">
          <Button variant="outline" className="flex gap-2 min-w-[180px]">
            <Users size={14} />
            {selectedEmployeeIds.length
              ? `${selectedEmployeeIds.length} Selected`
              : "Select Employees"}
            <ChevronDown size={14} />
          </Button>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 max-h-64 overflow-y-auto p-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground px-2 py-1">
            Loading employees…
          </p>
        ) : employees.length === 0 ? (
          <p className="text-sm text-muted-foreground px-2 py-1">
            No employees found
          </p>
        ) : (
          employees.map((emp: Employee) => (
            <label
              key={emp.id}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted cursor-pointer"
            >
              <Checkbox
                checked={selectedEmployeeIds.includes(emp.id)}
                onCheckedChange={() => toggleEmployee(emp.id)}
              />
              <div className="flex flex-col text-sm">
                <span className="font-medium">{emp.name}</span>
                <span className="text-xs text-muted-foreground">
                  {emp.email}
                </span>
              </div>
            </label>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EmployeeMultiSelect;
