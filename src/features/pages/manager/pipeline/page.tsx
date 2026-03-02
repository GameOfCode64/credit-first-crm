import React from "react";
import PipelineBoard from "./_components/PipelineBoard";

const SealsPipeline = () => {
  return (
    <div className="px-6 py-8 flex flex-col">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold">Lead stages</h1>
        <p className="text-sm text-gray-500 font-semibold">
          Configure your sales pipeline
        </p>
      </div>

      <PipelineBoard />
    </div>
  );
};

export default SealsPipeline;
