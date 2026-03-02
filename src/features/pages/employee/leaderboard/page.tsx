import React from "react";
import Leaderboard from "../../../../components/global/leaderboard";
import { Trophy } from "lucide-react";

const EmployeeLeaderboard = () => {
  return (
    <div className="flex flex-col px-6 py-8">
      <div className="text-center mb-6">
        <h1 className="flex items-center justify-center text-2xl font-bold gap-2">
          <Trophy className="text-[#ba8b09]" />
          Leaderboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Track your performance & unlock achievements 🚀
        </p>
      </div>

      <Leaderboard />
    </div>
  );
};

export default EmployeeLeaderboard;
