import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { db, type StaffRole, type StaffStatus } from "@/lib/db";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { nanoid } from "nanoid";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const step1Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  role: z.enum(["Doctor", "Nurse", "Caregiver"]),
});

const step2Schema = z.object({
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
  department: z.string().optional(),
  hireDate: z.string().min(1, "Hire date is required"),
  status: z.enum(["Active", "Inactive", "On Leave"]),
});

const step3Schema = z.object({
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  certifications: z.string().optional(),
  notes: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

interface StaffOnboardingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function StaffOnboardingWizard({ open, onOpenChange, onComplete }: StaffOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      role: "Nurse",
    },
  });

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      specialization: "",
      licenseNumber: "",
      department: "",
      hireDate: new Date().toISOString().split('T')[0],
      status: "Active",
    },
  });

  const form3 = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      address: "",
      emergencyContact: "",
      emergencyPhone: "",
      certifications: "",
      notes: "",
    },
  });

  const handleNext = async () => {
    let isValid = false;
    
    if (currentStep === 1) {
      isValid = await form1.trigger();
    } else if (currentStep === 2) {
      isValid = await form2.trigger();
    }

    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleComplete = async () => {
    const isValid = await form3.trigger();
    
    if (isValid) {
      try {
        const step1Data = form1.getValues();
        const step2Data = form2.getValues();
        const step3Data = form3.getValues();

        const certifications = step3Data.certifications
          ? step3Data.certifications.split(',').map(c => c.trim()).filter(c => c)
          : undefined;

        await db.staff.add({
          id: nanoid(),
          ...step1Data,
          ...step2Data,
          ...step3Data,
          certifications,
        });

        toast({
          title: "Staff member added",
          description: `${step1Data.firstName} ${step1Data.lastName} has been successfully onboarded.`,
        });

        form1.reset();
        form2.reset();
        form3.reset();
        setCurrentStep(1);
        onOpenChange(false);
        onComplete?.();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add staff member",
          variant: "destructive",
        });
      }
    }
  };

  const steps = [
    { number: 1, title: "Basic Information", completed: currentStep > 1 },
    { number: 2, title: "Professional Details", completed: currentStep > 2 },
    { number: 3, title: "Additional Information", completed: currentStep > 3 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl" data-testid="dialog-staff-onboarding">
        <DialogHeader>
          <DialogTitle>Staff Onboarding Wizard</DialogTitle>
          <DialogDescription>
            Complete the following steps to add a new staff member
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step.completed 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : currentStep === step.number
                    ? 'border-primary text-primary'
                    : 'border-muted-foreground text-muted-foreground'
                }`}>
                  {step.completed ? <Check className="h-5 w-5" /> : step.number}
                </div>
                <div className="text-xs mt-2 text-center">
                  <div className={currentStep === step.number ? 'font-semibold' : 'text-muted-foreground'}>
                    {step.title}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 ${step.completed ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        {currentStep === 1 && (
          <Form {...form1}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form1.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} data-testid="input-firstname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form1.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} data-testid="input-lastname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form1.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.doe@example.com" {...field} data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form1.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="555-1234" {...field} data-testid="input-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form1.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-role">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Doctor">Doctor</SelectItem>
                        <SelectItem value="Nurse">Nurse</SelectItem>
                        <SelectItem value="Caregiver">Caregiver</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
        )}

        {currentStep === 2 && (
          <Form {...form2}>
            <div className="space-y-4">
              <FormField
                control={form2.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialization (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Cardiology, Pediatrics" {...field} data-testid="input-specialization" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form2.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="LIC-12345" {...field} data-testid="input-license" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form2.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Emergency, ICU" {...field} data-testid="input-department" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form2.control}
                  name="hireDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hire Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-hiredate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form2.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="On Leave">On Leave</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Form>
        )}

        {currentStep === 3 && (
          <Form {...form3}>
            <div className="space-y-4">
              <FormField
                control={form3.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, City, State" {...field} data-testid="input-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form3.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} data-testid="input-emergency-contact" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form3.control}
                  name="emergencyPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="555-5678" {...field} data-testid="input-emergency-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form3.control}
                name="certifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certifications (Optional, comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="BLS, ACLS, PALS" {...field} data-testid="input-certifications" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form3.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional information..."
                        {...field}
                        data-testid="input-notes"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
        )}

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            data-testid="button-back"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {currentStep < 3 ? (
            <Button onClick={handleNext} data-testid="button-next">
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} data-testid="button-complete">
              <Check className="h-4 w-4 mr-2" />
              Complete Onboarding
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
