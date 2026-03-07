import {
  LayoutDashboard,
  Users,
  Target,
  Clock,
  BarChart3,
  Settings,
  Bell,
  FileText,
  Phone,
  Kanban,
  Upload,
  Trophy,
  FileChartPie,
  Form,
  PhoneCall,
  Unplug,
  Search,
} from "lucide-react";

interface NavigationProps {
  role: string;
}

export const getNavigationItems = ({ role }: NavigationProps) => {
  if (role === "admin") {
    return {
      main: [
        {
          title: "Dashboard",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
        },
      ],
      sections: [
        {
          label: "Management",
          items: [
            { title: "Users", href: "/admin/users", icon: Users },
            { title: "Reports", href: "/admin/reports", icon: BarChart3 },
          ],
        },
        {
          label: "System",
          items: [
            {
              title: "Upload Client Data",
              href: "/admin/client-data",
              icon: FileText,
            },
            {
              title: "Announcements",
              href: "/admin/announcements",
              icon: Bell,
            },
            {
              title: "Upload Calling Data",
              href: "/admin/calling-logs",
              icon: Phone,
            },
            { title: "Settings", href: "/admin/settings", icon: Settings },
          ],
        },
      ],
    };
  }

  if (role === "manager") {
    return {
      main: [
        {
          title: "Dashboard",
          href: "/manager/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Search",
          href: "/manager/search",
          icon: Search,
        },
      ],
      sections: [
        {
          label: "Team Management",
          items: [
            { title: "Leads", href: "/manager/leads", icon: Target },
            { title: "Team", href: "/manager/team-management", icon: Users },
            {
              title: "Uploads Leads",
              href: "/manager/uploads",
              icon: Upload,
            },
            {
              title: "Campaign Dashboard",
              href: "/manager/campaign-dashboard",
              icon: PhoneCall,
            },
            {
              title: "Sales Pipeline",
              href: "/manager/pipeline",
              icon: Kanban,
            },
            {
              title: "Create Sales form",
              href: "/manager/form",
              icon: Form,
            },
          ],
        },
        {
          label: "Personal",
          items: [
            {
              title: "Reports",
              href: "/manager/reports",
              icon: FileChartPie,
            },
            {
              title: "Integrations",
              href: "/manager/integrations",
              icon: Unplug,
            },
          ],
        },
      ],
    };
  }

  if (role === "employee") {
    return {
      main: [
        {
          title: "Dashboard",
          href: "/employee/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Search",
          href: "/employee/search",
          icon: Search,
        },
        {
          title: "My Calls",
          href: "/employee/my-calls",
          icon: Phone,
        },
        {
          title: "Calling Report",
          href: "/employee/calling-report",
          icon: FileChartPie,
        },
      ],
      sections: [
        {
          label: "Personal",
          items: [
            {
              title: "Attendance",
              href: "/employee/attendance",
              icon: Clock,
            },
          ],
        },
      ],
    };
  }

  return { main: [], sections: [] };
};
