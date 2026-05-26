"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BrainCircuit, BarChart3, Settings, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const routes = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/",
    color: "text-indigo-500",
  },
  {
    label: "Prediction Studio",
    icon: BrainCircuit,
    href: "/predict",
    color: "text-emerald-500",
  },
  {
    label: "Deep Analytics",
    icon: BarChart3,
    href: "/analytics",
    color: "text-blue-500",
  },
  {
    label: "Model Settings",
    icon: Settings,
    href: "/models",
    color: "text-slate-500",
  },
  {
    label: "Reports Export",
    icon: Settings, // or use FileText, let's use Settings for now, actually let me import FileText
    href: "/reports",
    color: "text-rose-500",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white shadow-xl">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4 bg-indigo-600 rounded-lg flex items-center justify-center">
            <BookOpen className="text-white h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">EduPredict</h1>
        </Link>
        <div className="space-y-1.5">
          {routes.map((route) => (
            <Link
              href={route.href}
              key={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-slate-800 rounded-lg transition-all",
                pathname === route.href ? "bg-slate-800 text-white" : "text-slate-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-6 py-4">
        <div className="bg-slate-800 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-300 font-semibold mb-2">Platform Version</p>
          <p className="text-xs text-slate-500">v1.0.0 Enterprise</p>
        </div>
      </div>
    </div>
  );
}
