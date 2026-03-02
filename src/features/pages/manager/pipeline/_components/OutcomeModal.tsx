import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../../components/ui/dialog";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";

import {
  createOutcome,
  updateOutcome,
} from "../../../../../services/pipeline.service";
import { useOutcomeReasonModal } from "../../../../../hooks/useOutcomeModal";

export default function OutcomeModal() {
  const { isOpen, close, payload } = useOutcomeReasonModal();
  const qc = useQueryClient();

  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [stage, setStage] = useState<"ACTIVE" | "CLOSED">("ACTIVE");
  const [reasons, setReasons] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!payload) {
      setName("");
      setColor("#3b82f6");
      setReasons([]);
      return;
    }

    setName(payload.name);
    setStage(payload.stage);
    setColor(payload.color);
    setReasons(payload.reasons?.map((r: any) => r.label) || []);
  }, [payload]);

  const mutation = useMutation({
    mutationFn: () =>
      payload?.outcomeId
        ? updateOutcome(payload.outcomeId, { name, color, reasons })
        : createOutcome({
            key: name.toUpperCase().replace(/\s+/g, "_"),
            name,
            stage,
            color,
            reasons,
          }),
    onSuccess: () => {
      toast.success("Saved successfully");
      qc.invalidateQueries({ queryKey: ["pipeline"] });
      close();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{payload ? "Edit Outcome" : "Add Outcome"}</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Outcome name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />

        <div className="flex gap-2">
          <Input
            placeholder="Add reason"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button
            onClick={() => {
              if (!input.trim()) return;
              setReasons([...reasons, input]);
              setInput("");
            }}
          >
            Add
          </Button>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()}>
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
