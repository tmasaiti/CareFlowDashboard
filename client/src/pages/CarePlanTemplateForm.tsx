import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type CarePlanTemplate } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function CarePlanTemplateForm() {
  const [, setLocation] = useLocation();
  const [matchEdit, paramsEdit] = useRoute("/care-plans/edit-template/:id");
  const templateId = paramsEdit?.id;
  const { toast } = useToast();

  const existingTemplate = useLiveQuery(
    () => templateId ? db.carePlanTemplates.get(templateId) : undefined,
    [templateId]
  );

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as CarePlanTemplate['category'] | "",
    ageRange: "",
    healthConditions: [] as string[],
    targetNeeds: [] as string[],
    impairmentTypes: [] as string[],
    goals: [] as string[],
    interventions: [] as string[],
  });

  const [newHealthCondition, setNewHealthCondition] = useState("");
  const [newImpairment, setNewImpairment] = useState("");
  const [newNeed, setNewNeed] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [newIntervention, setNewIntervention] = useState("");

  useEffect(() => {
    if (existingTemplate) {
      setFormData({
        title: existingTemplate.title,
        description: existingTemplate.description,
        category: existingTemplate.category,
        ageRange: existingTemplate.ageRange || "",
        healthConditions: existingTemplate.healthConditions || [],
        targetNeeds: existingTemplate.targetNeeds || [],
        impairmentTypes: existingTemplate.impairmentTypes || [],
        goals: existingTemplate.goals,
        interventions: existingTemplate.interventions,
      });
    }
  }, [existingTemplate]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = (field: 'healthConditions' | 'targetNeeds' | 'impairmentTypes' | 'goals' | 'interventions', value: string) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()],
    }));
  };

  const removeItem = (field: 'healthConditions' | 'targetNeeds' | 'impairmentTypes' | 'goals' | 'interventions', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.category || formData.goals.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const now = new Date().toISOString();
      const templateData: CarePlanTemplate = {
        id: templateId || crypto.randomUUID(),
        title: formData.title,
        description: formData.description,
        category: formData.category as CarePlanTemplate['category'],
        ageRange: formData.ageRange || undefined,
        healthConditions: formData.healthConditions.length > 0 ? formData.healthConditions : undefined,
        targetNeeds: formData.targetNeeds.length > 0 ? formData.targetNeeds : undefined,
        impairmentTypes: formData.impairmentTypes.length > 0 ? formData.impairmentTypes : undefined,
        goals: formData.goals,
        interventions: formData.interventions,
        createdDate: existingTemplate?.createdDate || now,
        lastModified: now,
      };

      if (templateId) {
        await db.carePlanTemplates.put(templateData);
        toast({
          title: "Template Updated",
          description: "Care plan template has been successfully updated.",
        });
      } else {
        await db.carePlanTemplates.add(templateData);
        toast({
          title: "Template Created",
          description: "Care plan template has been successfully created.",
        });
      }

      setLocation("/care-plans");
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Button
          variant="ghost"
          onClick={() => setLocation("/care-plans")}
          className="mb-4"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Templates
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {templateId ? 'Edit Template' : 'New Care Plan Template'}
        </h1>
        <p className="text-muted-foreground mt-1">
          Create a reusable care plan template
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Information</CardTitle>
          <CardDescription>Basic details about the care plan template</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              data-testid="input-title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              data-testid="input-description"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger id="category" data-testid="select-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Age-Based">Age-Based</SelectItem>
                <SelectItem value="Health Condition">Health Condition</SelectItem>
                <SelectItem value="Needs-Based">Needs-Based</SelectItem>
                <SelectItem value="Impairment">Impairment</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.category === 'Age-Based' && (
            <div className="space-y-2">
              <Label htmlFor="ageRange">Age Range</Label>
              <Input
                id="ageRange"
                placeholder="e.g., 65+, 18-45"
                value={formData.ageRange}
                onChange={(e) => handleInputChange('ageRange', e.target.value)}
                data-testid="input-age-range"
              />
            </div>
          )}

          {formData.category === 'Health Condition' && (
            <div className="space-y-2">
              <Label>Health Conditions</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add health condition"
                  value={newHealthCondition}
                  onChange={(e) => setNewHealthCondition(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem('healthConditions', newHealthCondition);
                      setNewHealthCondition('');
                    }
                  }}
                  data-testid="input-health-condition"
                />
                <Button
                  type="button"
                  onClick={() => {
                    addItem('healthConditions', newHealthCondition);
                    setNewHealthCondition('');
                  }}
                  data-testid="button-add-condition"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.healthConditions.map((condition, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {condition}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeItem('healthConditions', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {formData.category === 'Impairment' && (
            <div className="space-y-2">
              <Label>Impairment Types</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add impairment type"
                  value={newImpairment}
                  onChange={(e) => setNewImpairment(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem('impairmentTypes', newImpairment);
                      setNewImpairment('');
                    }
                  }}
                  data-testid="input-impairment"
                />
                <Button
                  type="button"
                  onClick={() => {
                    addItem('impairmentTypes', newImpairment);
                    setNewImpairment('');
                  }}
                  data-testid="button-add-impairment"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.impairmentTypes.map((type, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {type}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeItem('impairmentTypes', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {formData.category === 'Needs-Based' && (
            <div className="space-y-2">
              <Label>Target Needs</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add target need"
                  value={newNeed}
                  onChange={(e) => setNewNeed(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem('targetNeeds', newNeed);
                      setNewNeed('');
                    }
                  }}
                  data-testid="input-need"
                />
                <Button
                  type="button"
                  onClick={() => {
                    addItem('targetNeeds', newNeed);
                    setNewNeed('');
                  }}
                  data-testid="button-add-need"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.targetNeeds.map((need, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {need}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeItem('targetNeeds', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Goals *</CardTitle>
          <CardDescription>Define the objectives of this care plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
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
              data-testid="input-goal"
            />
            <Button
              type="button"
              onClick={() => {
                addItem('goals', newGoal);
                setNewGoal('');
              }}
              data-testid="button-add-goal"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {formData.goals.length > 0 && (
            <ul className="space-y-2">
              {formData.goals.map((goal, index) => (
                <li key={index} className="flex items-start gap-2 p-2 bg-muted rounded-lg">
                  <span className="flex-1 text-sm">{goal}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeItem('goals', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interventions</CardTitle>
          <CardDescription>Define the actions and treatments for this care plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
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
              data-testid="input-intervention"
            />
            <Button
              type="button"
              onClick={() => {
                addItem('interventions', newIntervention);
                setNewIntervention('');
              }}
              data-testid="button-add-intervention"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {formData.interventions.length > 0 && (
            <ul className="space-y-2">
              {formData.interventions.map((intervention, index) => (
                <li key={index} className="flex items-start gap-2 p-2 bg-muted rounded-lg">
                  <span className="flex-1 text-sm">{intervention}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeItem('interventions', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => setLocation("/care-plans")}
          data-testid="button-cancel"
        >
          Cancel
        </Button>
        <Button onClick={handleSave} data-testid="button-save">
          {templateId ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </div>
  );
}
