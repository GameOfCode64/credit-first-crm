import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPipeline } from "../../../../../services/pipeline.service";
import PipelineColumn from "./PipelineColumn";
import PipelineSkeleton from "./PipelineSkeleton";
import OutcomeModal from "./OutcomeModal";

const PipelineBoard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["pipeline"],
    queryFn: fetchPipeline,
  });

  if (isLoading) return <PipelineSkeleton />;
  if (!data) return <div className="mt-8 text-gray-500">No pipeline data</div>;

  return (
    <>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* INITIAL */}
        <PipelineColumn
          title="Initial"
          description="New incoming leads"
          stage="INITIAL"
          readOnly
          items={data.initialStage.map((key: string) => ({
            id: key,
            key,
            name: key,
            stage: "INITIAL",
            color: "#f1f5f9",
            reasons: [],
            isSystem: true,
          }))}
        />

        {/* ACTIVE */}
        <PipelineColumn
          title="Active"
          description="Work in progress"
          stage="ACTIVE"
          editable
          items={data.activeStage}
        />

        {/* CLOSED */}
        <PipelineColumn
          title="Closed"
          description="Final outcomes"
          stage="CLOSED"
          editable
          items={data.closedStage}
        />
      </div>

      <OutcomeModal />
    </>
  );
};

export default PipelineBoard;
