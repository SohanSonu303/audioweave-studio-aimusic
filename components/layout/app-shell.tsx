import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-screen h-screen overflow-hidden bg-[color:var(--aw-bg)]">
      <Sidebar />
      <div className="flex flex-1 min-w-0 overflow-hidden h-full">
        {children}
      </div>
    </div>
  );
}
