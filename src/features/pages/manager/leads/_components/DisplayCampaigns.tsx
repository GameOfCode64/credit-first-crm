import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchCampaigns, Campaign } from "@/services/campaign.service";
import { Link } from "react-router-dom";

/* ================= COMPONENT ================= */

export default function DisplayCampaigns() {
  const { data, isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: fetchCampaigns,
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* HEADER */}

      {/* EMPTY STATE */}
      {!data?.length ? (
        <div className="flex flex-col items-center justify-center h-[400px] bg-white rounded-xl border">
          <FolderOpen size={48} className="text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">
            No campaigns yet
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Upload leads or create a campaign to get started
          </p>
          <Button className="bg-[#b98b08] hover:bg-[#a47a07]">
            Create Campaign
          </Button>
        </div>
      ) : (
        <div>
          <div className="p-0  shadow-none">
            <table className="w-full text-sm">
              <thead className="text-gray-600">
                <tr className="text-center">
                  <th className="text-left px-6 py-4">Campaign</th>
                  <th className="text-center px-4 py-4">Leads</th>
                  <th className="text-left px-4 py-4">Source</th>
                  <th className="text-left px-4 py-4">Created</th>
                  <th className="text-right px-6 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {data.map((c: Campaign) => (
                  <tr
                    key={c.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    {/* NAME */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{c.name}</p>
                        {c.name && (
                          <p className="text-xs text-gray-500">
                            {c.name.toLowerCase().replace(/\s+/g, "-")} -{" "}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* LEADS */}
                    <td className="text-center font-bold">
                      {c._count?.leads ?? 0}
                    </td>

                    {/* SOURCE */}
                    <td className="px-4 py-4 text-gray-600">
                      {c.source ?? "Manual"}
                    </td>

                    {/* CREATED */}
                    <td className="px-4 py-4 text-gray-600">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/manager/leads/${c.id}`}>
                          <Button size="sm" variant="outline">
                            View Leads
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
