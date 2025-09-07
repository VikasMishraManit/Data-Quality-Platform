import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, Server, Table as TableIcon, Search, Filter, Eye, Settings, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { fetchAssets, mockApi } from "@/utils/api";
import { formatNumber, formatRelativeTime, getStatusColor, formatBytes } from "@/utils/formatters";

const AssetCatalog = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const loadData = async () => {
      try {
        const assets = await mockApi(() => fetchAssets());
        setData(assets);
      } catch (error) {
        console.error("Error loading assets data:", error);
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

  const { dataSources, summary } = data;

  const filteredDataSources = dataSources?.filter((source: any) => {
    const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         source.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || source.type.toLowerCase().includes(typeFilter.toLowerCase());
    const matchesStatus = statusFilter === "all" || source.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  }) || [];

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const DataSourceCard = ({ dataSource }: { dataSource: any }) => (
    <Card className="interactive-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{dataSource.name}</CardTitle>
              <CardDescription className="text-sm">{dataSource.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(dataSource.status)}
            <Badge variant={dataSource.status === 'connected' ? 'default' : 'secondary'}>
              {dataSource.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Health */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Connection Health</span>
            <span className="font-medium">{dataSource.connectionHealth?.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${dataSource.connectionHealth}%` }}
            />
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground">Type</div>
            <Badge variant="outline">{dataSource.type}</Badge>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Environment</div>
            <Badge variant={dataSource.environment === 'production' ? 'default' : 'secondary'}>
              {dataSource.environment}
            </Badge>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Schemas</div>
            <div className="font-medium">{dataSource.schemas?.length || 0}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Last Synced</div>
            <div className="font-medium">{formatRelativeTime(dataSource.lastSynced)}</div>
          </div>
        </div>

        {/* Owner & Tags */}
        <div className="space-y-2">
          <div className="text-sm">
            <span className="text-muted-foreground">Owner: </span>
            <span className="font-medium">{dataSource.owner}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {dataSource.tags?.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-2 border-t border-border">
          <Button size="sm" variant="outline">
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </Button>
          <Button size="sm" variant="ghost">
            <Settings className="h-3 w-3 mr-1" />
            Configure
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const TableDetailsView = ({ dataSource }: { dataSource: any }) => (
    <div className="space-y-4">
      {dataSource.schemas?.map((schema: any) => (
        <Card key={schema.name} className="data-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="h-5 w-5" />
                  <span>{schema.name}</span>
                </CardTitle>
                <CardDescription>{schema.description}</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Tables: {schema.tableCount}</div>
                <div className="text-sm text-muted-foreground">Records: {formatNumber(schema.recordCount)}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Columns</TableHead>
                  <TableHead>Data Volume</TableHead>
                  <TableHead>Quality Score</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schema.tables?.map((table: any) => (
                  <TableRow key={table.name}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <TableIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{table.name}</div>
                          <div className="text-xs text-muted-foreground">{table.owner}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={table.description}>
                        {table.description}
                      </div>
                    </TableCell>
                    <TableCell>{formatNumber(table.recordCount)}</TableCell>
                    <TableCell>{table.columnCount}</TableCell>
                    <TableCell>{table.dataVolume}</TableCell>
                    <TableCell>
                      {table.qualityScore ? (
                        <Badge variant={table.qualityScore > 90 ? 'default' : table.qualityScore > 70 ? 'secondary' : 'destructive'}>
                          {table.qualityScore.toFixed(1)}%
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>{formatRelativeTime(table.lastUpdated)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
          <h1 className="text-3xl font-bold text-foreground">Asset Catalog</h1>
          <p className="text-muted-foreground">Browse and manage your data assets</p>
        </div>
        <Button>
          <Database className="h-4 w-4 mr-2" />
          Add Data Source
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalDataSources || 0}</div>
            <p className="text-xs text-muted-foreground">{summary?.connectedSources || 0} connected</p>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary?.totalTables || 0)}</div>
            <p className="text-xs text-muted-foreground">across all sources</p>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary?.totalRecords || 0)}</div>
            <p className="text-xs text-muted-foreground">{summary?.totalDataVolume} data volume</p>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{summary?.avgConnectionHealth?.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">connection health</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="data-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search data sources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="mongodb">MongoDB</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="connected">Connected</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Data Sources</TabsTrigger>
          <TabsTrigger value="tables">Table Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDataSources.map((dataSource: any) => (
              <DataSourceCard key={dataSource.id} dataSource={dataSource} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="tables" className="space-y-4">
          {filteredDataSources.map((dataSource: any) => (
            <TableDetailsView key={dataSource.id} dataSource={dataSource} />
          ))}
        </TabsContent>
      </Tabs>

      {filteredDataSources.length === 0 && (
        <Card className="data-card">
          <CardContent className="text-center py-12">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No data sources found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or add a new data source.
            </p>
            <Button>
              <Database className="h-4 w-4 mr-2" />
              Add Data Source
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssetCatalog;