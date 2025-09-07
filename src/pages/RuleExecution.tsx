import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Calendar, Eye, Play, AlertCircle, CheckCircle, Clock, Filter, Search } from "lucide-react";
import { fetchRuleExecutions, mockApi } from "@/utils/api";
import { formatDuration, formatDateTime, formatNumber, getQualityColor, getStatusColor } from "@/utils/formatters";

const RuleExecution = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const executions = await mockApi(() => fetchRuleExecutions());
        setData(executions);
      } catch (error) {
        console.error("Error loading execution data:", error);
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
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { executions, summary } = data;

  const filteredExecutions = executions?.filter((execution: any) => {
    const matchesSearch = execution.ruleName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || execution.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const ExecutionDetailsDialog = ({ execution }: { execution: any }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Execution Details - {execution.ruleName}</DialogTitle>
          <DialogDescription>
            Execution ID: {execution.id} • {formatDateTime(execution.executionTime)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Execution Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-center">
                  <span className={getQualityColor(execution.score)}>
                    {execution.score.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-center">Quality Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-center">{formatNumber(execution.recordsProcessed)}</div>
                <p className="text-xs text-muted-foreground text-center">Records Processed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-center text-success">{formatNumber(execution.recordsPassed)}</div>
                <p className="text-xs text-muted-foreground text-center">Records Passed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-center text-destructive">{formatNumber(execution.recordsFailed)}</div>
                <p className="text-xs text-muted-foreground text-center">Records Failed</p>
              </CardContent>
            </Card>
          </div>

          {/* Execution Logs */}
          <div>
            <h3 className="text-lg font-medium mb-4">Execution Logs</h3>
            <div className="space-y-2">
              {execution.logs?.map((log: any, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    log.level === 'ERROR' ? 'bg-destructive' :
                    log.level === 'WARN' ? 'bg-warning' :
                    'bg-success'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-muted-foreground">{formatDateTime(log.timestamp)}</span>
                      <Badge variant={
                        log.level === 'ERROR' ? 'destructive' :
                        log.level === 'WARN' ? 'secondary' :
                        'default'
                      } className="text-xs">
                        {log.level}
                      </Badge>
                    </div>
                    <p className="text-sm mt-1">{log.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resource Usage */}
          <div>
            <h3 className="text-lg font-medium mb-4">Resource Usage</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CPU Usage</span>
                  <span>{execution.metrics?.cpuUsage}</span>
                </div>
                <Progress value={parseInt(execution.metrics?.cpuUsage) || 0} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Memory Usage</span>
                  <span>{execution.metrics?.memoryUsage}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Network I/O</span>
                  <span>{execution.metrics?.networkIO}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rule Executions</h1>
          <p className="text-muted-foreground">Monitor and analyze rule execution history</p>
        </div>
        <Button>
          <Play className="h-4 w-4 mr-2" />
          Trigger Execution
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalExecutions || 0}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {((summary?.successful / summary?.totalExecutions) * 100 || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">{summary?.successful || 0} successful</p>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.avgDuration || "0m 0s"}</div>
            <p className="text-xs text-muted-foreground">Per execution</p>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Records Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary?.totalRecordsProcessed || 0)}</div>
            <p className="text-xs text-muted-foreground">Total records</p>
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
                  placeholder="Search executions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executions Table */}
      <Card className="data-card">
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
          <CardDescription>Recent rule execution results and details</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Name</TableHead>
                <TableHead>Execution Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExecutions.map((execution: any) => (
                <TableRow key={execution.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{execution.ruleName}</div>
                      <div className="text-xs text-muted-foreground">{execution.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDateTime(execution.executionTime)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{execution.duration}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {execution.status === 'completed' && execution.result === 'passed' ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : execution.status === 'completed' && execution.result === 'failed' ? (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      ) : (
                        <Clock className="h-4 w-4 text-warning" />
                      )}
                      <Badge variant={
                        execution.status === 'completed' && execution.result === 'passed' ? 'default' :
                        execution.status === 'completed' && execution.result === 'failed' ? 'destructive' :
                        'secondary'
                      }>
                        {execution.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${getQualityColor(execution.score)}`}>
                        {execution.score.toFixed(1)}%
                      </span>
                      <div className="w-16">
                        <Progress value={execution.score} className="h-2" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="text-success">{formatNumber(execution.recordsPassed)} passed</div>
                      <div className="text-destructive">{formatNumber(execution.recordsFailed)} failed</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ExecutionDetailsDialog execution={execution} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RuleExecution;