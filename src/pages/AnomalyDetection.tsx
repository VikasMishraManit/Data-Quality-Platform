import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Zap, TrendingUp, AlertTriangle, Brain, Target } from "lucide-react";
import { fetchAnomalies, mockApi } from "@/utils/api";
import { formatRelativeTime, getSeverityColor } from "@/utils/formatters";

const AnomalyDetection = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const anomalies = await mockApi(() => fetchAnomalies());
        setData(anomalies);
      } catch (error) {
        console.error("Error loading anomalies data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="space-y-6"><div className="h-8 bg-muted rounded w-1/3 animate-pulse"></div></div>;
  }

  const { anomalies, insights } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Anomaly Detection</h1>
          <p className="text-muted-foreground">AI-powered detection of data quality anomalies</p>
        </div>
        <Button>
          <Brain className="h-4 w-4 mr-2" />
          Run Detection
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Anomalies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights?.totalAnomalies || 0}</div>
            <p className="text-xs text-success">{insights?.newToday || 0} new today</p>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{insights?.impactAssessment?.high || 0}</div>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((insights?.avgConfidence || 0) * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{insights?.resolved || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="data-card">
        <CardHeader>
          <CardTitle>Recent Anomalies</CardTitle>
          <CardDescription>AI-detected data quality anomalies requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {anomalies?.map((anomaly: any) => (
              <div key={anomaly.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className={`h-5 w-5 ${getSeverityColor(anomaly.severity)}`} />
                    <div>
                      <h4 className="font-medium">{anomaly.title}</h4>
                      <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={anomaly.severity === 'critical' ? 'destructive' : 'secondary'}>
                      {anomaly.severity}
                    </Badge>
                    <Badge variant="outline">
                      {(anomaly.confidence * 100).toFixed(0)}% confidence
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-muted-foreground">Detected: </span>
                    <span>{formatRelativeTime(anomaly.detectedAt)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category: </span>
                    <span>{anomaly.category.replace('_', ' ')}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Possible Causes: </span>
                    <span>{anomaly.possibleCauses?.join(', ')}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Suggested Actions: </span>
                    <span>{anomaly.suggestedActions?.join(', ')}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Assigned to: {anomaly.assignee}
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">Investigate</Button>
                    <Button size="sm" variant="ghost">Dismiss</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnomalyDetection;