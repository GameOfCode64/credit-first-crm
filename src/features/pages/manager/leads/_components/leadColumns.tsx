import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "../../../../../components/ui/checkbox";

export type LeadRow = {
  id: string;
  companyName: string;
  personName: string;
  phone: string;
  status: string;
  assignedTo?: string;
  assignedToName?: string;
  meta?: {
    department?: string;
    state?: string;
    roc?: string;
    contractAmt?: number;
  };
  createdAt: string;
};

export const leadColumns: ColumnDef<LeadRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  { accessorKey: "companyName", header: "Company Name" },
  { accessorKey: "personName", header: "Contact Person" },
  { accessorKey: "phone", header: "Mobile No" },

  {
    header: "Department",
    cell: ({ row }) => row.original.meta?.department ?? "-",
  },
  {
    header: "State",
    cell: ({ row }) => row.original.meta?.state ?? "-",
  },
  {
    header: "ROC",
    cell: ({ row }) => row.original.meta?.roc ?? "-",
  },
  {
    header: "Contract Amt",
    cell: ({ row }) =>
      row.original.meta?.contractAmt
        ? `₹${row.original.meta.contractAmt}`
        : "-",
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className="capitalize font-medium">{row.getValue("status")}</span>
    ),
  },

  {
    header: "Assigned To",
    cell: ({ row }) => row.original.assignedToName || "—",
  },

  {
    header: "Created",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
];
