import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../../components/ui/dialog";
import { Button } from "../../../../../components/ui/button";
import { useOutcomeReasonModal } from "../../../../../hooks/useOutcomeModal";

export default function AddReasonDialog() {
  const { isOpen, close } = useOutcomeReasonModal();

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Reasons</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Reasons are managed inside the outcome editor.
        </p>

        <div className="flex justify-end">
          <Button onClick={close}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
