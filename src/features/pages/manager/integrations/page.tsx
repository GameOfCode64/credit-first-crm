import React, { useState } from "react";
import { Search } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const ManagerIntegrations = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const integrations: Integration[] = [
    {
      id: "99acres",
      name: "99acres",
      description: "Capture 99acres Leads in your CRM account",
      icon: "🏢",
      color: "#3B82F6",
    },
    {
      id: "callerdesk",
      name: "CallerDesk",
      description: "Integrate CallerDesk in your CRM account",
      icon: "📞",
      color: "#EF4444",
    },
    {
      id: "embedded-apps",
      name: "Embedded Apps",
      description: "Integrate embedded apps in your CRM Account",
      icon: "🔲",
      color: "#000000",
    },
    {
      id: "facebook",
      name: "Facebook",
      description:
        "Receive new leads from your Facebook & Instagram Lead Ads in your CRM account",
      icon: "📘",
      color: "#1877F2",
    },
    {
      id: "google-meet",
      name: "Google Meet",
      description: "Integrate google meet in your CRM Account",
      icon: "📹",
      color: "#34A853",
    },
    {
      id: "google-sheets",
      name: "Google Sheets",
      description: "Integrate Google sheet in your CRM account",
      icon: "📊",
      color: "#0F9D58",
    },
    {
      id: "housing",
      name: "Housing",
      description: "Integrate Housing.com in your CRM account",
      icon: "🏠",
      color: "#F59E0B",
    },
    {
      id: "indiamart",
      name: "IndiaMart",
      description: "Integrate IndiaMart in your CRM account",
      icon: "🛒",
      color: "#DC2626",
    },
    {
      id: "justdial",
      name: "JustDial",
      description: "Integrate Just Dial in your CRM account",
      icon: "📱",
      color: "#F59E0B",
    },
    {
      id: "knowlarity",
      name: "Knowlarity",
      description: "Integrate Knowlarity in your CRM account",
      icon: "☎️",
      color: "#6366F1",
    },
  ];

  const filteredIntegrations = integrations.filter((integration) =>
    integration.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex items-center border-b border-gray-200">
            <button className="px-6 py-4 text-indigo-600 border-b-2 border-indigo-600 font-medium">
              Integrations
            </button>
          </div>
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search Integration by name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Integrations List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Available Integration ({filteredIntegrations.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="px-6 py-3 bg-gray-50">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                INTEGRATIONS
              </h3>
            </div>

            {filteredIntegrations.map((integration) => (
              <div
                key={integration.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${integration.color}20` }}
                  >
                    {integration.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {integration.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {integration.description}
                    </p>
                  </div>
                </div>
                <button className="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-full text-sm font-medium hover:bg-indigo-50 transition-colors">
                  Activate now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerIntegrations;
