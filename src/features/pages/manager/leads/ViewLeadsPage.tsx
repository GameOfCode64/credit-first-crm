import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import DisplayCampaigns from "./_components/DisplayCampaigns";

const ManagerLeadsPage = () => {
  return (
    <div className="flex flex-col px-6 py-8">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold">Leads Management</h1>
        <p className="text-sm text-gray-500 font-semibold">
          Track and manage your sales pipeline
        </p>
      </div>
      <Card className="w-full border-none mt-6">
        <CardHeader>
          <CardTitle>All Campaign</CardTitle>
          <CardDescription>
            Manage your all campaigns and track your sales pipeline effectively
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DisplayCampaigns />
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerLeadsPage;
