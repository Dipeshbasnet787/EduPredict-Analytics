"use client";

import { Bell, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <header className="h-16 flex items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center w-1/3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            type="search" 
            placeholder="Search students, models, or reports..." 
            className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-full"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-500 hover:text-indigo-600 transition-colors rounded-full hover:bg-slate-50">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 cursor-pointer">
          <User className="h-4 w-4 text-indigo-700" />
        </div>
      </div>
    </header>
  );
}
