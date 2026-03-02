"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchCampaigns } from "@/services/campaign.service";
import { assignCampaign } from "@/services/upload.service";

import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "../../../../../components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { Alert, AlertDescription } from "../../../../../components/ui/alert";
import toast from "react-hot-toast";

type CampaignOption = "existing" | "new";

interface Props {
  uploadId: string;
  onNext: () => void;
  onBack: () => void;
}

export default function CampaignStep({ uploadId, onNext, onBack }: Props) {
  const [option, setOption] = useState<CampaignOption>("existing");
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [newCampaignName, setNewCampaignName] = useState("");

  /* ================= FETCH CAMPAIGNS ================= */

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: fetchCampaigns,
  });

  /* ================= ASSIGN CAMPAIGN ================= */

  const mutation = useMutation({
    mutationFn: async () => {
      if (option === "existing") {
        return assignCampaign(uploadId, {
          type: "existing",
          campaignId: selectedCampaignId,
        });
      }

      return assignCampaign(uploadId, {
        type: "new",
        name: newCampaignName.trim(),
      });
    },
    onSuccess: () => {
      toast.success("Campaign assigned");
      onNext();
    },
    onError: (e: any) => toast.error(e.message || "Failed to assign campaign"),
  });

  const canContinue =
    (option === "existing" && selectedCampaignId) ||
    (option === "new" && newCampaignName.trim());

  /* ================= UI ================= */

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Assign to Campaign</h2>
        <p className="text-gray-600">Choose where these leads should belong</p>
      </div>

      <RadioGroup
        value={option}
        onValueChange={(v) => setOption(v as CampaignOption)}
        className="space-y-4 mb-8"
      >
        {/* EXISTING */}
        <div
          className={`p-5 rounded-xl border-2 ${
            option === "existing"
              ? "border-[#b98b08] bg-[#b98b08]/5"
              : "border-gray-200"
          }`}
        >
          <div className="flex gap-3">
            <RadioGroupItem value="existing" />
            <div className="flex-1">
              <Label className="font-semibold mb-3 block">
                Add to Existing Campaign
              </Label>

              {option === "existing" && (
                <Select
                  value={selectedCampaignId}
                  onValueChange={setSelectedCampaignId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={isLoading ? "Loading..." : "Select campaign"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>

        {/* NEW */}
        <div
          className={`p-5 rounded-xl border-2 ${
            option === "new"
              ? "border-[#b98b08] bg-[#b98b08]/5"
              : "border-gray-200"
          }`}
        >
          <div className="flex gap-3">
            <RadioGroupItem value="new" />
            <div className="flex-1">
              <Label className="font-semibold mb-3 block">
                Create New Campaign
              </Label>

              {option === "new" && (
                <Input
                  placeholder="Campaign name"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                />
              )}
            </div>
          </div>
        </div>
      </RadioGroup>

      <Alert className="mb-8">
        <AlertDescription>
          Campaigns help you track lead sources and performance.
        </AlertDescription>
      </Alert>

      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>

        <Button
          disabled={!canContinue || mutation.isPending}
          onClick={() => mutation.mutate()}
          className="bg-[#b98b08]"
        >
          {mutation.isPending ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
