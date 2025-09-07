import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { DollarSign, TrendingUp, Lightbulb, Target } from "lucide-react";
import { fetchCosts, mockApi } from "@/utils/api";
import { formatCurrency, formatPercentage } from "@/utils/formatters";

const CostObservability = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const costs = await mockApi(() => fetchCosts());
        setData(costs);
      } catch (error) {
        console.error("Error loading costs data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="space-y-6"><div className="h-8 bg-muted rounded w-1/3 animate-pulse"></div></div>;
  }

  const { overview, breakdown, optimizationRecommendations } = data;

  const costBreakdown = [
    { name: 'Compute', value: breakdown?.compute?.cost || 0, color: 'hsl(var(--chart-1))' },
    { name: 'Storage', value: breakdown?.storage?.cost || 0, color: 'hsl(var(--chart-2))' },
    { name: 'Networking', value: breakdown?.networking?.cost || 0, color: 'hsl(var(--chart-3))' },
    { name: 'Tools', value: breakdown?.tools?.cost || 0, color: 'hsl(var(--chart-4))' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cost Observability</h1>
          <p className="text-muted-foreground">Monitor and optimize your data infrastructure costs</p>
        </div>
        <Button>
          <Target className="h-4 w-4 mr-2" />
          Optimize Costs
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overview?.totalMonthlyCost || 0)}</div>
            <div className="flex items-center space-x-1 text-xs">
              <TrendingUp className="h-3 w-3 text-destructive" />
              <span className="text-destructive">+{overview?.changePercentage || 0}%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(overview?.budgetUtilization || 0)}</div>
            <p className="text-xs text-muted-foreground">of {formatCurrency(overview?.budgetLimit || 0)}</p>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cost per GB</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overview?.costPerGB || 0)}</div>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cost per Query</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overview?.costPerQuery || 0)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="data-card">
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
            <CardDescription>Distribution of infrastructure costs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="data-card">
          <CardHeader>
            <CardTitle>Optimization Opportunities</CardTitle>
            <CardDescription>AI-powered cost reduction recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {optimizationRecommendations?.slice(0, 4).map((rec: any) => (
                <div key={rec.id} className="flex items-start space-x-3 p-3 border border-border rounded-lg">
                  <Lightbulb className="h-5 w-5 text-warning mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <Badge variant="outline" className="text-success">
                        Save {formatCurrency(rec.estimatedSavings)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {rec.priority} priority
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {rec.effort} effort
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CostObservability;