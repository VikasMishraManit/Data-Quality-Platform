import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Edit, Trash2, Plus, Search, Filter, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { fetchRules, mockApi } from "@/utils/api";
import { formatRelativeTime, getQualityColor, getStatusColor } from "@/utils/formatters";

const RuleManagement = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDatabase, setSelectedDatabase] = useState("all");

  useEffect(() => {
    const loadData = async () => {
      try {
        const rules = await mockApi(() => fetchRules());
        setData(rules);
      } catch (error) {
        console.error("Error loading rules data:", error);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { rules, databases, ruleTypes } = data;

  // Filter rules based on search and filters
  const filteredRules = rules?.filter((rule: any) => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.database.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || rule.status === statusFilter;
    const matchesDatabase = selectedDatabase === "all" || rule.database === selectedDatabase;
    
    return matchesSearch && matchesStatus && matchesDatabase;
  }) || [];

  const RuleCard = ({ rule }: { rule: any }) => (
    <Card className="interactive-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{rule.name}</CardTitle>
            <CardDescription className="text-sm">{rule.description}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={rule.status === 'active' ? 'default' : 'secondary'} className="text-xs">
              {rule.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quality Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Quality Score</span>
            <div className="flex items-center space-x-1">
              <span className={`font-medium ${getQualityColor(rule.currentScore)}`}>
                {rule.currentScore.toFixed(1)}%
              </span>
              {rule.trend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-success" />
              ) : rule.trend === 'down' ? (
                <TrendingDown className="h-3 w-3 text-destructive" />
              ) : (
                <Minus className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          </div>
          <Progress value={rule.currentScore} className="h-2" />
          <div className="text-xs text-muted-foreground">
            Threshold: {rule.threshold}%
          </div>
        </div>

        {/* Rule Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Database:</span>
            <span className="font-medium">{rule.database}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Table:</span>
            <span className="font-medium">{rule.schema}.{rule.table}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rule Type:</span>
            <Badge variant="outline" className="text-xs">
              {rule.ruleType.replace('_', ' ')}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Schedule:</span>
            <span className="font-medium capitalize">{rule.schedule}</span>
          </div>
        </div>

        {/* Execution Stats */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Executions: {rule.executionCount}</span>
          <span>Failures: {rule.failureCount}</span>
          <span>Last run: {formatRelativeTime(rule.lastRun)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex space-x-1">
            {rule.status === 'active' ? (
              <Button size="sm" variant="outline" className="h-8 px-2">
                <Pause className="h-3 w-3 mr-1" />
                Pause
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="h-8 px-2">
                <Play className="h-3 w-3 mr-1" />
                Resume
              </Button>
            )}
            <Button size="sm" variant="outline" className="h-8 px-2">
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
          <Button size="sm" variant="ghost" className="h-8 px-2 text-destructive hover:text-destructive">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const CreateRuleDialog = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Data Quality Rule</DialogTitle>
          <DialogDescription>
            Follow the steps to create a comprehensive data quality rule.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Step 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ruleName">Rule Name</Label>
                <Input id="ruleName" placeholder="Enter rule name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ruleType">Rule Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rule type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ruleTypes?.map((type: string) => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe what this rule validates"
                className="resize-none"
              />
            </div>
          </div>

          {/* Step 2: Data Source Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Data Source Selection</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="database">Database</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select database" />
                  </SelectTrigger>
                  <SelectContent>
                    {databases?.map((db: any) => (
                      <SelectItem key={db.name} value={db.name}>
                        {db.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="schema">Schema</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select schema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer_data">customer_data</SelectItem>
                    <SelectItem value="transactions">transactions</SelectItem>
                    <SelectItem value="products">products</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="table">Table</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select table" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customers">customers</SelectItem>
                    <SelectItem value="orders">orders</SelectItem>
                    <SelectItem value="inventory">inventory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Step 3: Rule Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Rule Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="threshold">Quality Threshold (%)</Label>
                <Input id="threshold" type="number" placeholder="95" min="0" max="100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="continuous">Continuous</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-border">
            <Button variant="outline">Cancel</Button>
            <Button>Create Rule</Button>
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
          <h1 className="text-3xl font-bold text-foreground">Rule Management</h1>
          <p className="text-muted-foreground">Create and manage data quality rules</p>
        </div>
        <CreateRuleDialog />
      </div>

      {/* Filters */}
      <Card className="data-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rules..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Databases</SelectItem>
                  {databases?.map((db: any) => (
                    <SelectItem key={db.name} value={db.name}>
                      {db.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRules.map((rule: any) => (
          <RuleCard key={rule.id} rule={rule} />
        ))}
      </div>

      {filteredRules.length === 0 && (
        <Card className="data-card">
          <CardContent className="text-center py-12">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No rules found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or create a new rule.
            </p>
            <CreateRuleDialog />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RuleManagement;