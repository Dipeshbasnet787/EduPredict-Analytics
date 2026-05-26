"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle, CheckCircle, GraduationCap } from "lucide-react";
import api from "@/lib/api";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

export default function OverviewDashboard() {
  const [stats, setStats] = useState<any>(null);
  
  useEffect(() => {
    // Fetch stats from backend
    api.get("/api/analytics/stats").then((res) => {
      setStats(res.data);
    }).catch((err) => console.error("Failed to load stats", err));
  }, []);

  const pieData = stats ? [
    { name: 'High Risk', value: stats.risk_distribution['High Risk'] || 0 },
    { name: 'Medium Risk', value: stats.risk_distribution['Medium Risk'] || 0 },
    { name: 'Low Risk', value: stats.risk_distribution['Low Risk'] || 0 },
  ] : [];

  const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

  const kpis = [
    {
      title: "Total Students",
      value: stats ? stats.total_students : "-",
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-100"
    },
    {
      title: "High Risk Students",
      value: stats ? stats.risk_distribution['High Risk'] || 0 : "-",
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-100"
    },
    {
      title: "Average Final Grade",
      value: stats ? stats.average_G3.toFixed(2) : "-",
      icon: GraduationCap,
      color: "text-blue-600",
      bg: "bg-blue-100"
    },
    {
      title: "Avg Absences",
      value: stats ? stats.attendance_avg.toFixed(1) : "-",
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-100"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Overview Dashboard</h2>
          <p className="text-slate-500 mt-1 text-sm">Welcome back. Here is the academic pulse for this term.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className="border-none shadow-sm shadow-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none shadow-sm shadow-slate-200">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm shadow-slate-200">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Attendance vs Risk (Demo)</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            {/* Real implementation would use actual historical breakdown, mock data used here for UI demonstration */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: '0-5 absences', highRisk: 10, lowRisk: 80 },
                  { name: '6-10 absences', highRisk: 30, lowRisk: 50 },
                  { name: '11-20 absences', highRisk: 60, lowRisk: 20 },
                  { name: '20+ absences', highRisk: 90, lowRisk: 5 },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar dataKey="highRisk" name="High Risk %" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
                <Bar dataKey="lowRisk" name="Low Risk %" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
