import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Database, FileText, AlertTriangle, TrendingUp, RefreshCw, Download, Filter } from "lucide-react";
import { fetchProfiling, mockApi } from "@/utils/api";
import { formatPercentage, formatNumber, formatRelativeTime, getQualityColor } from "@/utils/formatters";

const Profiling = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const profiling = await mockApi(() => fetchProfiling());
        setData(profiling);
      } catch (error) {
        console.error("Error loading profiling data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { overallScore, totalTables, totalColumns, totalRecords, metrics, databases, trends } = data;

  const metricData = [
    { name: 'Completeness', value: metrics?.completeness?.score || 0, color: 'hsl(var(--chart-1))' },
    { name: 'Uniqueness', value: metrics?.uniqueness?.score || 0, color: 'hsl(var(--chart-2))' },
    { name: 'Validity', value: metrics?.validity?.score || 0, color: 'hsl(var(--chart-3))' },
    { name: 'Freshness', value: metrics?.freshness?.score || 0, color: 'hsl(var(--chart-4))' },
  ];

  const trendData = trends?.map((trend: any) => ({
    date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    completeness: trend.completeness,
    uniqueness: trend.uniqueness,
    validity: trend.validity,
    freshness: trend.freshness,
  })) || [];

  const DatabaseCard = ({ database }: { database: any }) => (
    <Card 
      className={`interactive-card cursor-pointer ${selectedDatabase === database.name ? 'ring-2 ring-primary' : ''}`}
      onClick={() => setSelectedDatabase(selectedDatabase === database.name ? null : database.name)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{database.name}</CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            <span className={`text-2xl font-bold ${getQualityColor(database.score)}`}>
              {database.score.toFixed(1)}%
            </span>
            {database.trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <div className="h-4 w-4" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={database.score} className="h-2" />
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground">Records</div>
            <div className="font-medium">{formatNumber(database.recordCount)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Schemas</div>
            <div className="font-medium">{database.schemas?.length || 0}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SchemaDetails = ({ database }: { database: any }) => (
    <div className="space-y-4">
      {database.schemas?.map((schema: any) => (
        <Card key={schema.name} className="data-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{schema.name}</CardTitle>
              <div className="flex items-center space-x-2">
                <span className={`text-lg font-bold ${getQualityColor(schema.score)}`}>
                  {schema.score.toFixed(1)}%
                </span>
                <Badge variant="outline">{formatNumber(schema.recordCount)} records</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schema.tables?.map((table: any) => (
                <div key={table.name} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">{table.name}</h4>
                    </div>
                    <span className={`font-bold ${getQualityColor(table.score)}`}>
                      {table.score.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-chart-1">{table.completeness?.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Completeness</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-chart-2">{table.uniqueness?.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Uniqueness</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-chart-3">{table.validity?.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Validity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-chart-4">{table.freshness?.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Freshness</div>
                    </div>
                  </div>

                  {table.columns && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Column Issues</h5>
                      {table.columns.map((column: any) => (
                        <div key={column.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{column.name}</span>
                            <Badge variant="outline" className="text-xs">{column.type}</Badge>
                            {column.nullPercentage > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {column.nullPercentage}% null
                              </Badge>
                            )}
                          </div>
                          {column.issues && column.issues.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <AlertTriangle className="h-3 w-3 text-warning" />
                              <span className="text-xs text-muted-foreground">
                                {column.issues.length} issue{column.issues.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Data Profiling</h1>
          <p className="text-muted-foreground">Analyze data quality metrics across your databases</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getQualityColor(overallScore)}>{overallScore.toFixed(1)}%</span>
            </div>
            <Progress value={overallScore} className="mt-2" />
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tables Monitored</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalTables)}</div>
            <p className="text-xs text-muted-foreground">{formatNumber(totalColumns)} columns</p>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalRecords)}</div>
            <p className="text-xs text-muted-foreground">across all tables</p>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{formatRelativeTime(data.lastUpdated)}</div>
            <p className="text-xs text-muted-foreground">profiling data</p>
          </CardContent>
        </Card>
      </div>

      {/* Quality Metrics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="data-card">
          <CardHeader>
            <CardTitle>Quality Dimensions</CardTitle>
            <CardDescription>Current scores across quality dimensions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metricData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="data-card">
          <CardHeader>
            <CardTitle>Quality Trends</CardTitle>
            <CardDescription>Quality metrics over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
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
                <Line type="monotone" dataKey="completeness" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                <Line type="monotone" dataKey="uniqueness" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                <Line type="monotone" dataKey="validity" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                <Line type="monotone" dataKey="freshness" stroke="hsl(var(--chart-4))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Database Drill-down */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Database Overview</TabsTrigger>
          <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {databases?.map((database: any) => (
              <DatabaseCard key={database.name} database={database} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-4">
          {selectedDatabase ? (
            <SchemaDetails database={databases?.find((db: any) => db.name === selectedDatabase)} />
          ) : (
            <Card className="data-card">
              <CardContent className="text-center py-12">
                <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Database</h3>
                <p className="text-muted-foreground">
                  Click on a database card above to view detailed analysis
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profiling;