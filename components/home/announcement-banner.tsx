"use client";

import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";
import { Icon, icons } from "@/components/ui/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AnnouncementBanner() {
  const { signOut } = useClerk();
  const { user } = useUser();

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U"
    : "U";

  return (
    <div className="px-7 py-3 border-b border-[color:var(--aw-border)] flex-shrink-0 flex items-center justify-between">
      {/* Left — marketplace banner */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-[7px] bg-[rgba(232,160,85,0.12)] border border-[rgba(232,160,85,0.25)] rounded-[var(--radius-pill)] px-3 py-[5px] pl-2 cursor-pointer"
      >
        <span className="text-[10px] font-bold bg-[color:var(--aw-accent)] text-black rounded-[4px] px-[6px] py-[1px] tracking-[0.04em]">
          NEW
        </span>
        <span className="text-[12px] text-[color:var(--aw-accent)]">Introducing Music Marketplace</span>
        <Icon d={icons.chevronR} size={12} color="var(--aw-accent)" />
      </Link>

      {/* Right — user menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-[6px] rounded-[var(--radius-pill)] bg-[rgba(255,255,255,0.04)] border border-[color:var(--aw-border)] text-[color:var(--aw-text-2)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[color:var(--aw-text)] transition-all duration-150 outline-none cursor-pointer">
          <Avatar className="w-6 h-6">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback className="text-[10px] font-semibold bg-[color:var(--aw-accent)] text-black">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-[12px] font-medium max-w-[120px] truncate">
            {user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress ?? "Account"}
          </span>
          <Icon d={icons.chevronD} size={12} color="currentColor" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-52 bg-[color:var(--aw-card)] border-[color:var(--aw-border)] text-[color:var(--aw-text)]"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[11px] text-[color:var(--aw-text-3)] font-medium">
              {user?.emailAddresses?.[0]?.emailAddress}
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-[color:var(--aw-border)]" />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="text-[13px] gap-2 cursor-pointer focus:bg-[rgba(255,255,255,0.06)] focus:text-[color:var(--aw-text)]"
            >
              <Icon d={icons.settings} size={13} color="currentColor" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-[color:var(--aw-border)]" />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => signOut({ redirectUrl: "/sign-in" })}
              className="text-[13px] gap-2 cursor-pointer text-[color:var(--aw-red)] focus:bg-[rgba(224,96,96,0.1)] focus:text-[color:var(--aw-red)]"
            >
              <Icon d={icons.close} size={13} color="currentColor" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
