import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
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

export default function CarePlansManagement() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const templates = useLiveQuery(() => db.carePlanTemplates.toArray()) || [];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleDelete = async () => {
    if (!templateToDelete) return;

    try {
      await db.carePlanTemplates.delete(templateToDelete);
      toast({
        title: "Template Deleted",
        description: "Care plan template has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (id: string) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const categoryColors: Record<string, string> = {
    'Age-Based': 'bg-chart-1/15 text-chart-1',
    'Health Condition': 'bg-status-critical/15 text-status-critical',
    'Needs-Based': 'bg-chart-2/15 text-chart-2',
    'Impairment': 'bg-status-onhold/15 text-status-onhold',
    'General': 'bg-muted text-muted-foreground',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Care Plan Templates</h1>
          <p className="text-muted-foreground mt-1">
            Manage reusable care plan templates
          </p>
        </div>
        <Button onClick={() => setLocation("/care-plans/new-template")} data-testid="button-new-template">
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-templates"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-category-filter">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Age-Based">Age-Based</SelectItem>
            <SelectItem value="Health Condition">Health Condition</SelectItem>
            <SelectItem value="Needs-Based">Needs-Based</SelectItem>
            <SelectItem value="Impairment">Impairment</SelectItem>
            <SelectItem value="General">General</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No templates found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover-elevate" data-testid={`card-template-${template.id}`}>
              <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={categoryColors[template.category] || categoryColors.General}>
                      {template.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <CardDescription className="mt-1">{template.description}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setLocation(`/care-plans/edit-template/${template.id}`)}
                    data-testid={`button-edit-${template.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => confirmDelete(template.id)}
                    data-testid={`button-delete-${template.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {template.ageRange && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Age Range</p>
                    <p className="text-sm">{template.ageRange}</p>
                  </div>
                )}
                {template.healthConditions && template.healthConditions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Health Conditions</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.healthConditions.map((condition, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {template.impairmentTypes && template.impairmentTypes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Impairment Types</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.impairmentTypes.map((type, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Goals ({template.goals.length})</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {template.goals.slice(0, 2).join(', ')}
                    {template.goals.length > 2 && '...'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Interventions ({template.interventions.length})</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {template.interventions.slice(0, 2).join(', ')}
                    {template.interventions.length > 2 && '...'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this care plan template? This action cannot be undone.
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
