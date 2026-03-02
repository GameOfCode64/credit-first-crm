import { api } from "../lib/api";

export interface Campaign {
  id: string;
  name: string;
  source?: string;
  createdAt: string;
  _count?: {
    leads: number;
  };
}

export const fetchCampaigns = async (): Promise<Campaign[]> => {
  const res = await api.get("/campaigns");
  return res.data;
};

export const fetchCampaignById = async (
  campaignId: string,
): Promise<Campaign> => {
  if (!campaignId) {
    throw new Error("campaignId is required");
  }
  const res = await api.get(`/campaigns/${campaignId}`);
  return res.data;
};
