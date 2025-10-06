import { useLiveQuery } from "dexie-react-hooks";
import { db, type Task } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, User as UserIcon } from "lucide-react";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { StatusBadge } from "@/components/StatusBadge";
import { useState } from "react";
import { TaskDialog } from "@/components/TaskDialog";

export default function Tasks() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();

  const tasks = useLiveQuery(() => db.tasks.toArray());
  const patients = useLiveQuery(() => db.patients.toArray());

  const getPatientName = (patientId: string) => {
    const patient = patients?.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const getDueDateBadge = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date)) {
      return <Badge variant="destructive" data-testid={`badge-overdue-${dueDate}`}>Overdue</Badge>;
    }
    if (isToday(date)) {
      return <Badge variant="default" data-testid={`badge-today-${dueDate}`}>Today</Badge>;
    }
    if (isTomorrow(date)) {
      return <Badge variant="secondary" data-testid={`badge-tomorrow-${dueDate}`}>Tomorrow</Badge>;
    }
    return null;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 dark:text-red-400';
      case 'High': return 'text-orange-600 dark:text-orange-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'Low': return 'text-green-600 dark:text-green-400';
      default: return 'text-muted-foreground';
    }
  };

  const groupedTasks = {
    critical: tasks?.filter(t => t.status === 'critical') || [],
    pending: tasks?.filter(t => t.status === 'pending') || [],
    onhold: tasks?.filter(t => t.status === 'onhold') || [],
    done: tasks?.filter(t => t.status === 'done') || [],
  };

  const handleNewTask = () => {
    setSelectedTask(undefined);
    setIsDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-tasks">Care Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage patient care tasks and assignments</p>
        </div>
        <Button onClick={handleNewTask} data-testid="button-new-task">
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="count-critical">{groupedTasks.critical.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="count-pending">{groupedTasks.pending.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-600 dark:text-yellow-400">On Hold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="count-onhold">{groupedTasks.onhold.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="count-done">{groupedTasks.done.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Tasks</h2>
        {tasks && tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => (
              <Card key={task.id} className="hover-elevate" data-testid={`card-task-${task.id}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <StatusBadge status={task.status} />
                        <Badge className={getPriorityColor(task.priority)} data-testid={`badge-priority-${task.id}`}>
                          {task.priority}
                        </Badge>
                        {getDueDateBadge(task.dueDate)}
                      </div>
                      <h3 className="font-semibold text-lg" data-testid={`text-title-${task.id}`}>{task.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1" data-testid={`text-description-${task.id}`}>
                        {task.description}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          <span data-testid={`text-patient-${task.id}`}>{getPatientName(task.patientId)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span data-testid={`text-duedate-${task.id}`}>
                            Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                        {task.assignedTo && (
                          <div className="flex items-center gap-2">
                            <span data-testid={`text-assigned-${task.id}`}>Assigned to: {task.assignedTo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTask(task)}
                      data-testid={`button-edit-${task.id}`}
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4" data-testid="text-no-tasks">No tasks created yet</p>
              <Button onClick={handleNewTask} data-testid="button-create-first-task">
                <Plus className="h-4 w-4 mr-2" />
                Create First Task
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={selectedTask}
        patients={patients || []}
      />
    </div>
  );
}
