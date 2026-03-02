import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { CalendarIcon, Download, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function LeadExportCard() {
  const [from, setFrom] = useState<Date>();
  const [to, setTo] = useState<Date>();
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  // Fetch campaigns
  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await api.get("/campaigns");
      return res.data;
    },
  });

  // Fetch pipeline stages
  const { data: pipeline } = useQuery({
    queryKey: ["pipeline"],
    queryFn: async () => {
      const res = await api.get("/pipeline");
      return res.data;
    },
  });

  // Get all statuses from pipeline
  const allStatuses = [
    ...(pipeline?.initialStage || []),
    ...(pipeline?.activeStage || []),
    ...(pipeline?.closedStage || []),
  ].map((stage: any) => (typeof stage === "string" ? stage : stage.name));

  // Preview mutation
  const previewMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/reports/leads/preview", data);
      return res.data;
    },
    onSuccess: (data) => {
      setPreviewData(data);
      setShowPreview(true);
    },
    onError: () => {
      toast.error("Failed to load preview");
    },
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/reports/leads/export", data, {
        responseType: "blob",
      });
      return res.data;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `leads_${format(from!, "yyyy-MM-dd")}_to_${format(to!, "yyyy-MM-dd")}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Excel downloaded successfully");
      setShowPreview(false);
    },
    onError: () => {
      toast.error("Export failed");
    },
  });

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((x) => x !== status)
        : [...prev, status],
    );
  };

  const handlePreview = () => {
    if (!from || !to) {
      toast.error("Please select date range");
      return;
    }

    previewMutation.mutate({
      from: format(from, "yyyy-MM-dd"),
      to: format(to, "yyyy-MM-dd"),
      campaignId: selectedCampaign || undefined,
      statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
    });
  };

  const handleExport = () => {
    if (!from || !to) {
      toast.error("Please select date range");
      return;
    }

    exportMutation.mutate({
      from: format(from, "yyyy-MM-dd"),
      to: format(to, "yyyy-MM-dd"),
      campaignId: selectedCampaign || undefined,
      statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Leads & Outcomes Export</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* DATE RANGE */}
          <div className="grid grid-cols-2 gap-4">
            <DatePicker label="From Date" value={from} onChange={setFrom} />
            <DatePicker label="To Date" value={to} onChange={setTo} />
          </div>

          {/* CAMPAIGN SELECTOR */}
          <div className="space-y-2">
            <Label>Campaign (Optional)</Label>
            <Select
              value={selectedCampaign}
              onValueChange={setSelectedCampaign}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Campaigns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                {campaigns.map((campaign: any) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* PIPELINE STATUS FILTER */}
          <div className="space-y-2">
            <Label>Pipeline Status (Optional)</Label>
            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer font-medium">
                  <Checkbox
                    checked={selectedStatuses.length === allStatuses.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedStatuses(allStatuses);
                      } else {
                        setSelectedStatuses([]);
                      }
                    }}
                  />
                  Select All
                </label>
                <div className="border-t pt-2 space-y-2">
                  {allStatuses.map((status) => (
                    <label
                      key={status}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedStatuses.includes(status)}
                        onCheckedChange={() => toggleStatus(status)}
                      />
                      {status}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Leave empty to export all statuses
            </p>
          </div>

          {/* PREVIEW BUTTON */}
          <Button
            onClick={handlePreview}
            disabled={previewMutation.isPending}
            variant="outline"
            className="w-full"
          >
            {previewMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading Preview...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Preview Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* PREVIEW DIALOG */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Preview Export Data ({previewData.length} records)
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Remark</TableHead>
                  <TableHead>Call Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.length > 0 ? (
                  previewData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {row.leadName || "—"}
                      </TableCell>
                      <TableCell>{row.phone || "—"}</TableCell>
                      <TableCell>{row.company || "—"}</TableCell>
                      <TableCell>{row.campaign || "—"}</TableCell>
                      <TableCell>{row.assignedTo || "—"}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {row.status || "—"}
                        </span>
                      </TableCell>
                      <TableCell>{row.outcome || "—"}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {row.remark || "—"}
                      </TableCell>
                      <TableCell>{row.callDate || "—"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-gray-500"
                    >
                      No data found for selected criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={exportMutation.isPending || previewData.length === 0}
              className="bg-[#b98b08] hover:bg-[#a47a07] text-white"
            >
              {exportMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DatePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: Date;
  onChange: (d?: Date) => void;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "dd MMM yyyy") : "Pick date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-0">
          <Calendar mode="single" selected={value} onSelect={onChange} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
