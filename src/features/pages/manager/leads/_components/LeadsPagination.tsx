import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../../../../components/ui/pagination";

export default function LeadsPagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={() => onChange(Math.max(1, page - 1))} />
        </PaginationItem>

        {[...Array(totalPages)].slice(0, 5).map((_, i) => {
          const p = i + 1;
          return (
            <PaginationItem key={p}>
              <PaginationLink isActive={p === page} onClick={() => onChange(p)}>
                {p}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            onClick={() => onChange(Math.min(totalPages, page + 1))}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
