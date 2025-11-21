import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type SafeguardingIncident, type IncidentSeverity, type IncidentStatus } from "@/lib/db";
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
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Trash2, Plus, X } from "lucide-react";
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

interface IncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incident?: SafeguardingIncident;
  patientId?: string;
}

export function IncidentDialog({ open, onOpenChange, incident, patientId }: IncidentDialogProps) {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newPreventiveAction, setNewPreventiveAction] = useState("");

  const patients = useLiveQuery(() => db.patients.toArray());
  const staff = useLiveQuery(() => db.staff.toArray());

  const [formData, setFormData] = useState({
    incidentDate: format(new Date(), 'yyyy-MM-dd'),
    reportedDate: format(new Date(), 'yyyy-MM-dd'),
    reportedBy: "",
    patientId: patientId || "",
    patientName: "",
    staffId: "",
    staffName: "",
    incidentType: "Fall" as SafeguardingIncident['incidentType'],
    severity: "Minor" as IncidentSeverity,
    status: "Reported" as IncidentStatus,
    description: "",
    location: "",
    witnessesPresent: [] as string[],
    immediateActionTaken: "",
    investigationNotes: "",
    preventiveActions: [] as string[],
    evidenceIds: [] as string[],
    escalatedToCQC: false,
    cqcReferenceNumber: "",
    resolvedDate: "",
    resolvedBy: "",
  });

  useEffect(() => {
    if (incident) {
      setFormData({
        incidentDate: incident.incidentDate,
        reportedDate: incident.reportedDate,
        reportedBy: incident.reportedBy,
        patientId: incident.patientId || "",
        patientName: incident.patientName || "",
        staffId: incident.staffId || "",
        staffName: incident.staffName || "",
        incidentType: incident.incidentType,
        severity: incident.severity,
        status: incident.status,
        description: incident.description,
        location: incident.location || "",
        witnessesPresent: incident.witnessesPresent || [],
        immediateActionTaken: incident.immediateActionTaken || "",
        investigationNotes: incident.investigationNotes || "",
        preventiveActions: incident.preventiveActions || [],
        evidenceIds: incident.evidenceIds || [],
        escalatedToCQC: incident.escalatedToCQC,
        cqcReferenceNumber: incident.cqcReferenceNumber || "",
        resolvedDate: incident.resolvedDate || "",
        resolvedBy: incident.resolvedBy || "",
      });
    } else if (patientId) {
      const patient = patients?.find(p => p.id === patientId);
      if (patient) {
        setFormData(prev => ({
          ...prev,
          patientId,
          patientName: `${patient.firstName} ${patient.lastName}`,
        }));
      }
    }
  }, [incident, patientId, patients]);

  const resetForm = () => {
    setFormData({
      incidentDate: format(new Date(), 'yyyy-MM-dd'),
      reportedDate: format(new Date(), 'yyyy-MM-dd'),
      reportedBy: "",
      patientId: patientId || "",
      patientName: "",
      staffId: "",
      staffName: "",
      incidentType: "Fall",
      severity: "Minor",
      status: "Reported",
      description: "",
      location: "",
      witnessesPresent: [],
      immediateActionTaken: "",
      investigationNotes: "",
      preventiveActions: [],
      evidenceIds: [],
      escalatedToCQC: false,
      cqcReferenceNumber: "",
      resolvedDate: "",
      resolvedBy: "",
    });
    setNewPreventiveAction("");
  };

  const handleSubmit = async () => {
    if (!formData.description || !formData.reportedBy) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const selectedPatient = formData.patientId ? patients?.find(p => p.id === formData.patientId) : null;
    const selectedStaff = formData.staffId ? staff?.find(s => s.id === formData.staffId) : null;

    const incidentData: SafeguardingIncident = {
      id: incident?.id || crypto.randomUUID(),
      incidentDate: formData.incidentDate,
      reportedDate: formData.reportedDate,
      reportedBy: formData.reportedBy,
      patientId: formData.patientId || undefined,
      patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : formData.patientName || undefined,
      staffId: formData.staffId || undefined,
      staffName: selectedStaff ? `${selectedStaff.firstName} ${selectedStaff.lastName}` : formData.staffName || undefined,
      incidentType: formData.incidentType,
      severity: formData.severity,
      status: formData.status,
      description: formData.description,
      location: formData.location || undefined,
      witnessesPresent: formData.witnessesPresent.length > 0 ? formData.witnessesPresent : undefined,
      immediateActionTaken: formData.immediateActionTaken || undefined,
      investigationNotes: formData.investigationNotes || undefined,
      preventiveActions: formData.preventiveActions.length > 0 ? formData.preventiveActions : undefined,
      evidenceIds: formData.evidenceIds.length > 0 ? formData.evidenceIds : undefined,
      escalatedToCQC: formData.escalatedToCQC,
      cqcReferenceNumber: formData.cqcReferenceNumber || undefined,
      resolvedDate: formData.resolvedDate || undefined,
      resolvedBy: formData.resolvedBy || undefined,
    };

    try {
      if (incident) {
        await db.safeguardingIncidents.put(incidentData);
        toast({
          title: "Incident Updated",
          description: "Incident has been updated successfully",
        });
      } else {
        await db.safeguardingIncidents.add(incidentData);
        toast({
          title: "Incident Reported",
          description: "Incident has been reported successfully",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/compliance/incidents'] });
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save incident",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!incident) return;

    try {
      await db.safeguardingIncidents.delete(incident.id);
      toast({
        title: "Incident Deleted",
        description: "Incident has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/compliance/incidents'] });
      setIsDeleteDialogOpen(false);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete incident",
        variant: "destructive",
      });
    }
  };

  const addPreventiveAction = () => {
    if (newPreventiveAction.trim()) {
      setFormData({
        ...formData,
        preventiveActions: [...formData.preventiveActions, newPreventiveAction.trim()]
      });
      setNewPreventiveAction("");
    }
  };

  const removePreventiveAction = (index: number) => {
    setFormData({
      ...formData,
      preventiveActions: formData.preventiveActions.filter((_, i) => i !== index)
    });
  };

  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'Critical': return 'destructive';
      case 'Serious': return 'destructive';
      case 'Moderate': return 'default';
      case 'Minor': return 'secondary';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-incident">
          <DialogHeader>
            <DialogTitle>{incident ? "Edit Incident" : "Report Incident"}</DialogTitle>
            <DialogDescription>
              {incident ? "Update incident details and investigation notes" : "Record a safeguarding incident"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="incidentType">Incident Type *</Label>
                <Select value={formData.incidentType} onValueChange={(value: SafeguardingIncident['incidentType']) => setFormData({ ...formData, incidentType: value })}>
                  <SelectTrigger data-testid="select-incident-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall">Fall</SelectItem>
                    <SelectItem value="Medication Error">Medication Error</SelectItem>
                    <SelectItem value="Abuse">Abuse</SelectItem>
                    <SelectItem value="Neglect">Neglect</SelectItem>
                    <SelectItem value="Injury">Injury</SelectItem>
                    <SelectItem value="Property Loss">Property Loss</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Severity *</Label>
                <Select value={formData.severity} onValueChange={(value: IncidentSeverity) => setFormData({ ...formData, severity: value })}>
                  <SelectTrigger data-testid="select-severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Minor">Minor</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Serious">Serious</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                {formData.severity && (
                  <Badge variant={getSeverityColor(formData.severity)}>{formData.severity}</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value: IncidentStatus) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Reported">Reported</SelectItem>
                    <SelectItem value="Under Investigation">Under Investigation</SelectItem>
                    <SelectItem value="Action Taken">Action Taken</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Escalated to CQC">Escalated to CQC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Where did the incident occur?"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  data-testid="input-location"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Patient (Optional)</Label>
                <Select 
                  value={formData.patientId || "none"} 
                  onValueChange={(value) => {
                    const patient = value !== "none" ? patients?.find(p => p.id === value) : null;
                    setFormData({ 
                      ...formData, 
                      patientId: value === "none" ? "" : value,
                      patientName: patient ? `${patient.firstName} ${patient.lastName}` : ""
                    });
                  }}
                  disabled={!!patientId}
                >
                  <SelectTrigger data-testid="select-patient">
                    <SelectValue placeholder="Select patient (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {patients?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.firstName} {p.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="staff">Staff Involved (Optional)</Label>
                <Select 
                  value={formData.staffId || "none"} 
                  onValueChange={(value) => {
                    const staffMember = value !== "none" ? staff?.find(s => s.id === value) : null;
                    setFormData({ 
                      ...formData, 
                      staffId: value === "none" ? "" : value,
                      staffName: staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : ""
                    });
                  }}
                >
                  <SelectTrigger data-testid="select-staff">
                    <SelectValue placeholder="Select staff (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {staff?.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} - {s.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="incidentDate">Incident Date *</Label>
                <Input
                  id="incidentDate"
                  type="date"
                  value={formData.incidentDate}
                  onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                  data-testid="input-incident-date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportedDate">Reported Date *</Label>
                <Input
                  id="reportedDate"
                  type="date"
                  value={formData.reportedDate}
                  onChange={(e) => setFormData({ ...formData, reportedDate: e.target.value })}
                  data-testid="input-reported-date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportedBy">Reported By *</Label>
                <Input
                  id="reportedBy"
                  placeholder="Name of reporter"
                  value={formData.reportedBy}
                  onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                  data-testid="input-reported-by"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Incident Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what happened in detail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                data-testid="textarea-description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="immediateActionTaken">Immediate Action Taken</Label>
              <Textarea
                id="immediateActionTaken"
                placeholder="What immediate actions were taken?"
                value={formData.immediateActionTaken}
                onChange={(e) => setFormData({ ...formData, immediateActionTaken: e.target.value })}
                rows={2}
                data-testid="textarea-immediate-action"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="investigationNotes">Investigation Notes</Label>
              <Textarea
                id="investigationNotes"
                placeholder="Investigation findings and notes..."
                value={formData.investigationNotes}
                onChange={(e) => setFormData({ ...formData, investigationNotes: e.target.value })}
                rows={3}
                data-testid="textarea-investigation"
              />
            </div>

            <div className="space-y-2">
              <Label>Preventive Actions</Label>
              <div className="space-y-2">
                {formData.preventiveActions.map((action, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={action} readOnly className="flex-1" data-testid={`input-preventive-${index}`} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePreventiveAction(index)}
                      data-testid={`button-remove-preventive-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add preventive action..."
                    value={newPreventiveAction}
                    onChange={(e) => setNewPreventiveAction(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPreventiveAction())}
                    data-testid="input-new-preventive"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addPreventiveAction}
                    data-testid="button-add-preventive"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="escalatedToCQC"
                  checked={formData.escalatedToCQC}
                  onCheckedChange={(checked) => setFormData({ ...formData, escalatedToCQC: checked === true })}
                  data-testid="checkbox-escalated"
                />
                <Label htmlFor="escalatedToCQC" className="font-semibold">
                  Escalated to CQC
                </Label>
              </div>

              {formData.escalatedToCQC && (
                <div className="space-y-2">
                  <Label htmlFor="cqcReferenceNumber">CQC Reference Number</Label>
                  <Input
                    id="cqcReferenceNumber"
                    placeholder="Enter CQC reference number"
                    value={formData.cqcReferenceNumber}
                    onChange={(e) => setFormData({ ...formData, cqcReferenceNumber: e.target.value })}
                    data-testid="input-cqc-reference"
                  />
                </div>
              )}

              {formData.status === 'Resolved' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="resolvedDate">Resolved Date</Label>
                    <Input
                      id="resolvedDate"
                      type="date"
                      value={formData.resolvedDate}
                      onChange={(e) => setFormData({ ...formData, resolvedDate: e.target.value })}
                      data-testid="input-resolved-date"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resolvedBy">Resolved By</Label>
                    <Input
                      id="resolvedBy"
                      placeholder="Name of resolver"
                      value={formData.resolvedBy}
                      onChange={(e) => setFormData({ ...formData, resolvedBy: e.target.value })}
                      data-testid="input-resolved-by"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-between gap-2">
            {incident && (
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
                {incident ? "Update" : "Report"} Incident
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Incident</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this incident? This action cannot be undone.
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
