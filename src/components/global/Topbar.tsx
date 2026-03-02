import React from "react";
import { Bell, LogOut, RefreshCcw, Settings, User2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Link, useLocation } from "react-router-dom";

const Topbar = () => {
  const location = useLocation();

  const userName = localStorage.getItem("name") || "User";
  const userRole = localStorage.getItem("role") || "employee";
  const unreadCount = 0;

  const formatPath = (path: string) => {
    const segments = path.split("/").filter(Boolean).slice(1); // remove role segment

    if (segments.length === 0) return "Dashboard";

    return segments
      .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1))
      .join(" / ");
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="w-full h-[55px] sticky top-0 z-40 flex items-center px-4 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex w-full items-center justify-between">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-3">
          <h1 className="text-[15px] font-semibold text-gray-700">
            CRM / {formatPath(location.pathname)}
          </h1>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">
          {/* Refresh */}

          <RefreshCcw
            size={20}
            className="text-gray-700 cursor-pointer hover:text-gray-900 transition"
            onClick={() => {
              window.location.reload();
            }}
          />

          {/* Notifications */}
          <Link to={`/${userRole}/notifications`} className="relative">
            <Bell size={20} className="text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </Link>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition">
                <Avatar className="border border-gray-300 shadow-sm">
                  <AvatarImage src="/placeholder.jpeg" />
                  <AvatarFallback>
                    {userName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col items-start text-left leading-tight">
                  <span className="text-sm font-medium text-gray-800">
                    {userName}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {userRole}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 bg-white shadow-xl border border-gray-200 rounded-lg"
            >
              <DropdownMenuLabel className="font-semibold text-gray-700">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem className="cursor-pointer hover:bg-gray-100">
                <User2 className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer hover:bg-gray-100">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-red-600 cursor-pointer hover:bg-red-50"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
