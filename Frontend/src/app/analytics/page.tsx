import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { RLCharts } from "@/components/analytics/RLCharts";
import { RewardGraph } from "@/components/analytics/RewardGraph";
import { ModelStats } from "@/components/analytics/ModelStats";

export const metadata = { title: "Analytics — MedPredict AI" };

export default function AnalyticsPage() {
  return (
    <LayoutWrapper>
      <div className="max-w-screen-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1A2744]">AI Analytics</h1>
          <p className="text-[#64748B] text-sm mt-1">
            CNN + Reinforcement Learning model performance and training insights
          </p>
        </div>

        <ModelStats />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <RLCharts />
          <RewardGraph />
        </div>
      </div>
    </LayoutWrapper>
  );
}