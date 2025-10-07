import { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Shift } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, User, MapPin } from "lucide-react";
import { format, addDays, subDays, startOfDay, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { ShiftDialog } from "@/components/ShiftDialog";

type ViewMode = 'day' | 'week';

export default function Rota() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | undefined>();

  const dateString = format(startOfDay(selectedDate), 'yyyy-MM-dd');
  
  const { weekStart, weekEnd, weekStartStr, weekEndStr, weekDays } = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return {
      weekStart: start,
      weekEnd: end,
      weekStartStr: format(start, 'yyyy-MM-dd'),
      weekEndStr: format(end, 'yyyy-MM-dd'),
      weekDays: eachDayOfInterval({ start, end }),
    };
  }, [selectedDate]);
  
  const shifts = useLiveQuery(
    () => {
      if (viewMode === 'day') {
        return db.shifts.where('date').equals(dateString).toArray();
      } else {
        return db.shifts.where('date').between(weekStartStr, weekEndStr, true, true).toArray();
      }
    },
    [dateString, viewMode, weekStartStr, weekEndStr]
  );

  const staff = useLiveQuery(() => db.staff.toArray());

  const getShiftTypeColor = (type: string) => {
    switch (type) {
      case 'Visit': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'Care': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'Assessment': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'Administration': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'secondary';
      case 'In Progress': return 'default';
      case 'Completed': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleNewShift = () => {
    setSelectedShift(undefined);
    setIsDialogOpen(true);
  };

  const handleEditShift = (shift: Shift) => {
    setSelectedShift(shift);
    setIsDialogOpen(true);
  };

  const handlePrevious = () => {
    if (viewMode === 'day') {
      setSelectedDate(prev => subDays(prev, 1));
    } else {
      setSelectedDate(prev => subDays(prev, 7));
    }
  };

  const handleNext = () => {
    if (viewMode === 'day') {
      setSelectedDate(prev => addDays(prev, 1));
    } else {
      setSelectedDate(prev => addDays(prev, 7));
    }
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const activeStaff = staff?.filter(s => s.status === 'Active').length || 0;
  const totalShifts = shifts?.length || 0;
  const completedShifts = shifts?.filter(s => s.status === 'Completed').length || 0;
  const inProgressShifts = shifts?.filter(s => s.status === 'In Progress').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-rota">Rota Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage staff shifts and schedules
          </p>
        </div>
        <Button onClick={handleNewShift} data-testid="button-new-shift">
          <Plus className="h-4 w-4 mr-2" />
          Create Shift
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shifts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-total-shifts">{totalShifts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-in-progress">{inProgressShifts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-completed">{completedShifts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-active-staff">{activeStaff}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="day" data-testid="tab-day-view">Day</TabsTrigger>
                  <TabsTrigger value="week" data-testid="tab-week-view">Week</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button 
                variant="outline" 
                onClick={handleToday}
                data-testid="button-today"
              >
                Today
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handlePrevious}
                data-testid="button-previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle data-testid="text-selected-date">
                  {viewMode === 'day' 
                    ? format(selectedDate, 'EEEE, MMMM d, yyyy')
                    : `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
                  }
                </CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleNext}
                data-testid="button-next"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'day' ? (
            shifts && shifts.length > 0 ? (
              <div className="space-y-3">
                {shifts
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((shift) => (
                    <Card 
                      key={shift.id} 
                      className="hover-elevate cursor-pointer"
                      onClick={() => handleEditShift(shift)}
                      data-testid={`shift-card-${shift.id}`}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge 
                                variant={getStatusVariant(shift.status)}
                                data-testid={`badge-status-${shift.id}`}
                              >
                                {shift.status}
                              </Badge>
                              <Badge 
                                className={getShiftTypeColor(shift.shiftType)}
                                data-testid={`badge-type-${shift.id}`}
                              >
                                {shift.shiftType}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold" data-testid={`text-staff-${shift.id}`}>
                                  {shift.staffName}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground" data-testid={`text-time-${shift.id}`}>
                                  {shift.startTime} - {shift.endTime}
                                </span>
                              </div>

                              {shift.patientName && (
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm" data-testid={`text-patient-${shift.id}`}>
                                    Patient: {shift.patientName}
                                  </span>
                                </div>
                              )}

                              {shift.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground" data-testid={`text-location-${shift.id}`}>
                                    {shift.location}
                                  </span>
                                </div>
                              )}

                              {shift.notes && (
                                <p className="text-sm text-muted-foreground mt-2" data-testid={`text-notes-${shift.id}`}>
                                  {shift.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4" data-testid="text-no-shifts">
                  No shifts scheduled for this day
                </p>
                <Button onClick={handleNewShift} data-testid="button-create-first-shift">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Shift
                </Button>
              </div>
            )
          ) : (
            <div className="space-y-4">
              {weekDays.map((day) => {
                const dayString = format(day, 'yyyy-MM-dd');
                const dayShifts = shifts?.filter(s => s.date === dayString) || [];
                
                return (
                  <div key={dayString} data-testid={`week-day-${dayString}`}>
                    <div className="font-semibold mb-2" data-testid={`week-day-header-${dayString}`}>
                      {format(day, 'EEEE, MMM d')}
                    </div>
                    {dayShifts.length > 0 ? (
                      <div className="space-y-2">
                        {dayShifts
                          .sort((a, b) => a.startTime.localeCompare(b.startTime))
                          .map((shift) => (
                            <Card 
                              key={shift.id} 
                              className="hover-elevate cursor-pointer"
                              onClick={() => handleEditShift(shift)}
                              data-testid={`shift-card-${shift.id}`}
                            >
                              <CardContent className="pt-4 pb-4">
                                <div className="flex items-center gap-4 flex-wrap">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <span className="text-sm font-medium" data-testid={`text-time-${shift.id}`}>
                                      {shift.startTime} - {shift.endTime}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 min-w-0">
                                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <span className="text-sm truncate" data-testid={`text-staff-${shift.id}`}>
                                      {shift.staffName}
                                    </span>
                                  </div>

                                  <Badge 
                                    variant={getStatusVariant(shift.status)}
                                    data-testid={`badge-status-${shift.id}`}
                                  >
                                    {shift.status}
                                  </Badge>
                                  
                                  <Badge 
                                    className={getShiftTypeColor(shift.shiftType)}
                                    data-testid={`badge-type-${shift.id}`}
                                  >
                                    {shift.shiftType}
                                  </Badge>

                                  {shift.patientName && (
                                    <span className="text-sm text-muted-foreground truncate" data-testid={`text-patient-${shift.id}`}>
                                      Patient: {shift.patientName}
                                    </span>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground pl-4" data-testid={`text-no-shifts-${dayString}`}>
                        No shifts
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ShiftDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        shift={selectedShift}
        selectedDate={selectedDate}
      />
    </div>
  );
}
