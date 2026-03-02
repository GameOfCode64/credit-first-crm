"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  TrendingUp,
  Phone,
  Target,
  Award,
  Calendar,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { api } from "@/lib/api";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

const COLORS = {
  primary: "#b98b08",
  success: "#10b981",
  danger: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  purple: "#8b5cf6",
  indigo: "#6366f1",
  pink: "#ec4899",
};

const PIE_COLORS = [
  "#b98b08",
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#f59e0b",
  "#ec4899",
];

interface DashboardStats {
  totalLeads: number;
  activeLeads: number;
  convertedLeads: number;
  lostLeads: number;
  totalCalls: number;
  connectedCalls: number;
  conversionRate: number;
  avgCallsPerDay: number;
  teamPerformance: Array<{
    name: string;
    calls: number;
    conversions: number;
    conversionRate: number;
  }>;
  dailyActivity: Array<{
    date: string;
    calls: number;
    conversions: number;
    leads: number;
  }>;
  statusDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  campaignPerformance: Array<{
    name: string;
    leads: number;
    conversions: number;
    revenue: number;
  }>;
  hourlyActivity: Array<{
    hour: string;
    calls: number;
  }>;
  topPerformers: Array<{
    name: string;
    avatar: string;
    calls: number;
    conversions: number;
    trend: "up" | "down";
  }>;
}

export default function ManagerDashboard() {
  const [dateRange, setDateRange] = useState<
    "today" | "week" | "month" | "quarter"
  >("week");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");

  // Fetch dashboard stats
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["manager-dashboard", dateRange, selectedCampaign],
    queryFn: async () => {
      const res = await api.get("/dashboard/manager", {
        params: {
          dateRange,
          campaignId: selectedCampaign !== "all" ? selectedCampaign : undefined,
        },
      });
      return res.data as DashboardStats;
    },
  });

  // Fetch campaigns for filter
  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await api.get("/campaigns");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b98b08] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">
            Failed to load dashboard
          </p>
          <p className="text-gray-600 text-sm">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Manager Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Overview of team performance and key metrics
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Campaign Filter */}
              <Select
                value={selectedCampaign}
                onValueChange={setSelectedCampaign}
              >
                <SelectTrigger className="w-[200px]">
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

              {/* Date Range Filter */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={dateRange === "today" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDateRange("today")}
                  className={
                    dateRange === "today"
                      ? "bg-[#b98b08] hover:bg-[#a47a07]"
                      : ""
                  }
                >
                  Today
                </Button>
                <Button
                  variant={dateRange === "week" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDateRange("week")}
                  className={
                    dateRange === "week"
                      ? "bg-[#b98b08] hover:bg-[#a47a07]"
                      : ""
                  }
                >
                  Week
                </Button>
                <Button
                  variant={dateRange === "month" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDateRange("month")}
                  className={
                    dateRange === "month"
                      ? "bg-[#b98b08] hover:bg-[#a47a07]"
                      : ""
                  }
                >
                  Month
                </Button>
                <Button
                  variant={dateRange === "quarter" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDateRange("quarter")}
                  className={
                    dateRange === "quarter"
                      ? "bg-[#b98b08] hover:bg-[#a47a07]"
                      : ""
                  }
                >
                  Quarter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Leads"
              value={(stats?.totalLeads || 0).toLocaleString()}
              change="+12%"
              trend="up"
              icon={<Users className="h-5 w-5" />}
              color="blue"
            />
            <KPICard
              title="Conversion Rate"
              value={`${(stats?.conversionRate || 0).toFixed(1)}%`}
              change="+3.2%"
              trend="up"
              icon={<Target className="h-5 w-5" />}
              color="green"
            />
            <KPICard
              title="Total Calls"
              value={(stats?.totalCalls || 0).toLocaleString()}
              change="+8%"
              trend="up"
              icon={<Phone className="h-5 w-5" />}
              color="purple"
            />
            <KPICard
              title="Avg Calls/Day"
              value={Math.round(stats?.avgCallsPerDay || 0).toLocaleString()}
              change="-2%"
              trend="down"
              icon={<Activity className="h-5 w-5" />}
              color="orange"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Activity Trend */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#b98b08]" />
                  Daily Activity Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats?.dailyActivity || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="calls"
                      stackId="1"
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="conversions"
                      stackId="1"
                      stroke={COLORS.success}
                      fill={COLORS.success}
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Lead Status Distribution */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-[#b98b08]" />
                  Lead Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats?.statusDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(stats?.statusDistribution || []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.color || PIE_COLORS[index % PIE_COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team Performance */}
            <Card className="lg:col-span-2 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#b98b08]" />
                  Team Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats?.teamPerformance || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="calls" fill={COLORS.primary} />
                    <Bar dataKey="conversions" fill={COLORS.success} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#b98b08]" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {(stats?.topPerformers || []).length > 0 ? (
                      stats.topPerformers.map((performer, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#b98b08] to-[#d4a72c] text-white flex items-center justify-center font-bold">
                              {performer.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">
                                {performer.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {performer.calls} calls •{" "}
                                {performer.conversions} conversions
                              </p>
                            </div>
                          </div>
                          {performer.trend === "up" ? (
                            <ArrowUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No performance data available</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campaign Performance */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#b98b08]" />
                  Campaign Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(stats?.campaignPerformance || []).length > 0 ? (
                    stats.campaignPerformance.map((campaign, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {campaign.name}
                          </span>
                          <span className="text-sm text-gray-600">
                            {campaign.conversions}/{campaign.leads} leads
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#b98b08] to-[#d4a72c] h-2 rounded-full transition-all"
                            style={{
                              width: `${campaign.leads > 0 ? (campaign.conversions / campaign.leads) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>
                            {campaign.leads > 0
                              ? (
                                  (campaign.conversions / campaign.leads) *
                                  100
                                ).toFixed(1)
                              : 0}
                            % conversion
                          </span>
                          <span className="font-semibold text-[#b98b08]">
                            ₹{(campaign.revenue || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No campaign data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Hourly Activity Heatmap */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#b98b08]" />
                  Hourly Call Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats?.hourlyActivity || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="calls" fill={COLORS.info} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickStatCard
              title="Active Leads"
              value={stats?.activeLeads || 0}
              total={stats?.totalLeads || 1}
              icon={<AlertCircle className="h-5 w-5" />}
              color="blue"
            />
            <QuickStatCard
              title="Converted"
              value={stats?.convertedLeads || 0}
              total={stats?.totalLeads || 1}
              icon={<CheckCircle2 className="h-5 w-5" />}
              color="green"
            />
            <QuickStatCard
              title="Lost"
              value={stats?.lostLeads || 0}
              total={stats?.totalLeads || 1}
              icon={<XCircle className="h-5 w-5" />}
              color="red"
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// KPI Card Component
function KPICard({
  title,
  value,
  change,
  trend,
  icon,
  color,
}: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colorMap[color]}`}>{icon}</div>
          <Badge
            variant={trend === "up" ? "default" : "destructive"}
            className={
              trend === "up"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }
          >
            {trend === "up" ? (
              <ArrowUp className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDown className="h-3 w-3 mr-1" />
            )}
            {change}
          </Badge>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm text-gray-600 mt-1">{title}</p>
      </CardContent>
    </Card>
  );
}

// Quick Stat Card Component
function QuickStatCard({
  title,
  value,
  total,
  icon,
  color,
}: {
  title: string;
  value: number;
  total: number;
  icon: React.ReactNode;
  color: "blue" | "green" | "red";
}) {
  const percentage = ((value / total) * 100).toFixed(1);
  const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-lg ${colorMap[color]}`}>{icon}</div>
          <span className="text-sm font-semibold text-gray-600">
            {percentage}%
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900">
          {value.toLocaleString()}
        </h3>
        <p className="text-sm text-gray-600">
          {title} • of {total.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
