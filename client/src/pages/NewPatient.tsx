import { useState } from "react";
import { useLocation } from "wouter";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Step = 1 | 2;

export default function NewPatient() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>(1);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    email: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    insuranceProvider: "",
    policyNumber: "",
    status: "Active" as const,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSave = async () => {
    try {
      const medicalRecordNumber = `MRN-2024-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
      await db.patients.add({
        id: crypto.randomUUID(),
        ...formData,
        medicalRecordNumber,
      });

      toast({
        title: "Patient Added",
        description: `${formData.firstName} ${formData.lastName} has been successfully added.`,
      });

      setLocation("/patients");
    } catch (error) {
      console.error('Error adding patient:', error);
      toast({
        title: "Error",
        description: "Failed to add patient. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isStep1Valid = formData.firstName && formData.lastName && formData.dateOfBirth && formData.gender;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Button
          variant="ghost"
          onClick={() => setLocation("/patients")}
          className="mb-4"
          data-testid="button-back-to-patients"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Patients
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New Patient Onboarding</h1>
        <p className="text-muted-foreground mt-1">
          Add a new patient to the system
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-6">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 1 ? 'bg-primary text-primary-foreground' : 'bg-status-done text-status-done-foreground'}`}>
          1
        </div>
        <div className={`h-0.5 w-24 ${currentStep === 2 ? 'bg-primary' : 'bg-border'}`} />
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 2 ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground'}`}>
          2
        </div>
      </div>

      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Patient Information</CardTitle>
            <CardDescription>Enter basic patient demographics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  data-testid="input-first-name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  data-testid="input-last-name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  data-testid="input-date-of-birth"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger id="gender" data-testid="select-gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  data-testid="input-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  data-testid="input-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                data-testid="input-address"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Emergency Contact & Insurance</CardTitle>
            <CardDescription>Additional patient information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  data-testid="input-emergency-contact"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  data-testid="input-emergency-phone"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                <Input
                  id="insuranceProvider"
                  value={formData.insuranceProvider}
                  onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                  data-testid="input-insurance-provider"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="policyNumber">Policy Number</Label>
                <Input
                  id="policyNumber"
                  value={formData.policyNumber}
                  onChange={(e) => handleInputChange('policyNumber', e.target.value)}
                  data-testid="input-policy-number"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between gap-3">
        {currentStep === 2 && (
          <Button variant="outline" onClick={handleBack} data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        <div className="flex-1" />
        <Button
          variant="outline"
          onClick={() => setLocation("/patients")}
          data-testid="button-cancel"
        >
          Cancel
        </Button>
        {currentStep === 1 ? (
          <Button onClick={handleNext} disabled={!isStep1Valid} data-testid="button-next">
            Next: Medical History
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSave} data-testid="button-save-patient">
            Save Patient
          </Button>
        )}
      </div>
    </div>
  );
}
