import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type RiskAssessment, type RiskLevel, type RiskStatus } from "@/lib/db";
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

interface RiskAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessment?: RiskAssessment;
  patientId?: string;
}

export function RiskAssessmentDialog({ open, onOpenChange, assessment, patientId }: RiskAssessmentDialogProps) {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newMitigationAction, setNewMitigationAction] = useState("");

  const patients = useLiveQuery(() => db.patients.toArray());
  const staff = useLiveQuery(() => db.staff.where('status').equals('Active').toArray());

  const [formData, setFormData] = useState({
    patientId: patientId || "",
    patientName: "",
    riskType: "Falls" as RiskAssessment['riskType'],
    riskLevel: "Medium" as RiskLevel,
    status: "Identified" as RiskStatus,
    identifiedDate: format(new Date(), 'yyyy-MM-dd'),
    lastReviewDate: format(new Date(), 'yyyy-MM-dd'),
    nextReviewDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 30 days from now
    description: "",
    mitigationActions: [] as string[],
    assessedBy: "",
    reviewedBy: "",
    digitalSignature: "",
    notes: "",
  });

  useEffect(() => {
    if (assessment) {
      setFormData({
        patientId: assessment.patientId,
        patientName: assessment.patientName,
        riskType: assessment.riskType,
        riskLevel: assessment.riskLevel,
        status: assessment.status,
        identifiedDate: assessment.identifiedDate,
        lastReviewDate: assessment.lastReviewDate,
        nextReviewDate: assessment.nextReviewDate,
        description: assessment.description,
        mitigationActions: assessment.mitigationActions,
        assessedBy: assessment.assessedBy,
        reviewedBy: assessment.reviewedBy || "",
        digitalSignature: assessment.digitalSignature || "",
        notes: assessment.notes || "",
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
  }, [assessment, patientId, patients]);

  const resetForm = () => {
    setFormData({
      patientId: patientId || "",
      patientName: "",
      riskType: "Falls",
      riskLevel: "Medium",
      status: "Identified",
      identifiedDate: format(new Date(), 'yyyy-MM-dd'),
      lastReviewDate: format(new Date(), 'yyyy-MM-dd'),
      nextReviewDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      description: "",
      mitigationActions: [],
      assessedBy: "",
      reviewedBy: "",
      digitalSignature: "",
      notes: "",
    });
    setNewMitigationAction("");
  };

  const handleSubmit = async () => {
    if (!formData.patientId || !formData.description || !formData.assessedBy) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const selectedPatient = patients?.find(p => p.id === formData.patientId);

    const assessmentData: RiskAssessment = {
      id: assessment?.id || crypto.randomUUID(),
      patientId: formData.patientId,
      patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : formData.patientName,
      riskType: formData.riskType,
      riskLevel: formData.riskLevel,
      status: formData.status,
      identifiedDate: formData.identifiedDate,
      lastReviewDate: formData.lastReviewDate,
      nextReviewDate: formData.nextReviewDate,
      description: formData.description,
      mitigationActions: formData.mitigationActions,
      assessedBy: formData.assessedBy,
      reviewedBy: formData.reviewedBy || undefined,
      digitalSignature: formData.digitalSignature || undefined,
      notes: formData.notes || undefined,
    };

    try {
      if (assessment) {
        await db.riskAssessments.put(assessmentData);
        toast({
          title: "Risk Assessment Updated",
          description: "Risk assessment has been updated successfully",
        });
      } else {
        await db.riskAssessments.add(assessmentData);
        toast({
          title: "Risk Assessment Created",
          description: "New risk assessment has been created successfully",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/compliance/risk-assessments'] });
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save risk assessment",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!assessment) return;

    try {
      await db.riskAssessments.delete(assessment.id);
      toast({
        title: "Risk Assessment Deleted",
        description: "Risk assessment has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/compliance/risk-assessments'] });
      setIsDeleteDialogOpen(false);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete risk assessment",
        variant: "destructive",
      });
    }
  };

  const addMitigationAction = () => {
    if (newMitigationAction.trim()) {
      setFormData({
        ...formData,
        mitigationActions: [...formData.mitigationActions, newMitigationAction.trim()]
      });
      setNewMitigationAction("");
    }
  };

  const removeMitigationAction = (index: number) => {
    setFormData({
      ...formData,
      mitigationActions: formData.mitigationActions.filter((_, i) => i !== index)
    });
  };

  const getRiskLevelColor = (level: RiskLevel) => {
    switch (level) {
      case 'Critical': return 'destructive';
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-risk-assessment">
          <DialogHeader>
            <DialogTitle>{assessment ? "Edit Risk Assessment" : "Create Risk Assessment"}</DialogTitle>
            <DialogDescription>
              {assessment ? "Update risk assessment details and mitigation actions" : "Record a new risk assessment for patient safety"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Patient *</Label>
                <Select 
                  value={formData.patientId} 
                  onValueChange={(value) => {
                    const patient = patients?.find(p => p.id === value);
                    setFormData({ 
                      ...formData, 
                      patientId: value,
                      patientName: patient ? `${patient.firstName} ${patient.lastName}` : ""
                    });
                  }}
                  disabled={!!patientId}
                >
                  <SelectTrigger data-testid="select-patient">
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.firstName} {p.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="riskType">Risk Type *</Label>
                <Select value={formData.riskType} onValueChange={(value: RiskAssessment['riskType']) => setFormData({ ...formData, riskType: value })}>
                  <SelectTrigger data-testid="select-risk-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Falls">Falls</SelectItem>
                    <SelectItem value="Medication">Medication</SelectItem>
                    <SelectItem value="Mobility">Mobility</SelectItem>
                    <SelectItem value="Safeguarding">Safeguarding</SelectItem>
                    <SelectItem value="Nutrition">Nutrition</SelectItem>
                    <SelectItem value="Skin Integrity">Skin Integrity</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="riskLevel">Risk Level *</Label>
                <Select value={formData.riskLevel} onValueChange={(value: RiskLevel) => setFormData({ ...formData, riskLevel: value })}>
                  <SelectTrigger data-testid="select-risk-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                {formData.riskLevel && (
                  <Badge variant={getRiskLevelColor(formData.riskLevel)}>{formData.riskLevel}</Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value: RiskStatus) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Identified">Identified</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Mitigated">Mitigated</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Risk Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the risk in detail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                data-testid="textarea-description"
              />
            </div>

            <div className="space-y-2">
              <Label>Mitigation Actions</Label>
              <div className="space-y-2">
                {formData.mitigationActions.map((action, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={action} readOnly className="flex-1" data-testid={`input-mitigation-${index}`} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMitigationAction(index)}
                      data-testid={`button-remove-mitigation-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add mitigation action..."
                    value={newMitigationAction}
                    onChange={(e) => setNewMitigationAction(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMitigationAction())}
                    data-testid="input-new-mitigation"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addMitigationAction}
                    data-testid="button-add-mitigation"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="identifiedDate">Identified Date *</Label>
                <Input
                  id="identifiedDate"
                  type="date"
                  value={formData.identifiedDate}
                  onChange={(e) => setFormData({ ...formData, identifiedDate: e.target.value })}
                  data-testid="input-identified-date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastReviewDate">Last Review Date *</Label>
                <Input
                  id="lastReviewDate"
                  type="date"
                  value={formData.lastReviewDate}
                  onChange={(e) => setFormData({ ...formData, lastReviewDate: e.target.value })}
                  data-testid="input-last-review-date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextReviewDate">Next Review Date *</Label>
                <Input
                  id="nextReviewDate"
                  type="date"
                  value={formData.nextReviewDate}
                  onChange={(e) => setFormData({ ...formData, nextReviewDate: e.target.value })}
                  data-testid="input-next-review-date"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assessedBy">Assessed By *</Label>
                <Select value={formData.assessedBy} onValueChange={(value) => setFormData({ ...formData, assessedBy: value })}>
                  <SelectTrigger data-testid="select-assessed-by">
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff?.map((s) => (
                      <SelectItem key={s.id} value={`${s.firstName} ${s.lastName}`}>
                        {s.firstName} {s.lastName} - {s.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewedBy">Reviewed By</Label>
                <Select value={formData.reviewedBy || "none"} onValueChange={(value) => setFormData({ ...formData, reviewedBy: value === "none" ? "" : value })}>
                  <SelectTrigger data-testid="select-reviewed-by">
                    <SelectValue placeholder="Select staff member (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {staff?.map((s) => (
                      <SelectItem key={s.id} value={`${s.firstName} ${s.lastName}`}>
                        {s.firstName} {s.lastName} - {s.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes or observations..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                data-testid="textarea-notes"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between gap-2">
            {assessment && (
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
                {assessment ? "Update" : "Create"} Assessment
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Risk Assessment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this risk assessment? This action cannot be undone.
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
