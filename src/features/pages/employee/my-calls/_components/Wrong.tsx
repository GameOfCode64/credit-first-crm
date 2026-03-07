import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const WrongPage = () => {
  return (
    <div className="flex items-center justify-center h-screen flex-col">
      <h1 className="text-xl font-semibold">
        You have Select the Campaign First to Work!
      </h1>
      <p className="text-lg">
        Go to dashboard Click on Any Campaign to work with
      </p>
      <Link to={"/employee/dashboard"} className="mt-4">
        <Button className="bg-[#b98b08] hover:bg-[#b98b08]/90">
          Go to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default WrongPage;
