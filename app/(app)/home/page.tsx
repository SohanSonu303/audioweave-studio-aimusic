import { Greeting } from "@/components/home/greeting";
import { QuickToolGrid } from "@/components/home/quick-tool-grid";
import { RecentList } from "@/components/home/recent-list";
import { ChatbotPanel } from "@/components/home/chatbot-panel";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-7">
        <Greeting />
        <QuickToolGrid />
        <div className="grid grid-cols-2 gap-5">
          <RecentList />
          <div className="px-[15px]">
            <ChatbotPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
