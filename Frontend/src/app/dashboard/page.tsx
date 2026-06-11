import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentCases } from "@/components/dashboard/RecentCases";
import { Charts } from "@/components/dashboard/Charts";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export const metadata = { title: "Dashboard — Symptoms AI" };

export default function DashboardPage() {
  return (
    <LayoutWrapper>
      <div className="max-w-screen-2xl mx-auto space-y-6">
        <DashboardHeader />

        {/* Stats */}
        <StatsCards />

        {/* Charts */}
        <Charts />

        {/* Recent Cases */}
        <RecentCases />
      </div>
    </LayoutWrapper>
  );
}