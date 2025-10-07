import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useRoute, Link } from "wouter";
import { db, type Staff } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Award, Building, Edit, Trash2, UserCircle, Clock } from "lucide-react";
import { format, isFuture, isToday } from "date-fns";
import { StaffEditDialog } from "@/components/StaffEditDialog";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLocation } from "wouter";

export default function StaffDetails() {
  const [match, params] = useRoute("/staff/:id");
  const staffId = params?.id;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const staff = useLiveQuery(
    () => staffId ? db.staff.get(staffId) : undefined,
    [staffId]
  );

  const assignedTasks = useLiveQuery(
    () => staff ? db.tasks.where('assignedTo').equals(`${staff.firstName} ${staff.lastName}`).toArray() : [],
    [staff]
  );

  const assignedShifts = useLiveQuery(
    () => staffId ? db.shifts.where('staffId').equals(staffId).toArray() : [],
    [staffId]
  );

  if (!match || !staff) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Staff member not found</p>
      </div>
    );
  }

  const initials = `${staff.firstName[0]}${staff.lastName[0]}`;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Doctor': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'Nurse': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'Caregiver': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Inactive': return 'secondary';
      case 'On Leave': return 'outline';
      default: return 'secondary';
    }
  };

  const handleDelete = async () => {
    try {
      await db.staff.delete(staff.id);
      toast({
        title: "Staff member deleted",
        description: `${staff.firstName} ${staff.lastName} has been removed from the system.`,
      });
      setLocation('/staff');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete staff member",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/staff">
          <Button variant="ghost" className="mb-4" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Staff List
          </Button>
        </Link>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className={`${getRoleBadgeColor(staff.role)} text-2xl`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-name">
                {staff.firstName} {staff.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getRoleBadgeColor(staff.role)} data-testid="badge-role">
                  {staff.role}
                </Badge>
                <Badge variant={getStatusBadgeVariant(staff.status)} data-testid="badge-status">
                  {staff.status}
                </Badge>
              </div>
              {staff.specialization && (
                <p className="text-muted-foreground mt-2">{staff.specialization}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsEditDialogOpen(true)} data-testid="button-edit">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} data-testid="button-delete">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="professional" data-testid="tab-professional">Professional Info</TabsTrigger>
          <TabsTrigger value="shifts" data-testid="tab-shifts">Shifts</TabsTrigger>
          <TabsTrigger value="tasks" data-testid="tab-tasks">Assigned Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span data-testid="text-email">{staff.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span data-testid="text-phone">{staff.phoneNumber}</span>
                </div>
                {staff.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span data-testid="text-address">{staff.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {staff.emergencyContact ? (
                  <>
                    <div className="flex items-center gap-3">
                      <UserCircle className="h-4 w-4 text-muted-foreground" />
                      <span data-testid="text-emergency-contact">{staff.emergencyContact}</span>
                    </div>
                    {staff.emergencyPhone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span data-testid="text-emergency-phone">{staff.emergencyPhone}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">No emergency contact provided</p>
                )}
              </CardContent>
            </Card>
          </div>

          {staff.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm" data-testid="text-notes">{staff.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="professional" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Professional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {staff.licenseNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">License Number</p>
                    <p className="font-medium font-mono" data-testid="text-license">{staff.licenseNumber}</p>
                  </div>
                )}
                {staff.department && (
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium" data-testid="text-department">{staff.department}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Hire Date</p>
                    <p className="font-medium" data-testid="text-hiredate">
                      {format(new Date(staff.hireDate), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {staff.certifications && staff.certifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {staff.certifications.map((cert, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1" data-testid={`badge-cert-${index}`}>
                        <Award className="h-3 w-3" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="shifts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Assigned Shifts</h3>
            <Badge variant="secondary" data-testid="badge-shift-count">
              {assignedShifts?.length || 0} shifts
            </Badge>
          </div>

          {assignedShifts && assignedShifts.length > 0 ? (
            <div className="space-y-3">
              {assignedShifts
                .sort((a, b) => {
                  const dateA = new Date(`${a.date}T${a.startTime}`);
                  const dateB = new Date(`${b.date}T${b.startTime}`);
                  return dateB.getTime() - dateA.getTime();
                })
                .map((shift) => {
                  const shiftDate = new Date(shift.date);
                  const isUpcoming = isFuture(shiftDate) || isToday(shiftDate);
                  
                  return (
                    <Card key={shift.id} className="hover-elevate" data-testid={`shift-card-${shift.id}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge 
                                variant={shift.status === 'Completed' ? 'outline' : 'default'}
                                data-testid={`badge-shift-status-${shift.id}`}
                              >
                                {shift.status}
                              </Badge>
                              <Badge 
                                variant="secondary"
                                data-testid={`badge-shift-type-${shift.id}`}
                              >
                                {shift.shiftType}
                              </Badge>
                              {isUpcoming && shift.status === 'Scheduled' && (
                                <Badge variant="default">Upcoming</Badge>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold" data-testid={`text-shift-date-${shift.id}`}>
                                  {format(shiftDate, 'EEEE, MMMM d, yyyy')}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground" data-testid={`text-shift-time-${shift.id}`}>
                                  {shift.startTime} - {shift.endTime}
                                </span>
                              </div>

                              {shift.patientName && (
                                <div className="flex items-center gap-2">
                                  <UserCircle className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm" data-testid={`text-shift-patient-${shift.id}`}>
                                    Patient: {shift.patientName}
                                  </span>
                                </div>
                              )}

                              {shift.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground" data-testid={`text-shift-location-${shift.id}`}>
                                    {shift.location}
                                  </span>
                                </div>
                              )}

                              {shift.notes && (
                                <p className="text-sm text-muted-foreground mt-2" data-testid={`text-shift-notes-${shift.id}`}>
                                  {shift.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground" data-testid="text-no-shifts">No shifts assigned</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Assigned Tasks</h3>
            <Badge variant="secondary" data-testid="badge-task-count">
              {assignedTasks?.length || 0} tasks
            </Badge>
          </div>

          {assignedTasks && assignedTasks.length > 0 ? (
            <div className="space-y-3">
              {assignedTasks.map((task) => (
                <Card key={task.id} className="hover-elevate">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge data-testid={`badge-task-status-${task.id}`}>{task.status}</Badge>
                          <Badge variant="outline" data-testid={`badge-task-priority-${task.id}`}>{task.priority}</Badge>
                        </div>
                        <h4 className="font-semibold" data-testid={`text-task-title-${task.id}`}>{task.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground" data-testid="text-no-tasks">No tasks assigned</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <StaffEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        staff={staff}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {staff.firstName} {staff.lastName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} data-testid="button-confirm-delete">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
