"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, FileText, Image as ImageIcon, FileSpreadsheet } from "lucide-react";

export default function ReportsDashboard() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Reports & Exports</h2>
        <p className="text-slate-500 mt-1 text-sm">Generate dissertation-quality reports, graphs, and structured datasets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm shadow-slate-200 hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-indigo-500">
          <CardHeader>
            <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <CardTitle className="text-lg">Full Analytics PDF</CardTitle>
            <CardDescription>Comprehensive term report including all KPIs, risk distributions, and model performance metrics.</CardDescription>
          </CardHeader>
          <CardContent>
            <button className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700">
              <Download className="h-4 w-4 mr-2" /> Download Report
            </button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm shadow-slate-200 hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-emerald-500">
          <CardHeader>
            <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            </div>
            <CardTitle className="text-lg">Batch Predictions CSV</CardTitle>
            <CardDescription>Raw tabular data containing all student profiles with their generated risk categories and confidence scores.</CardDescription>
          </CardHeader>
          <CardContent>
            <button className="flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700">
              <Download className="h-4 w-4 mr-2" /> Export Dataset
            </button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm shadow-slate-200 hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-blue-500">
          <CardHeader>
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <ImageIcon className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Visualization Assets</CardTitle>
            <CardDescription>High-resolution PNG and SVG exports of all charts (Confusion matrix, ROC curve, Feature Importance) for publication.</CardDescription>
          </CardHeader>
          <CardContent>
            <button className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
              <Download className="h-4 w-4 mr-2" /> Download Graphics
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
