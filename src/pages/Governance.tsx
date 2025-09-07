import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, FileText, Settings, Tag, UserCheck } from "lucide-react";

const Governance = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="space-y-6"><div className="h-8 bg-muted rounded w-1/3 animate-pulse"></div></div>;
  }

  const mockPolicies = [
    { id: 1, name: "PII Data Access Policy", type: "Access Control", status: "active", compliance: 98 },
    { id: 2, name: "Data Retention Policy", type: "Retention", status: "active", compliance: 95 },
    { id: 3, name: "GDPR Compliance", type: "Privacy", status: "active", compliance: 100 },
    { id: 4, name: "Financial Data Security", type: "Security", status: "draft", compliance: 0 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Data Governance</h1>
          <p className="text-muted-foreground">Manage data policies, compliance, and access controls</p>
        </div>
        <Button>
          <Shield className="h-4 w-4 mr-2" />
          Create Policy
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">3 pending approval</p>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">96.5%</div>
            <p className="text-xs text-muted-foreground">across all policies</p>
          </CardContent>
        </Card>
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="data-card">
          <CardHeader>
            <CardTitle>Data Policies</CardTitle>
            <CardDescription>Active governance policies and their compliance status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPolicies.map((policy) => (
                <div key={policy.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{policy.name}</div>
                      <div className="text-sm text-muted-foreground">{policy.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={policy.status === 'active' ? 'default' : 'secondary'}>
                      {policy.status}
                    </Badge>
                    {policy.compliance > 0 && (
                      <span className="text-sm font-medium text-success">
                        {policy.compliance}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="data-card">
          <CardHeader>
            <CardTitle>Data Classifications</CardTitle>
            <CardDescription>Tagged data assets by sensitivity level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-destructive" />
                  <span>Highly Confidential</span>
                </div>
                <Badge variant="destructive">45 assets</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-warning" />
                  <span>Confidential</span>
                </div>
                <Badge variant="secondary">128 assets</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-accent" />
                  <span>Internal</span>
                </div>
                <Badge variant="outline">89 assets</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-success" />
                  <span>Public</span>
                </div>
                <Badge variant="outline">12 assets</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Governance;