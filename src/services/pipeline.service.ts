import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { PipelineResponse } from "../types/pipeline.types";

// Define the type
export interface OutcomePayload {
  name: string;
  stage: string;
  reasons: string[];
}

export const fetchPipeline = async (): Promise<PipelineResponse> => {
  const res = await api.get("/pipeline");
  return res.data;
};

export const deleteReason = async (id: string) => {
  const res = await api.delete(`/pipeline/reasons/${id}`);
  return res.data;
};

export const deleteOutcome = async (id: string) => {
  const res = await api.delete(`/pipeline/outcomes/${id}`); // Fixed endpoint
  return res.data;
};

export const createOutcome = async (payload: OutcomePayload) => {
  const res = await api.post("/pipeline/outcomes", payload);
  return res.data;
};

export const updateOutcome = async (id: string, payload: OutcomePayload) => {
  const res = await api.put(`/pipeline/outcomes/${id}`, payload);
  return res.data;
};

export const usePipeline = () => {
  return useQuery({
    queryKey: ["pipeline"],
    queryFn: fetchPipeline,
  });
};
