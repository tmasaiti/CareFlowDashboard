import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Shift } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
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

interface ShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift?: Shift;
  selectedDate?: Date;
}

export function ShiftDialog({ open, onOpenChange, shift, selectedDate }: ShiftDialogProps) {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const staff = useLiveQuery(() => db.staff.where('status').equals('Active').toArray());
  const patients = useLiveQuery(() => db.patients.toArray());

  const [formData, setFormData] = useState({
    staffId: "",
    date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    startTime: "09:00",
    endTime: "17:00",
    patientId: "",
    location: "",
    shiftType: "Visit" as Shift['shiftType'],
    status: "Scheduled" as Shift['status'],
    notes: "",
  });

  useEffect(() => {
    if (shift) {
      const selectedStaff = staff?.find(s => s.id === shift.staffId);
      const selectedPatient = patients?.find(p => p.id === shift.patientId);
      
      setFormData({
        staffId: shift.staffId,
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        patientId: shift.patientId || "",
        location: shift.location || "",
        shiftType: shift.shiftType,
        status: shift.status,
        notes: shift.notes || "",
      });
    } else if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: format(selectedDate, 'yyyy-MM-dd'),
      }));
    }
  }, [shift, selectedDate, staff, patients]);

  const handleSubmit = async () => {
    if (!formData.staffId || !formData.date || !formData.startTime || !formData.endTime) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const selectedStaff = staff?.find(s => s.id === formData.staffId);
    const selectedPatient = patients?.find(p => p.id === formData.patientId);

    const shiftData: Shift = {
      id: shift?.id || crypto.randomUUID(),
      staffId: formData.staffId,
      staffName: selectedStaff ? `${selectedStaff.firstName} ${selectedStaff.lastName}` : "",
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      patientId: formData.patientId || undefined,
      patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : undefined,
      location: formData.location || undefined,
      shiftType: formData.shiftType,
      status: formData.status,
      notes: formData.notes || undefined,
    };

    try {
      if (shift) {
        await db.shifts.update(shift.id, {
          staffId: shiftData.staffId,
          staffName: shiftData.staffName,
          date: shiftData.date,
          startTime: shiftData.startTime,
          endTime: shiftData.endTime,
          patientId: shiftData.patientId,
          patientName: shiftData.patientName,
          location: shiftData.location,
          shiftType: shiftData.shiftType,
          status: shiftData.status,
          notes: shiftData.notes,
        });
        toast({
          title: "Shift Updated",
          description: "Shift has been updated successfully",
        });
      } else {
        await db.shifts.add(shiftData);
        toast({
          title: "Shift Created",
          description: "New shift has been created successfully",
        });
      }
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
          title: "Error",
        description: "Failed to save shift",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!shift) return;

    try {
      await db.shifts.delete(shift.id);
      toast({
        title: "Shift Deleted",
        description: "Shift has been deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete shift",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      staffId: "",
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      startTime: "09:00",
      endTime: "17:00",
      patientId: "",
      location: "",
      shiftType: "Visit",
      status: "Scheduled",
      notes: "",
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-shift">
          <DialogHeader>
            <DialogTitle>{shift ? "Edit Shift" : "Create New Shift"}</DialogTitle>
            <DialogDescription>
              {shift ? "Update shift details" : "Schedule a new shift for staff"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="staff">Staff Member *</Label>
                <Select value={formData.staffId} onValueChange={(value) => setFormData({ ...formData, staffId: value })}>
                  <SelectTrigger data-testid="select-staff">
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff?.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} - {s.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  data-testid="input-date"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  data-testid="input-start-time"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  data-testid="input-end-time"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shiftType">Shift Type</Label>
                <Select value={formData.shiftType} onValueChange={(value: Shift['shiftType']) => setFormData({ ...formData, shiftType: value })}>
                  <SelectTrigger data-testid="select-shift-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Visit">Visit</SelectItem>
                    <SelectItem value="Care">Care</SelectItem>
                    <SelectItem value="Assessment">Assessment</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: Shift['status']) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient">Patient (Optional)</Label>
              <Select value={formData.patientId} onValueChange={(value) => setFormData({ ...formData, patientId: value })}>
                <SelectTrigger data-testid="select-patient">
                  <SelectValue placeholder="Select patient (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {patients?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. Home visit, Clinic, etc."
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                data-testid="input-location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about this shift"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                data-testid="textarea-notes"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between gap-2">
            {shift && (
              <Button 
                variant="destructive" 
                onClick={() => setIsDeleteDialogOpen(true)}
                data-testid="button-delete-shift"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
                Cancel
              </Button>
              <Button onClick={handleSubmit} data-testid="button-save-shift">
                {shift ? "Update" : "Create"} Shift
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shift</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this shift? This action cannot be undone.
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
    </>
  );
}
