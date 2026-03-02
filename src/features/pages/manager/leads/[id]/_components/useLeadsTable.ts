"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { useLeadsTableStore } from "@/hooks/useLeadsTableStore";

export function useLeadsTable(campaignId: string) {
  const { search, statuses, assignees } = useLeadsTableStore();

  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: [
      "leads",
      campaignId,
      page,
      search,
      statuses.join(","),
      assignees.join(","),
    ],
    queryFn: async () => {
      const res = await api.get("/leads", {
        params: {
          campaignId,
          page,
          search: search || undefined,
          statuses: statuses.length ? statuses.join(",") : undefined,
          assignees: assignees.length ? assignees.join(",") : undefined,
        },
      });

      return res.data; // { data: [], pagination: {} }
    },
  });

  return {
    data: query.data?.data ?? [], // 🔥 FIX HERE
    pagination: query.data?.pagination ?? null, // 🔥 FIX HERE
    isLoading: query.isLoading,
    page,
    setPage,
    refresh: query.refetch,
  };
}
