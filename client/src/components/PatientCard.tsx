import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Calendar } from "lucide-react";
import type { Patient } from "@/lib/db";
import { Link } from "wouter";

interface PatientCardProps {
  patient: Patient;
}

export function PatientCard({ patient }: PatientCardProps) {
  const initials = `${patient.firstName[0]}${patient.lastName[0]}`;
  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();

  return (
    <Card className="hover-elevate" data-testid={`card-patient-${patient.id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <Link href={`/patient/${patient.id}`}>
              <h3 className="font-semibold hover:text-primary cursor-pointer" data-testid="text-patient-name">
                {patient.firstName} {patient.lastName}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground">
              {age} years • {patient.gender}
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              {patient.medicalRecordNumber}
            </p>
          </div>
        </div>
        <StatusBadge status={patient.status} />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{patient.phoneNumber}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{patient.email}</span>
        </div>
        <div className="flex gap-2 pt-2">
          <Link href={`/patient/${patient.id}`}>
            <Button variant="outline" size="sm" className="flex-1" data-testid="button-view-profile">
              View Profile
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="flex-1" data-testid="button-schedule">
            <Calendar className="h-4 w-4 mr-1" />
            Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
