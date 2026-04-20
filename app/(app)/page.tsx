import { AnnouncementBanner } from "@/components/home/announcement-banner";
import { Greeting } from "@/components/home/greeting";
import { QuickToolGrid } from "@/components/home/quick-tool-grid";
import { RecentList } from "@/components/home/recent-list";
import { QuickStart } from "@/components/home/quick-start";
import { CreditsSummary } from "@/components/home/credits-summary";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AnnouncementBanner />
      <div className="flex-1 overflow-y-auto p-7">
        <Greeting />
        <QuickToolGrid />
        <div className="grid grid-cols-2 gap-5">
          <RecentList />
          <div>
            <QuickStart />
            <CreditsSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
