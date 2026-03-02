import { useParams } from "react-router-dom";
import LeadsTable from "./_components/LeadsTable";
import { useLeadsTable } from "./_components/useLeadsTable";

export default function CampaignLeadIdPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div className="p-6">Invalid ID</div>;
  }

  const { data, isLoading, pagination, page, setPage } = useLeadsTable(id);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Campaign Leads</h1>
        <p className="text-muted-foreground">
          Manage and assign leads for this campaign
        </p>
      </div>

      <LeadsTable
        campaignId={id}
        data={data}
        pagination={pagination ?? undefined} // 🔥 FIX
        isLoading={isLoading}
        page={page}
        setPage={setPage}
      />
    </div>
  );
}
