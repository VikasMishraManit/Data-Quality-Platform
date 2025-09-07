import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Activity, AlertTriangle, CheckCircle, Database, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { fetchProfiling, fetchIncidents, fetchRules, mockApi } from "@/utils/api";
import { formatPercentage, formatNumber, formatRelativeTime, getQualityColor } from "@/utils/formatters";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profiling, incidents, rules] = await Promise.all([
          mockApi(() => fetchProfiling()),
          mockApi(() => fetchIncidents()),
          mockApi(() => fetchRules()),
        ]);
        
        setData({ profiling, incidents, rules });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { profiling, incidents, rules } = data;

  // Calculate dashboard metrics
  const overallScore = profiling?.overallScore || 0;
  const totalIncidents = incidents?.stats?.total || 0;
  const openIncidents = incidents?.stats?.open || 0;
  const activeRules = rules?.rules?.filter((r: any) => r.status === "active").length || 0;

  const qualityTrends = profiling?.trends?.map((trend: any) => ({
    date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    overall: (trend.completeness + trend.uniqueness + trend.validity + trend.freshness) / 4,
    completeness: trend.completeness,
    uniqueness: trend.uniqueness,
    validity: trend.validity,
    freshness: trend.freshness,
  })) || [];

  const severityData = [
    { name: 'Critical', value: incidents?.stats?.bySeverity?.critical || 0, color: 'hsl(var(--destructive))' },
    { name: 'High', value: incidents?.stats?.bySeverity?.high || 0, color: 'hsl(var(--warning))' },
    { name: 'Medium', value: incidents?.stats?.bySeverity?.medium || 0, color: 'hsl(var(--accent))' },
    { name: 'Low', value: incidents?.stats?.bySeverity?.low || 0, color: 'hsl(var(--muted-foreground))' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Data Quality Dashboard</h1>
          <p className="text-muted-foreground">Monitor your data quality metrics and incidents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Zap className="h-4 w-4 mr-2" />
            Run Quality Check
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Quality Score</CardTitle>
            <Database className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getQualityColor(overallScore)}>{overallScore.toFixed(1)}%</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-success" />
              <span>+2.1% from last week</span>
            </div>
            <Progress value={overallScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(activeRules)}</div>
            <p className="text-xs text-muted-foreground">
              {rules?.rules?.length || 0} total rules configured
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{formatNumber(openIncidents)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(totalIncidents)} total incidents
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Volume</CardTitle>
            <Database className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(profiling?.totalRecords || 0)}</div>
            <p className="text-xs text-muted-foreground">
              records across {profiling?.totalTables || 0} tables
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality Trends */}
        <Card className="data-card">
          <CardHeader>
            <CardTitle>Quality Trends</CardTitle>
            <CardDescription>Data quality metrics over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={qualityTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Line type="monotone" dataKey="overall" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="completeness" stroke="hsl(var(--chart-2))" strokeWidth={1} />
                <Line type="monotone" dataKey="uniqueness" stroke="hsl(var(--chart-3))" strokeWidth={1} />
                <Line type="monotone" dataKey="validity" stroke="hsl(var(--chart-4))" strokeWidth={1} />
                <Line type="monotone" dataKey="freshness" stroke="hsl(var(--chart-5))" strokeWidth={1} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Incidents by Severity */}
        <Card className="data-card">
          <CardHeader>
            <CardTitle>Incidents by Severity</CardTitle>
            <CardDescription>Current incident distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="data-card">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest incidents and rule executions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="incidents" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="incidents">Recent Incidents</TabsTrigger>
              <TabsTrigger value="rules">Rule Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="incidents" className="space-y-4">
              {incidents?.incidents?.slice(0, 5).map((incident: any) => (
                <div key={incident.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className={`h-4 w-4 ${
                      incident.severity === 'critical' ? 'text-destructive' :
                      incident.severity === 'high' ? 'text-warning' :
                      incident.severity === 'medium' ? 'text-accent' : 'text-muted-foreground'
                    }`} />
                    <div>
                      <p className="font-medium text-sm">{incident.title}</p>
                      <p className="text-xs text-muted-foreground">{incident.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={incident.status === 'resolved' ? 'default' : 'destructive'}>
                      {incident.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(incident.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="rules" className="space-y-4">
              {rules?.rules?.slice(0, 5).map((rule: any) => (
                <div key={rule.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${rule.status === 'active' ? 'text-success' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="font-medium text-sm">{rule.name}</p>
                      <p className="text-xs text-muted-foreground">{rule.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${getQualityColor(rule.currentScore)}`}>
                      {rule.currentScore.toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(rule.lastRun)}
                    </span>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;