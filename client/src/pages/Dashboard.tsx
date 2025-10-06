import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { initializeMockData } from "@/lib/mockData";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Calendar, AlertCircle, CheckCircle, Bell } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function Dashboard() {
  useEffect(() => {
    initializeMockData();
  }, []);

  const patients = useLiveQuery(() => db.patients.toArray()) || [];
  const tasks = useLiveQuery(() => db.tasks.toArray()) || [];
  const activePatients = patients.filter(p => p.status === 'Active').length;
  const criticalTasks = tasks.filter(t => t.status === 'critical').length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const upcomingTasks = tasks
    .filter(t => t.status !== 'done')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, Dr. Evelyn Reed
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Patients"
          value={patients.length}
          icon={Users}
          trend={{ value: `${activePatients} active`, isPositive: true }}
        />
        <MetricCard
          title="Tasks Today"
          value={upcomingTasks.length}
          icon={Calendar}
        />
        <MetricCard
          title="Critical Alerts"
          value={criticalTasks}
          icon={AlertCircle}
        />
        <MetricCard
          title="Completed Tasks"
          value={completedTasks}
          icon={CheckCircle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
            <div>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription className="mt-1">
                Tasks requiring your attention
              </CardDescription>
            </div>
            <Link href="/tasks">
              <Button variant="outline" size="sm" data-testid="link-view-all-tasks">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No upcoming tasks
                </p>
              ) : (
                upcomingTasks.map((task) => {
                  const patient = patients.find(p => p.id === task.patientId);
                  return (
                    <div
                      key={task.id}
                      className="flex items-start justify-between gap-3 p-3 rounded-lg hover-elevate border border-card-border cursor-pointer"
                      onClick={() => console.log('Task clicked:', task.id)}
                      data-testid={`row-task-${task.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
            <div>
              <CardTitle>Urgent Alerts</CardTitle>
              <CardDescription className="mt-1">
                Critical patient notifications
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" data-testid="button-view-all-alerts">
              <Bell className="h-4 w-4 mr-1" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalTasks === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No critical alerts
                </p>
              ) : (
                tasks
                  .filter(t => t.status === 'critical' || t.status === 'missed')
                  .slice(0, 5)
                  .map((task) => {
                    const patient = patients.find(p => p.id === task.patientId);
                    return (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-status-critical/20 bg-status-critical/5"
                        data-testid={`alert-${task.id}`}
                      >
                        <AlertCircle className="h-5 w-5 text-status-critical flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                          </p>
                        </div>
                        <StatusBadge status={task.status} />
                      </div>
                    );
                  })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
