"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import { Activity, BookOpen, Clock, FileText } from "lucide-react";

export default function AnalyticsDashboard() {
  const performanceTrends = [
    { name: "Week 1", G1: 10, G2: 11, G3: 11 },
    { name: "Week 4", G1: 11, G2: 11, G3: 12 },
    { name: "Week 8", G1: 12, G2: 13, G3: 13 },
    { name: "Week 12", G1: 13, G2: 14, G3: 14 },
    { name: "Finals", G1: 14, G2: 15, G3: 15 },
  ];

  const radarData = [
    { subject: 'Study Time', A: 120, B: 110, fullMark: 150 },
    { subject: 'Failures', A: 98, B: 130, fullMark: 150 },
    { subject: 'Absences', A: 86, B: 130, fullMark: 150 },
    { subject: 'Health', A: 99, B: 100, fullMark: 150 },
    { subject: 'Family Support', A: 85, B: 90, fullMark: 150 },
    { subject: 'Extra Activities', A: 65, B: 85, fullMark: 150 },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Deep Analytics</h2>
        <p className="text-slate-500 mt-1 text-sm">Multidimensional analysis of student behavior and performance metrics.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm shadow-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Avg Study Time</CardTitle>
            <Clock className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">2.4 hrs/day</div>
            <p className="text-xs text-emerald-500 mt-1">+12% from last term</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm shadow-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Extracurriculars</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">48%</div>
            <p className="text-xs text-slate-500 mt-1">Students enrolled</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm shadow-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Internet Access</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">83%</div>
            <p className="text-xs text-emerald-500 mt-1">Home connectivity</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm shadow-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Past Failures</CardTitle>
            <FileText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">12%</div>
            <p className="text-xs text-red-500 mt-1">Class average impact</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm shadow-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Performance Trajectory</CardTitle>
            <CardDescription>Average progression across grading periods.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorG3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorG1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Area type="monotone" dataKey="G3" stroke="#4f46e5" fillOpacity={1} fill="url(#colorG3)" name="Final Grade (G3)" />
                <Area type="monotone" dataKey="G1" stroke="#10b981" fillOpacity={1} fill="url(#colorG1)" name="First Period (G1)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm shadow-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Risk Factor Analysis</CardTitle>
            <CardDescription>Comparing behavior of High-Risk vs Low-Risk cohorts.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{fill: '#64748b', fontSize: 12}} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="Low Risk" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                <Radar name="High Risk" dataKey="B" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
                <Legend />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
