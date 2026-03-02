import React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Checkbox } from "../../../../../components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";
import { Lead } from "../../../../../types/leads.types";

interface Props {
  leads: Lead[];
  loading: boolean;
  selectedLeadIds: string[];
  setSelectedLeadIds: (ids: string[] | ((prev: string[]) => string[])) => void;
}

export default function LeadsTable({
  leads,
  loading,
  selectedLeadIds,
  setSelectedLeadIds,
}: Props) {
  const columns = [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={
            leads.length > 0 &&
            leads.every((l) => selectedLeadIds.includes(l.id))
          }
          onCheckedChange={(v) =>
            setSelectedLeadIds((prev) =>
              v
                ? Array.from(new Set([...prev, ...leads.map((l) => l.id)]))
                : prev.filter((id) => !leads.some((l) => l.id === id)),
            )
          }
        />
      ),

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cell: ({ row }: any) => (
        <Checkbox
          checked={selectedLeadIds.includes(row.original.id)}
          onCheckedChange={() => toggle(row.original.id)}
        />
      ),
    },
    { header: "Company Name", accessorKey: "companyName" },
    { header: "Person Name", accessorKey: "personName" },
    { header: "Phone", accessorKey: "phone" },
    {
      header: "Department",
      accessorFn: (r: Lead) => r.meta?.department ?? "—",
    },
    { header: "State", accessorFn: (r: Lead) => r.meta?.state ?? "—" },
    { header: "Status", accessorKey: "status" },
    {
      header: "Contract Amount",
      accessorFn: (r: Lead) => r.meta?.contractAmt ?? "—",
    },
    { header: "ROC", accessorFn: (r: Lead) => r.meta?.roc ?? "—" },
    {
      header: "Assigned To",
      accessorFn: (r: Lead) => r.assignedToName ?? "—",
    },
  ];

  const table = useReactTable({
    data: leads,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const toggle = (id: string) => {
    setSelectedLeadIds((prev: string[]) =>
      prev.includes(id) ? prev.filter((x: string) => x !== id) : [...prev, id],
    );
  };

  if (loading) return <div className="p-4">Loading leads…</div>;

  return (
    <div className="relative w-full overflow-hidden rounded-md border bg-white">
      <div className="overflow-x-auto">
        <Table className="min-w-350">
          <TableHeader className="sticky top-0 bg-white z-10">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No leads found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
