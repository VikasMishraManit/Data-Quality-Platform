import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Database, Zap, BarChart3, FileText } from "lucide-react";
import { fetchLineage, mockApi } from "@/utils/api";

const LineageExplorer = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const lineage = await mockApi(() => fetchLineage());
        setData(lineage);
      } catch (error) {
        console.error("Error loading lineage data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="space-y-6"><div className="h-8 bg-muted rounded w-1/3 animate-pulse"></div></div>;
  }

  const { nodes, metadata } = data;

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'source_system': return <Database className="h-5 w-5 text-primary" />;
      case 'transformation': return <Zap className="h-5 w-5 text-secondary" />;
      case 'database': return <Database className="h-5 w-5 text-accent" />;
      case 'table': return <FileText className="h-5 w-5 text-muted-foreground" />;
      case 'dashboard': return <BarChart3 className="h-5 w-5 text-success" />;
      default: return <GitBranch className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Data Lineage Explorer</h1>
          <p className="text-muted-foreground">Visualize data flow and dependencies</p>
        </div>
        <Button>
          <GitBranch className="h-4 w-4 mr-2" />
          Generate Lineage
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metadata?.totalNodes || 0}</div>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Source Systems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metadata?.sourceSystems || 0}</div>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Transformations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metadata?.transformations || 0}</div>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Visualizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metadata?.visualizations || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="data-card">
        <CardHeader>
          <CardTitle>Data Flow Overview</CardTitle>
          <CardDescription>Interactive lineage visualization would appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/20 rounded-lg p-8 text-center">
            <GitBranch className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Interactive Lineage Graph</h3>
            <p className="text-muted-foreground">
              In a production environment, this would show an interactive D3.js or similar visualization
              of your data lineage with nodes and edges representing data flow.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="data-card">
          <CardHeader>
            <CardTitle>Data Assets</CardTitle>
            <CardDescription>Key components in your data pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nodes?.slice(0, 6).map((node: any) => (
                <div key={node.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getNodeIcon(node.type)}
                    <div>
                      <div className="font-medium">{node.name}</div>
                      <div className="text-sm text-muted-foreground">{node.description}</div>
                    </div>
                  </div>
                  <Badge variant="outline">{node.category}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="data-card">
          <CardHeader>
            <CardTitle>Pipeline Health</CardTitle>
            <CardDescription>Status of data processing pipelines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Source to Warehouse</span>
                <Badge variant="default">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Data Transformations</span>
                <Badge variant="default">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Analytics Processing</span>
                <Badge variant="secondary">Warning</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Reporting Layer</span>
                <Badge variant="default">Healthy</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LineageExplorer;