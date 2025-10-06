import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type CarePlan, type CarePlanTemplate } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, Plus, X, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export default function PatientCarePlan() {
  const [match, params] = useRoute("/patient/:id/careplan");
  const [, setLocation] = useLocation();
  const patientId = params?.id;
  const { toast } = useToast();

  const patient = useLiveQuery(
    () => patientId ? db.patients.get(patientId) : undefined,
    [patientId]
  );

  const carePlans = useLiveQuery(
    () => patientId ? db.carePlans.where('patientId').equals(patientId).toArray() : [],
    [patientId]
  );

  const templates = useLiveQuery(() => db.carePlanTemplates.toArray()) || [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CarePlan | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    templateId: "",
    title: "",
    description: "",
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: "",
    status: "pending" as CarePlan['status'],
    goals: [] as string[],
    interventions: [] as string[],
    notes: "",
  });

  const [newGoal, setNewGoal] = useState("");
  const [newIntervention, setNewIntervention] = useState("");

  useEffect(() => {
    if (editingPlan) {
      setFormData({
        templateId: editingPlan.templateId || "",
        title: editingPlan.title,
        description: editingPlan.description,
        startDate: editingPlan.startDate,
        endDate: editingPlan.endDate || "",
        status: editingPlan.status,
        goals: editingPlan.goals,
        interventions: editingPlan.interventions,
        notes: editingPlan.notes || "",
      });
    }
  }, [editingPlan]);

  const handleTemplateSelect = (templateId: string) => {
    if (templateId === "custom") {
      setFormData(prev => ({
        ...prev,
        templateId: "",
        title: "",
        description: "",
        goals: [],
        interventions: [],
      }));
    } else {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setFormData(prev => ({
          ...prev,
          templateId,
          title: template.title,
          description: template.description,
          goals: [...template.goals],
          interventions: [...template.interventions],
        }));
      }
    }
  };

  const addItem = (field: 'goals' | 'interventions', value: string) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()],
    }));
  };

  const removeItem = (field: 'goals' | 'interventions', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!formData.title || formData.goals.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please provide a title and at least one goal.",
        variant: "destructive",
      });
      return;
    }

    try {
      const carePlanData: CarePlan = {
        id: editingPlan?.id || crypto.randomUUID(),
        patientId: patientId!,
        templateId: formData.templateId || undefined,
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        status: formData.status,
        goals: formData.goals,
        interventions: formData.interventions,
        notes: formData.notes || undefined,
      };

      if (editingPlan) {
        await db.carePlans.put(carePlanData);
        toast({
          title: "Care Plan Updated",
          description: "Care plan has been successfully updated.",
        });
      } else {
        await db.carePlans.add(carePlanData);
        toast({
          title: "Care Plan Created",
          description: "Care plan has been successfully created.",
        });
      }

      setDialogOpen(false);
      setEditingPlan(null);
      resetForm();
    } catch (error) {
      console.error('Error saving care plan:', error);
      toast({
        title: "Error",
        description: "Failed to save care plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!planToDelete) return;

    try {
      await db.carePlans.delete(planToDelete);
      toast({
        title: "Care Plan Deleted",
        description: "Care plan has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    } catch (error) {
      console.error('Error deleting care plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete care plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      templateId: "custom",
      title: "",
      description: "",
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: "",
      status: "pending",
      goals: [],
      interventions: [],
      notes: "",
    });
    setNewGoal("");
    setNewIntervention("");
  };

  const openNewDialog = () => {
    resetForm();
    setEditingPlan(null);
    setDialogOpen(true);
  };

  const openEditDialog = (plan: CarePlan) => {
    setEditingPlan(plan);
    setDialogOpen(true);
  };

  const confirmDelete = (id: string) => {
    setPlanToDelete(id);
    setDeleteDialogOpen(true);
  };

  if (!match || !patient) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Patient not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/patient/${patientId}`}>
          <Button variant="ghost" className="mb-4" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patient Profile
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Care Plans - {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage patient-specific care plans
            </p>
          </div>
          <Button onClick={openNewDialog} data-testid="button-new-care-plan">
            <Plus className="h-4 w-4 mr-2" />
            New Care Plan
          </Button>
        </div>
      </div>

      {carePlans && carePlans.length > 0 ? (
        <div className="space-y-4">
          {carePlans.map((plan) => (
            <Card key={plan.id} className="hover-elevate" data-testid={`card-care-plan-${plan.id}`}>
              <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={plan.status} />
                    {plan.templateId && (
                      <Badge variant="outline" className="text-xs">From Template</Badge>
                    )}
                  </div>
                  <CardTitle>{plan.title}</CardTitle>
                  <CardDescription className="mt-1">{plan.description}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(plan)}
                    data-testid={`button-edit-${plan.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => confirmDelete(plan.id)}
                    data-testid={`button-delete-${plan.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                    <p className="text-sm">{format(new Date(plan.startDate), 'MMM d, yyyy')}</p>
                  </div>
                  {plan.endDate && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">End Date</p>
                      <p className="text-sm">{format(new Date(plan.endDate), 'MMM d, yyyy')}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Goals</h4>
                  <ul className="space-y-1">
                    {plan.goals.map((goal, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-1">•</span>
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.interventions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Interventions</h4>
                    <ul className="space-y-1">
                      {plan.interventions.map((intervention, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-1">•</span>
                          <span>{intervention}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {plan.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground">{plan.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No care plans for this patient</p>
            <Button onClick={openNewDialog} data-testid="button-create-first-plan">
              <Plus className="h-4 w-4 mr-2" />
              Create First Care Plan
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setEditingPlan(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Care Plan' : 'New Care Plan'}</DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Update the care plan details' : 'Create a new care plan for this patient'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!editingPlan && (
              <div className="space-y-2">
                <Label htmlFor="template">Start from Template (Optional)</Label>
                <Select value={formData.templateId} onValueChange={handleTemplateSelect}>
                  <SelectTrigger id="template" data-testid="select-template">
                    <SelectValue placeholder="Select a template or create custom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom Plan</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.title} ({template.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                data-testid="input-plan-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                data-testid="input-plan-description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  data-testid="input-start-date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  data-testid="input-end-date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger id="status" data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="onhold">On Hold</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Goals *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a goal"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem('goals', newGoal);
                      setNewGoal('');
                    }
                  }}
                  data-testid="input-plan-goal"
                />
                <Button
                  type="button"
                  onClick={() => {
                    addItem('goals', newGoal);
                    setNewGoal('');
                  }}
                  data-testid="button-add-plan-goal"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.goals.length > 0 && (
                <ul className="space-y-1 mt-2">
                  {formData.goals.map((goal, index) => (
                    <li key={index} className="flex items-start gap-2 p-2 bg-muted rounded text-sm">
                      <span className="flex-1">{goal}</span>
                      <X
                        className="h-4 w-4 cursor-pointer flex-shrink-0 mt-0.5"
                        onClick={() => removeItem('goals', index)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2">
              <Label>Interventions</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add an intervention"
                  value={newIntervention}
                  onChange={(e) => setNewIntervention(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem('interventions', newIntervention);
                      setNewIntervention('');
                    }
                  }}
                  data-testid="input-plan-intervention"
                />
                <Button
                  type="button"
                  onClick={() => {
                    addItem('interventions', newIntervention);
                    setNewIntervention('');
                  }}
                  data-testid="button-add-plan-intervention"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.interventions.length > 0 && (
                <ul className="space-y-1 mt-2">
                  {formData.interventions.map((intervention, index) => (
                    <li key={index} className="flex items-start gap-2 p-2 bg-muted rounded text-sm">
                      <span className="flex-1">{intervention}</span>
                      <X
                        className="h-4 w-4 cursor-pointer flex-shrink-0 mt-0.5"
                        onClick={() => removeItem('interventions', index)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                data-testid="input-plan-notes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} data-testid="button-save-plan">
              {editingPlan ? 'Update' : 'Create'} Care Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Care Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this care plan? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
