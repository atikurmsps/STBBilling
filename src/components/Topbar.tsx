"use client";
import { useSession } from "next-auth/react";
import { useSidebar } from "./SidebarProvider";
import { Menu } from "lucide-react";

export default function Topbar() {
  const { data } = useSession();
  const name = data?.user?.name || "";
  const { toggleSidebar } = useSidebar();
  return (
    <header className="w-full flex items-center justify-between px-4 py-3 border-b bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <button
          className="md:hidden text-gray-600 dark:text-gray-300"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
        <div className="font-semibold">Dipa Cable Network</div>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300">{name}</div>
    </header>
  );
}


