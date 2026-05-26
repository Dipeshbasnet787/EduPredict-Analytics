"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Cpu, CheckCircle } from "lucide-react";
import api from "@/lib/api";

export default function ModelsDashboard() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/analytics/metrics").then((res) => {
      setMetrics(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const chartData = metrics.map(m => ({
    name: m.name,
    Accuracy: Number((m.accuracy * 100).toFixed(1)),
    F1: Number((m.f1 * 100).toFixed(1)),
    "ROC-AUC": Number((m.roc_auc * 100).toFixed(1))
  }));

  const bestModel = metrics.length > 0 ? metrics.reduce((prev, current) => (prev.f1 > current.f1) ? prev : current) : null;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Model Evaluation</h2>
        <p className="text-slate-500 mt-1 text-sm">Compare offline trained models and evaluation metrics.</p>
      </div>

      {!loading && bestModel && (
        <Card className="bg-indigo-600 text-white border-none shadow-md">
          <CardContent className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg mr-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-indigo-100">Active Production Model</h3>
                <p className="text-2xl font-bold">{bestModel.name}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-indigo-100 mb-1">F1 Score Performance</div>
              <Badge className="bg-white text-indigo-700 hover:bg-white/90 px-3 py-1 text-lg rounded-md">
                {(bestModel.f1 * 100).toFixed(2)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm shadow-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Cpu className="w-5 h-5 mr-2 text-slate-400" /> Metric Comparison Chart
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {metrics.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="Accuracy" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="F1" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ROC-AUC" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">Loading data...</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm shadow-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Detailed Metrics Table</CardTitle>
            <CardDescription>Comprehensive breakdown of validation set performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model Name</TableHead>
                  <TableHead className="text-right">Accuracy</TableHead>
                  <TableHead className="text-right">Precision</TableHead>
                  <TableHead className="text-right">Recall</TableHead>
                  <TableHead className="text-right font-semibold">F1 Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map((m, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium text-slate-700">{m.name}</TableCell>
                    <TableCell className="text-right">{(m.accuracy * 100).toFixed(2)}%</TableCell>
                    <TableCell className="text-right">{(m.precision * 100).toFixed(2)}%</TableCell>
                    <TableCell className="text-right">{(m.recall * 100).toFixed(2)}%</TableCell>
                    <TableCell className={`text-right font-bold ${m.name === bestModel?.name ? 'text-indigo-600' : 'text-slate-600'}`}>
                      {(m.f1 * 100).toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
