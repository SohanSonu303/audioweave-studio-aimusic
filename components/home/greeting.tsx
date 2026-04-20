"use client";

import { useState, useEffect } from "react";
import { getGreeting } from "@/lib/utils";

interface GreetingProps {
  name?: string;
}

export function Greeting({ name = "Sohan" }: GreetingProps) {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

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
