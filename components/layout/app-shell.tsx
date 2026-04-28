import { Sidebar } from "./sidebar";
import { AnnouncementBanner } from "@/components/home/announcement-banner";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-screen h-screen overflow-hidden bg-[color:var(--aw-bg)]">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden h-full">
        <AnnouncementBanner />
        <div className="flex flex-1 min-w-0 min-h-0 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
