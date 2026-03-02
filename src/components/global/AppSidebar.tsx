import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CreditCard,
  LogOut,
  Settings,
  User,
  Phone,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";

import { ScrollArea } from "../../components/ui/scroll-area";

import { getNavigationItems } from "../../utils/sidebarLinks";
import { fetchCampaigns } from "../../services/campaign.service";

interface AppSidebarProps {
  role?: "admin" | "manager" | "employee";
}

export function AppSidebar({ role = "employee" }: AppSidebarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const navItems = getNavigationItems({ role });

  const [campaignPopoverOpen, setCampaignPopoverOpen] = useState(false);

  const name = localStorage.getItem("name") || "User";
  const isActive = (href: string) => pathname === href;

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: fetchCampaigns,
    enabled: campaignPopoverOpen,
  });

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleCampaignSelect = (campaignId: string | null) => {
    setCampaignPopoverOpen(false);
    navigate(`/manager/campaign-dashboard/${campaignId}`);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="w-16 h-screen flex flex-col bg-[#b98b08] border-r border-black/10">
        {/* TOP LOGO */}
        <div className="h-16 flex items-center justify-center shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-white/15 text-white cursor-pointer">
                <CreditCard size={16} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">Credit First CRM</TooltipContent>
          </Tooltip>
        </div>

        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center gap-1 py-2">
          {[...navItems.main, ...navItems.sections.flatMap((s) => s.items)].map(
            (item) => {
              if (item.href === "/manager/campaign-dashboard") {
                return (
                  <Popover
                    key={item.href}
                    open={campaignPopoverOpen}
                    onOpenChange={setCampaignPopoverOpen}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <button
                            className={`h-10 w-10 flex items-center justify-center rounded-lg transition
                              ${
                                isActive(item.href)
                                  ? "bg-white text-[#b98b08]"
                                  : "text-white hover:bg-white/15"
                              }`}
                          >
                            <item.icon className="h-5 w-5" />
                          </button>
                        </PopoverTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.title}</TooltipContent>
                    </Tooltip>

                    <PopoverContent
                      side="right"
                      align="start"
                      className="w-80 p-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="border-b p-4 flex items-center gap-2">
                          <Phone className="w-5 h-5 text-[#b98b08]" />
                          <h4 className="font-semibold text-sm">Campaigns</h4>
                        </div>

                        <Link
                          to="/manager/leads"
                          className="text-sm text-[#b98b08] hover:underline px-4"
                        >
                          View All{" "}
                          <ArrowRight className="w-3 h-3 inline-block" />
                        </Link>
                      </div>

                      <ScrollArea className="h-80">
                        <div className="p-3 space-y-2">
                          {isLoading && (
                            <div className="text-center py-6">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#b98b08] mx-auto"></div>
                              <p className="text-xs text-gray-500 mt-2">
                                Loading...
                              </p>
                            </div>
                          )}

                          {!isLoading &&
                            campaigns.map((campaign: any) => (
                              <button
                                key={campaign.id}
                                onClick={() => {
                                  (handleCampaignSelect(campaign.id),
                                    console.log(campaign.id));
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 text-left"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm truncate">
                                    {campaign.name}
                                  </span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </button>
                            ))}

                          {!isLoading && campaigns.length === 0 && (
                            <div className="text-center py-8 text-sm text-gray-500">
                              No campaigns found
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                );
              }

              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.href}
                      className={`h-10 w-10 flex items-center justify-center rounded-lg transition
                        ${
                          isActive(item.href)
                            ? "bg-white text-[#b98b08]"
                            : "text-white hover:bg-white/15"
                        }`}
                    >
                      <item.icon className="h-5 w-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.title}</TooltipContent>
                </Tooltip>
              );
            },
          )}
        </div>

        {/* FOOTER */}
        <div className="h-16 flex items-center justify-center shrink-0">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button className="h-9 w-9 rounded-full bg-white/15 text-white font-semibold">
                    {name.substring(0, 2).toUpperCase()}
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right">Account</TooltipContent>
            </Tooltip>

            <DropdownMenuContent side="right" align="end" className="w-52">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="text-destructive" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  );
}
