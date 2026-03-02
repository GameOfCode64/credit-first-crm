import { Pencil, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { CallOutcomeConfig } from "../../../../../types/pipeline.types";
import { deleteOutcome } from "../../../../../services/pipeline.service";
import { useOutcomeReasonModal } from "../../../../../hooks/useOutcomeModal";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../../components/ui/alert-dialog";

export default function OutcomeCard({
  outcome,
}: {
  outcome: CallOutcomeConfig;
}) {
  const qc = useQueryClient();
  const { open } = useOutcomeReasonModal();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteOutcome(outcome.id),
    onSuccess: () => {
      toast.success("Outcome deleted");
      qc.invalidateQueries({ queryKey: ["pipeline"] });
      setConfirmDelete(false);
    },
    onError: (e: any) => toast.error(e.message || "Delete failed"),
  });

  return (
    <>
      <div
        className="group flex justify-between items-center rounded-md border px-3 py-2"
        style={{ backgroundColor: outcome.color || undefined }}
      >
        <div>
          <p className="font-medium text-sm">{outcome.name}</p>
          <p className="text-xs text-gray-700">
            {outcome.reasons.length} reasons
          </p>
        </div>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={() =>
              open(outcome.stage, {
                outcomeId: outcome.id,
                key: outcome.key,
                name: outcome.name,
                stage: outcome.stage,
                color: outcome.color,
                reasons: outcome.reasons,
              })
            }
          >
            <Pencil size={14} />
          </button>

          {!outcome.isSystem && (
            <button onClick={() => setConfirmDelete(true)}>
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Outcome</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{outcome.name}"
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
