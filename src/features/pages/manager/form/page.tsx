import React from "react";
import FormBuilder from "./_components/FormBuilder";

const SalesForm = () => {
  return (
    <div className="flex flex-col px-6 py-8">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold">Create Sales form</h1>
        <p className="text-sm text-gray-500 font-semibold">
          Configure your Sales form as you want :)
        </p>
      </div>
      <FormBuilder />
    </div>
  );
};

export default SalesForm;
