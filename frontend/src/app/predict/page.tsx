"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { UploadCloud, CheckCircle2, AlertCircle, Info, RefreshCw } from "lucide-react";
import api from "@/lib/api";

export default function PredictionDashboard() {
  const [formData, setFormData] = useState({
    absences: 0,
    failures: 0,
    studytime: 2,
    freetime: 3,
    goout: 3,
    health: 5,
    sex: "F"
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Send raw features - backend will fill missing columns with defaults
      const payload = {
        features: {
          ...formData,
        }
      };
      const res = await api.post("/api/predict/single", payload);
      setResult(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to predict.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    if (risk === "High Risk") return "bg-red-500 hover:bg-red-600";
    if (risk === "Medium Risk") return "bg-amber-500 hover:bg-amber-600";
    return "bg-emerald-500 hover:bg-emerald-600";
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Prediction Studio</h2>
        <p className="text-slate-500 mt-1 text-sm">Run real-time ML inferences on student profiles to predict at-risk behavior.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm shadow-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Manual Assessment</CardTitle>
            <CardDescription>Enter student metrics to generate a live risk prediction.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePredict} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Absences</Label>
                  <Input 
                    type="number" 
                    value={formData.absences} 
                    onChange={e => setFormData({...formData, absences: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Previous Failures</Label>
                  <Input 
                    type="number" 
                    value={formData.failures} 
                    onChange={e => setFormData({...formData, failures: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Study Time (1-4)</Label>
                  <Select 
                    value={formData.studytime.toString()} 
                    onValueChange={v => setFormData({...formData, studytime: parseInt(v)})}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">&lt;2 hours</SelectItem>
                      <SelectItem value="2">2 to 5 hours</SelectItem>
                      <SelectItem value="3">5 to 10 hours</SelectItem>
                      <SelectItem value="4">&gt;10 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sex</Label>
                  <Select 
                    value={formData.sex} 
                    onValueChange={v => setFormData({...formData, sex: v})}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="F">Female</SelectItem>
                      <SelectItem value="M">Male</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md font-medium transition-colors flex justify-center items-center"
              >
                {loading ? <RefreshCw className="animate-spin h-5 w-5 mr-2" /> : "Run Prediction Model"}
              </button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm shadow-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Prediction Results</CardTitle>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                  <Info className="h-12 w-12 mb-3 opacity-20" />
                  <p>Awaiting input data</p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Risk Assessment</p>
                      <div className="flex items-center mt-1">
                        <Badge className={`text-white text-sm px-3 py-1 mt-1 ${getRiskColor(result.prediction)}`}>
                          {result.prediction}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500 font-medium">Confidence Score</p>
                      <p className="text-2xl font-bold text-slate-900">{(result.probability * 100).toFixed(1)}%</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 text-indigo-500" /> Explainable AI Insights
                    </h4>
                    <div className="space-y-2">
                      {result.explanation?.length > 0 ? (
                        result.explanation.map((ex: string, i: number) => (
                          <Alert key={i} className="bg-white border-slate-200 py-2">
                            <AlertDescription className="text-slate-600 text-sm">
                              {ex}
                            </AlertDescription>
                          </Alert>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">Global feature importance data unavailable.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm shadow-slate-200 border-dashed border-2 border-slate-300 bg-slate-50">
            <CardContent className="py-8 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
                <UploadCloud className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Batch Prediction Upload</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-xs mb-4">Upload a CSV file containing multiple student records to run batch inferences.</p>
              <button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-md font-medium text-sm transition-colors">
                Select CSV File
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
