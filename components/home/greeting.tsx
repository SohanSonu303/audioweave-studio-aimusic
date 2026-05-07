"use client";

import { useUser } from "@clerk/nextjs";
import { getGreeting } from "@/lib/utils";

export function Greeting() {
  const { user } = useUser();
  const name = user?.firstName ?? user?.username ?? "there";
  const greeting = getGreeting();

  return (
    <div className="mb-7">
      <div className="text-[11px] text-[color:var(--aw-text-3)] font-medium tracking-[0.05em] uppercase mb-1">
        My Workspace
      </div>
      <h1
        className="font-light text-[38px] tracking-[-0.5px] text-[color:var(--aw-text)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {greeting && `${greeting}, `}{name}
      </h1>
    </div>
  );
}
