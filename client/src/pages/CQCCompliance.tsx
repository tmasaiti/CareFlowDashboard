import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  AlertTriangle, 
  FileCheck, 
  Activity, 
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Users,
  AlertCircle
} from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { format } from "date-fns";

export default function CQCCompliance() {
  const riskAssessments = useLiveQuery(() => db.riskAssessments.toArray());
  const incidents = useLiveQuery(() => db.safeguardingIncidents.toArray());
  const evidence = useLiveQuery(() => db.complianceEvidence.toArray());
  const auditLogs = useLiveQuery(() => db.auditLogs.orderBy('timestamp').reverse().limit(50).toArray());
  const policies = useLiveQuery(() => db.policies.toArray());
  const trainingRecords = useLiveQuery(() => db.trainingRecords.toArray());
  const policyAcknowledgments = useLiveQuery(() => db.policyAcknowledgments.toArray());

  const criticalRisks = riskAssessments?.filter(r => r.riskLevel === 'Critical' || r.riskLevel === 'High') || [];
  const overdueRisks = riskAssessments?.filter(r => {
    const reviewDate = new Date(r.nextReviewDate);
    return reviewDate < new Date() && r.status !== 'Closed';
  }) || [];
  
  const openIncidents = incidents?.filter(i => i.status !== 'Resolved') || [];
  const criticalIncidents = incidents?.filter(i => i.severity === 'Critical' || i.severity === 'Serious') || [];
  
  const expiringEvidence = evidence?.filter(e => e.status === 'Expiring Soon' || e.status === 'Expired') || [];
  const expiredTraining = trainingRecords?.filter(t => t.status === 'Expired') || [];
  const pendingAcknowledgments = policyAcknowledgments?.filter(pa => pa.status === 'Pending') || [];

  const complianceMetrics = {
    safe: {
      total: (riskAssessments?.length || 0) + (incidents?.length || 0),
      compliant: (riskAssessments?.filter(r => r.status === 'Mitigated' || r.status === 'Closed').length || 0) + 
                 (incidents?.filter(i => i.status === 'Resolved').length || 0),
    },
    effective: {
      total: evidence?.filter(e => e.complianceArea === 'Effective').length || 0,
      compliant: evidence?.filter(e => e.complianceArea === 'Effective' && e.status === 'Current').length || 0,
    },
    caring: {
      total: evidence?.filter(e => e.complianceArea === 'Caring').length || 0,
      compliant: evidence?.filter(e => e.complianceArea === 'Caring' && e.status === 'Current').length || 0,
    },
    responsive: {
      total: evidence?.filter(e => e.complianceArea === 'Responsive').length || 0,
      compliant: evidence?.filter(e => e.complianceArea === 'Responsive' && e.status === 'Current').length || 0,
    },
    wellLed: {
      total: (policies?.length || 0) + (trainingRecords?.length || 0),
      compliant: (policies?.filter(p => p.status === 'Active').length || 0) + 
                 (trainingRecords?.filter(t => t.status === 'Current').length || 0),
    },
  };

  const getCompliancePercentage = (compliant: number, total: number) => {
    if (total === 0) return 100;
    return Math.round((compliant / total) * 100);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'destructive';
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Current': case 'Active': case 'Resolved': case 'Closed': case 'Mitigated':
        return 'default';
      case 'Expiring Soon': case 'Under Review': case 'Under Investigation':
        return 'default';
      case 'Expired': case 'Critical': case 'Escalated to CQC':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-cqc-compliance-title">CQC Compliance Dashboard</h1>
          <p className="text-muted-foreground">Monitor compliance with CQC standards and regulations</p>
        </div>
        <Button data-testid="button-generate-report">
          <FileText className="h-4 w-4 mr-2" />
          Generate Compliance Report
        </Button>
      </div>

      {(criticalRisks.length > 0 || openIncidents.length > 0 || overdueRisks.length > 0) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <span className="font-semibold">Action Required:</span>
            {' '}
            {criticalRisks.length > 0 && `${criticalRisks.length} critical risk(s). `}
            {openIncidents.length > 0 && `${openIncidents.length} open incident(s). `}
            {overdueRisks.length > 0 && `${overdueRisks.length} overdue risk review(s).`}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Safe</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-safe-percentage">
              {getCompliancePercentage(complianceMetrics.safe.compliant, complianceMetrics.safe.total)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {complianceMetrics.safe.compliant} of {complianceMetrics.safe.total} compliant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Effective</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-effective-percentage">
              {getCompliancePercentage(complianceMetrics.effective.compliant, complianceMetrics.effective.total)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {complianceMetrics.effective.compliant} of {complianceMetrics.effective.total} compliant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Caring</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-caring-percentage">
              {getCompliancePercentage(complianceMetrics.caring.compliant, complianceMetrics.caring.total)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {complianceMetrics.caring.compliant} of {complianceMetrics.caring.total} compliant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responsive</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-responsive-percentage">
              {getCompliancePercentage(complianceMetrics.responsive.compliant, complianceMetrics.responsive.total)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {complianceMetrics.responsive.compliant} of {complianceMetrics.responsive.total} compliant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Well-led</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-wellled-percentage">
              {getCompliancePercentage(complianceMetrics.wellLed.compliant, complianceMetrics.wellLed.total)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {complianceMetrics.wellLed.compliant} of {complianceMetrics.wellLed.total} compliant
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="risks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="risks" data-testid="tab-risks">
            Risk Assessments ({riskAssessments?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="incidents" data-testid="tab-incidents">
            Incidents ({incidents?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="evidence" data-testid="tab-evidence">
            Evidence ({evidence?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="audit" data-testid="tab-audit">
            Audit Trail
          </TabsTrigger>
          <TabsTrigger value="training" data-testid="tab-training">
            Training ({trainingRecords?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessments</CardTitle>
              <CardDescription>
                Active risk assessments requiring review and mitigation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overdueRisks.length > 0 && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {overdueRisks.length} risk assessment(s) overdue for review
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-3">
                {riskAssessments?.map((risk) => (
                  <div key={risk.id} className="flex items-start justify-between p-4 border rounded-lg" data-testid={`card-risk-${risk.id}`}>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{risk.patientName}</h4>
                        <Badge variant={getRiskLevelColor(risk.riskLevel) as any}>
                          {risk.riskLevel}
                        </Badge>
                        <Badge variant="outline">{risk.riskType}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{risk.description}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Assessed by: {risk.assessedBy}</span>
                        <span>Next review: {format(new Date(risk.nextReviewDate), 'PPP')}</span>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(risk.status) as any}>
                      {risk.status}
                    </Badge>
                  </div>
                ))}
                {(!riskAssessments || riskAssessments.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">No risk assessments recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Safeguarding Incidents</CardTitle>
              <CardDescription>
                Incident reports and investigations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {incidents?.map((incident) => (
                  <div key={incident.id} className="flex items-start justify-between p-4 border rounded-lg" data-testid={`card-incident-${incident.id}`}>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{incident.incidentType}</h4>
                        <Badge variant={getRiskLevelColor(incident.severity) as any}>
                          {incident.severity}
                        </Badge>
                        {incident.escalatedToCQC && (
                          <Badge variant="destructive">CQC Escalated</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{incident.description}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Incident: {format(new Date(incident.incidentDate), 'PPP')}</span>
                        <span>Reported by: {incident.reportedBy}</span>
                        {incident.patientName && <span>Patient: {incident.patientName}</span>}
                      </div>
                    </div>
                    <Badge variant={getStatusColor(incident.status) as any}>
                      {incident.status}
                    </Badge>
                  </div>
                ))}
                {(!incidents || incidents.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">No incidents recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Evidence</CardTitle>
              <CardDescription>
                Documents, signatures, and evidence supporting CQC compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {evidence?.map((item) => (
                  <div key={item.id} className="flex items-start justify-between p-4 border rounded-lg" data-testid={`card-evidence-${item.id}`}>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold">{item.title}</h4>
                        <Badge variant="outline">{item.evidenceType}</Badge>
                        <Badge variant="outline">{item.complianceArea}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Uploaded: {format(new Date(item.uploadDate), 'PPP')}</span>
                        <span>By: {item.uploadedBy}</span>
                        {item.expiryDate && (
                          <span>Expires: {format(new Date(item.expiryDate), 'PPP')}</span>
                        )}
                      </div>
                    </div>
                    <Badge variant={getStatusColor(item.status) as any}>
                      {item.status}
                    </Badge>
                  </div>
                ))}
                {(!evidence || evidence.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">No evidence uploaded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>
                Complete audit log of all system actions with timestamps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {auditLogs?.map((log) => (
                  <div key={log.id} className="flex items-center gap-4 p-3 border rounded-lg text-sm" data-testid={`card-audit-${log.id}`}>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="font-medium">{log.userName}</span>
                      {' '}
                      <Badge variant="outline" className="mx-1">{log.action}</Badge>
                      {' '}
                      <span className="text-muted-foreground">{log.entityType}</span>
                      {' - '}
                      <span className="font-medium">{log.entityName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.timestamp), 'PPp')}
                    </span>
                  </div>
                ))}
                {(!auditLogs || auditLogs.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">No audit logs</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Training Records</CardTitle>
              <CardDescription>
                Training compliance and certification status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expiredTraining.length > 0 && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {expiredTraining.length} training certificate(s) have expired
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-3">
                {trainingRecords?.map((record) => (
                  <div key={record.id} className="flex items-start justify-between p-4 border rounded-lg" data-testid={`card-training-${record.id}`}>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{record.staffName}</h4>
                        <Badge variant="outline">{record.trainingType}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Provider: {record.trainingProvider}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Completed: {format(new Date(record.completionDate), 'PPP')}</span>
                        {record.expiryDate && (
                          <span>Expires: {format(new Date(record.expiryDate), 'PPP')}</span>
                        )}
                      </div>
                    </div>
                    <Badge variant={getStatusColor(record.status) as any}>
                      {record.status}
                    </Badge>
                  </div>
                ))}
                {(!trainingRecords || trainingRecords.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">No training records</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
