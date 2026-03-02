import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLeaderboard } from "../../services/leaderboard.service";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Crown, Medal, User } from "lucide-react";

/* ------------------ HELPERS ------------------ */
export interface LeaderboardRow {
  rank: number;
  employeeId: string;
  name: string;
  email: string;

  totalCalls: number;
  uniqueLeads: number;
  interested: number;
  followUps: number;
  lost: number;
}

const getScore = (row: LeaderboardRow) =>
  row.interested * 50 + row.followUps * 30 + row.uniqueLeads * 10;

const getLevel = (score: number) => {
  if (score >= 1000) return "PLATINUM";
  if (score >= 600) return "GOLD";
  if (score >= 300) return "SILVER";
  if (score >= 100) return "BRONZE";
  return "TRAINEE";
};

const getBadges = (row: LeaderboardRow) => {
  const badges: string[] = [];
  if (row.interested >= 5) badges.push("HIGH_CONVERSION");
  if (row.followUps >= 5) badges.push("FOLLOW_UP_MASTER");
  if (row.uniqueLeads >= 10) badges.push("CONSISTENT_CALLER");
  return badges;
};

const LEVEL_COLORS: Record<string, string> = {
  TRAINEE: "bg-gray-200 text-gray-700",
  BRONZE: "bg-orange-100 text-orange-700",
  SILVER: "bg-slate-200 text-slate-700",
  GOLD: "bg-yellow-100 text-yellow-700",
  PLATINUM: "bg-indigo-100 text-indigo-700",
};

/* ------------------ COMPONENT ------------------ */

export default function Leaderboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", "month"],
    queryFn: () => fetchLeaderboard("month"),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center mt-10 text-gray-500">
        Loading leaderboard...
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex justify-center mt-10 text-gray-500 font-medium">
        No leaderboard data yet
      </div>
    );
  }

  return (
    <div className="mt-6 flex justify-center">
      <div className="w-full max-w-6xl rounded-xl border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead className="text-center">Score</TableHead>
              <TableHead className="text-center">Level</TableHead>
              <TableHead className="text-center">Progress</TableHead>
              <TableHead className="text-center">Badges</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((row: LeaderboardRow, idx: number) => {
              const score = getScore(row);
              const level = getLevel(score);
              const badges = getBadges(row);
              const progress = Math.min(100, Math.floor((score / 1000) * 100));

              return (
                <TableRow
                  key={row.employeeId}
                  className="hover:bg-gray-50 transition"
                >
                  {/* RANK */}
                  <TableCell className="text-center">
                    {idx === 0 && (
                      <Crown className="mx-auto text-yellow-500" size={18} />
                    )}
                    {idx === 1 && (
                      <Medal className="mx-auto text-slate-400" size={18} />
                    )}
                    {idx === 2 && (
                      <Medal className="mx-auto text-amber-600" size={18} />
                    )}
                    {idx > 2 && <span className="font-medium">{idx + 1}</span>}
                  </TableCell>

                  {/* EMPLOYEE */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
                        <User size={16} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{row.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* SCORE */}
                  <TableCell className="text-center font-semibold">
                    {score}
                  </TableCell>

                  {/* LEVEL */}
                  <TableCell className="text-center">
                    <Badge
                      className={`px-3 ${LEVEL_COLORS[level]}`}
                      variant="secondary"
                    >
                      {level}
                    </Badge>
                  </TableCell>

                  {/* PROGRESS */}
                  <TableCell className="text-center">
                    <Badge>{progress}%</Badge>
                  </TableCell>

                  {/* BADGES */}
                  <TableCell>
                    <div className="flex gap-1 justify-center flex-wrap">
                      {badges.length ? (
                        badges.map((b) => (
                          <Badge key={b} className="bg-purple-600 text-white">
                            {b}
                          </Badge>
                        ))
                      ) : (
                        <Badge className="bg-[#ba8b09] text-white">
                          GETTING_STARTED
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
