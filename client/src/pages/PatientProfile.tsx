import { useLiveQuery } from "dexie-react-hooks";
import { useRoute, Link } from "wouter";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, Phone, Mail, MapPin, User, Calendar, Plus, Edit } from "lucide-react";
import { format } from "date-fns";

export default function PatientProfile() {
  const [match, params] = useRoute("/patient/:id");
  const patientId = params?.id;

  const patient = useLiveQuery(
    () => patientId ? db.patients.get(patientId) : undefined,
    [patientId]
  );

  const medicalHistory = useLiveQuery(
    () => patientId ? db.medicalHistory.where('patientId').equals(patientId).toArray() : [],
    [patientId]
  );

  const carePlans = useLiveQuery(
    () => patientId ? db.carePlans.where('patientId').equals(patientId).toArray() : [],
    [patientId]
  );

  const communications = useLiveQuery(
    () => patientId ? db.communications.where('patientId').equals(patientId).toArray() : [],
    [patientId]
  );

  if (!match || !patient) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Patient not found</p>
      </div>
    );
  }

  const initials = `${patient.firstName[0]}${patient.lastName[0]}`;
  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/patients">
          <Button variant="ghost" className="mb-4" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
        </Link>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-muted-foreground mt-1">
                {age} years • {patient.gender}
              </p>
              <p className="text-sm text-muted-foreground font-mono mt-1">
                {patient.medicalRecordNumber}
              </p>
            </div>
          </div>
          <StatusBadge status={patient.status} />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="medical" data-testid="tab-medical">Medical History</TabsTrigger>
          <TabsTrigger value="careplan" data-testid="tab-careplan">Care Plan</TabsTrigger>
          <TabsTrigger value="communications" data-testid="tab-communications">Notes/Communications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.phoneNumber || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.email || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.address || 'Not provided'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.emergencyContact || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.emergencyPhone || 'Not provided'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Insurance Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Provider</p>
                  <p className="font-medium">{patient.insuranceProvider || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Policy Number</p>
                  <p className="font-medium font-mono">{patient.policyNumber || 'Not provided'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Demographics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{format(new Date(patient.dateOfBirth), 'MMMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{patient.gender}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Medical History</h3>
            <Button data-testid="button-add-medical-entry">
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          </div>

          {medicalHistory && medicalHistory.length > 0 ? (
            <div className="space-y-3">
              {medicalHistory.map((entry) => (
                <Card key={entry.id} className="hover-elevate">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <StatusBadge status={entry.status === 'Active' ? 'Active' : 'done'} />
                          <span className="text-xs text-muted-foreground uppercase font-semibold">
                            {entry.type}
                          </span>
                        </div>
                        <h4 className="font-semibold">{entry.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{entry.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(entry.date), 'MMMM d, yyyy')}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" data-testid={`button-edit-${entry.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No medical history entries</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="careplan" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Care Plans</h3>
            <Link href={`/patient/${patientId}/careplan`}>
              <Button data-testid="button-manage-care-plans">
                Manage Care Plans
              </Button>
            </Link>
          </div>

          {carePlans && carePlans.length > 0 ? (
            carePlans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                  <div>
                    <CardTitle>{plan.title}</CardTitle>
                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                  </div>
                  <StatusBadge status={plan.status} />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Goals</h4>
                    <ul className="space-y-2">
                      {plan.goals.map((goal, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-1">•</span>
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Interventions</h4>
                    <ul className="space-y-2">
                      {plan.interventions.map((intervention, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-1">•</span>
                          <span>{intervention}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Started: {format(new Date(plan.startDate), 'MMM d, yyyy')}</span>
                    </div>
                    {plan.endDate && (
                      <div className="flex items-center gap-2">
                        <span>Ends: {format(new Date(plan.endDate), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No care plans</p>
                <Link href={`/patient/${patientId}/careplan`}>
                  <Button data-testid="button-create-first-careplan">
                    Create First Care Plan
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="communications" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Communications Log</h3>
            <Button data-testid="button-add-communication">
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          </div>

          {communications && communications.length > 0 ? (
            <div className="space-y-3">
              {communications.map((comm) => (
                <Card key={comm.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-base">{comm.subject}</CardTitle>
                        <CardDescription className="mt-1">
                          {comm.type} • {comm.author} • {format(new Date(comm.date), 'MMM d, yyyy h:mm a')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{comm.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No communications</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
