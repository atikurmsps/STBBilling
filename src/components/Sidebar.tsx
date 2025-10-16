"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, Cable, ReceiptText, LogOut, Shield } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useSidebar } from "./SidebarProvider";

const MENU_BG = "#203462";

const NavItem = ({ href, label, icon: Icon }: { href: string; label: string; icon: any }) => {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + "/");
  const { setSidebarOpen } = useSidebar();

  const handleClick = () => {
    if (window.innerWidth < 768) { // md breakpoint is 768px
      setSidebarOpen(false);
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-gray-100 hover:bg-[#2a4580] ${
        active ? "bg-[#2a4580]" : ""
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
};

export default function Sidebar() {
  const { isOpen, setSidebarOpen } = useSidebar();
  const { data } = useSession();
  const role = (data?.user as any)?.role;

  const handleSignOut = () => {
    setSidebarOpen(false);
    signOut();
  };

  return (
    <>
      {/* Drawer */}
      <aside
        className={`fixed md:static z-40 top-0 left-0 h-screen w-64 p-4 transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        style={{ backgroundColor: MENU_BG }}
      >
        <div className="text-white text-lg font-semibold mb-4">STB Billing System</div>
        <nav className="flex flex-col gap-1">
          <NavItem href="/" label="Dashboard" icon={LayoutGrid} />
          <NavItem href="/customers" label="Customers" icon={Users} />
          <NavItem href="/stbs" label="STB List" icon={Cable} />
          <NavItem href="/transactions" label="Transactions" icon={ReceiptText} />
          {role === "ADMIN" && <NavItem href="/users" label="Users" icon={Shield} />}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-100 hover:bg-[#2a4580] text-left w-full"
          >
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 md:hidden z-30" onClick={() => setSidebarOpen(false)} />
      )}
    </>
  );
}


