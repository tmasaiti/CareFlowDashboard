import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type TrainingRecord } from "@/lib/db";
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
import { Badge } from "@/components/ui/badge";
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
import { queryClient } from "@/lib/queryClient";

interface TrainingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  training?: TrainingRecord;
  staffId?: string;
}

export function TrainingDialog({ open, onOpenChange, training, staffId }: TrainingDialogProps) {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const staff = useLiveQuery(() => db.staff.toArray());

  const [formData, setFormData] = useState({
    staffId: staffId || "",
    staffName: "",
    trainingType: "",
    trainingProvider: "",
    completionDate: format(new Date(), 'yyyy-MM-dd'),
    expiryDate: "",
    certificateUrl: "",
    certificateNumber: "",
    status: "Current" as TrainingRecord['status'],
    verifiedBy: "",
    verificationDate: "",
    notes: "",
  });

  useEffect(() => {
    if (training) {
      setFormData({
        staffId: training.staffId,
        staffName: training.staffName,
        trainingType: training.trainingType,
        trainingProvider: training.trainingProvider,
        completionDate: training.completionDate,
        expiryDate: training.expiryDate || "",
        certificateUrl: training.certificateUrl || "",
        certificateNumber: training.certificateNumber || "",
        status: training.status,
        verifiedBy: training.verifiedBy || "",
        verificationDate: training.verificationDate || "",
        notes: training.notes || "",
      });
    } else if (staffId) {
      const staffMember = staff?.find(s => s.id === staffId);
      if (staffMember) {
        setFormData(prev => ({
          ...prev,
          staffId,
          staffName: `${staffMember.firstName} ${staffMember.lastName}`,
        }));
      }
    }
  }, [training, staffId, staff]);

  const resetForm = () => {
    setFormData({
      staffId: staffId || "",
      staffName: "",
      trainingType: "",
      trainingProvider: "",
      completionDate: format(new Date(), 'yyyy-MM-dd'),
      expiryDate: "",
      certificateUrl: "",
      certificateNumber: "",
      status: "Current",
      verifiedBy: "",
      verificationDate: "",
      notes: "",
    });
  };

  const handleSubmit = async () => {
    if (!formData.staffId || !formData.trainingType || !formData.trainingProvider || !formData.completionDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const selectedStaff = staff?.find(s => s.id === formData.staffId);

    const trainingData: TrainingRecord = {
      id: training?.id || crypto.randomUUID(),
      staffId: formData.staffId,
      staffName: selectedStaff ? `${selectedStaff.firstName} ${selectedStaff.lastName}` : formData.staffName,
      trainingType: formData.trainingType,
      trainingProvider: formData.trainingProvider,
      completionDate: formData.completionDate,
      expiryDate: formData.expiryDate || undefined,
      certificateUrl: formData.certificateUrl || undefined,
      certificateNumber: formData.certificateNumber || undefined,
      status: formData.status,
      verifiedBy: formData.verifiedBy || undefined,
      verificationDate: formData.verificationDate || undefined,
      notes: formData.notes || undefined,
    };

    try {
      if (training) {
        await db.trainingRecords.put(trainingData);
        toast({
          title: "Training Record Updated",
          description: "Training record has been updated successfully",
        });
      } else {
        await db.trainingRecords.add(trainingData);
        toast({
          title: "Training Record Created",
          description: "New training record has been created successfully",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/compliance/training'] });
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save training record",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!training) return;

    try {
      await db.trainingRecords.delete(training.id);
      toast({
        title: "Training Record Deleted",
        description: "Training record has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/compliance/training'] });
      setIsDeleteDialogOpen(false);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete training record",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-training">
          <DialogHeader>
            <DialogTitle>{training ? "Edit Training Record" : "Add Training Record"}</DialogTitle>
            <DialogDescription>
              {training ? "Update training record details" : "Record staff training completion"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="staff">Staff Member *</Label>
              <Select 
                value={formData.staffId} 
                onValueChange={(value) => {
                  const staffMember = staff?.find(s => s.id === value);
                  setFormData({ 
                    ...formData, 
                    staffId: value,
                    staffName: staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : ""
                  });
                }}
                disabled={!!staffId}
              >
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trainingType">Training Type *</Label>
                <Input
                  id="trainingType"
                  placeholder="e.g., First Aid, Safeguarding, Fire Safety"
                  value={formData.trainingType}
                  onChange={(e) => setFormData({ ...formData, trainingType: e.target.value })}
                  data-testid="input-training-type"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trainingProvider">Training Provider *</Label>
                <Input
                  id="trainingProvider"
                  placeholder="e.g., Red Cross, St John Ambulance"
                  value={formData.trainingProvider}
                  onChange={(e) => setFormData({ ...formData, trainingProvider: e.target.value })}
                  data-testid="input-training-provider"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="completionDate">Completion Date *</Label>
                <Input
                  id="completionDate"
                  type="date"
                  value={formData.completionDate}
                  onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                  data-testid="input-completion-date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => {
                    const expiry = e.target.value;
                    const today = new Date();
                    const expiryDate = new Date(expiry);
                    const daysUntilExpiry = (expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
                    
                    let status: TrainingRecord['status'] = "Current";
                    if (expiryDate < today) {
                      status = "Expired";
                    } else if (daysUntilExpiry <= 30) {
                      status = "Expiring Soon";
                    }
                    
                    setFormData({ ...formData, expiryDate: e.target.value, status });
                  }}
                  data-testid="input-expiry-date"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certificateNumber">Certificate Number</Label>
                <Input
                  id="certificateNumber"
                  placeholder="Certificate number"
                  value={formData.certificateNumber}
                  onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                  data-testid="input-certificate-number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: TrainingRecord['status']) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Current">Current</SelectItem>
                    <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant={formData.status === 'Expired' ? 'destructive' : 'default'}>{formData.status}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="verifiedBy">Verified By</Label>
                <Input
                  id="verifiedBy"
                  placeholder="Name of verifier"
                  value={formData.verifiedBy}
                  onChange={(e) => setFormData({ ...formData, verifiedBy: e.target.value })}
                  data-testid="input-verified-by"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="verificationDate">Verification Date</Label>
                <Input
                  id="verificationDate"
                  type="date"
                  value={formData.verificationDate}
                  onChange={(e) => setFormData({ ...formData, verificationDate: e.target.value })}
                  data-testid="input-verification-date"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about this training..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                data-testid="textarea-notes"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between gap-2">
            {training && (
              <Button 
                variant="destructive" 
                onClick={() => setIsDeleteDialogOpen(true)}
                data-testid="button-delete"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
                Cancel
              </Button>
              <Button onClick={handleSubmit} data-testid="button-save">
                {training ? "Update" : "Add"} Training
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Training Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this training record? This action cannot be undone.
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
