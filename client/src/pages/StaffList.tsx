import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "wouter";
import { db, type Staff, type StaffRole, type StaffStatus } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StaffOnboardingWizard } from "@/components/StaffOnboardingWizard";
import { UserPlus, Search, Mail, Phone, Building, Award } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function StaffList() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<StaffRole | "All">("All");
  const [statusFilter, setStatusFilter] = useState<StaffStatus | "All">("All");

  const allStaff = useLiveQuery(() => db.staff.toArray());

  const filteredStaff = allStaff?.filter((staff) => {
    const matchesSearch = 
      staff.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "All" || staff.role === roleFilter;
    const matchesStatus = statusFilter === "All" || staff.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadgeVariant = (status: StaffStatus) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Inactive': return 'secondary';
      case 'On Leave': return 'outline';
      default: return 'secondary';
    }
  };

  const getRoleBadgeColor = (role: StaffRole) => {
    switch (role) {
      case 'Doctor': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'Nurse': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'Caregiver': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const stats = {
    total: allStaff?.length || 0,
    doctors: allStaff?.filter(s => s.role === 'Doctor').length || 0,
    nurses: allStaff?.filter(s => s.role === 'Nurse').length || 0,
    caregivers: allStaff?.filter(s => s.role === 'Caregiver').length || 0,
    active: allStaff?.filter(s => s.status === 'Active').length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-staff">Staff Management</h1>
          <p className="text-muted-foreground mt-1">Manage doctors, nurses, and caregivers</p>
        </div>
        <Button onClick={() => setIsWizardOpen(true)} data-testid="button-add-staff">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold" data-testid="count-total">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Staff</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="count-doctors">{stats.doctors}</div>
            <div className="text-sm text-muted-foreground">Doctors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="count-nurses">{stats.nurses}</div>
            <div className="text-sm text-muted-foreground">Nurses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400" data-testid="count-caregivers">{stats.caregivers}</div>
            <div className="text-sm text-muted-foreground">Caregivers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary" data-testid="count-active">{stats.active}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as StaffRole | "All")}>
          <SelectTrigger className="w-full md:w-48" data-testid="select-role-filter">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Roles</SelectItem>
            <SelectItem value="Doctor">Doctor</SelectItem>
            <SelectItem value="Nurse">Nurse</SelectItem>
            <SelectItem value="Caregiver">Caregiver</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StaffStatus | "All")}>
          <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="On Leave">On Leave</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredStaff && filteredStaff.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((staff) => {
            const initials = `${staff.firstName[0]}${staff.lastName[0]}`;
            return (
              <Link key={staff.id} href={`/staff/${staff.id}`}>
                <Card className="hover-elevate h-full" data-testid={`card-staff-${staff.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarFallback className={getRoleBadgeColor(staff.role)}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-lg truncate" data-testid={`text-name-${staff.id}`}>
                              {staff.firstName} {staff.lastName}
                            </h3>
                          </div>
                          <Badge variant={getStatusBadgeVariant(staff.status)} data-testid={`badge-status-${staff.id}`}>
                            {staff.status}
                          </Badge>
                        </div>
                        
                        <Badge className={`${getRoleBadgeColor(staff.role)} mb-3`} data-testid={`badge-role-${staff.id}`}>
                          {staff.role}
                        </Badge>

                        {staff.specialization && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Award className="h-4 w-4" />
                            <span className="truncate">{staff.specialization}</span>
                          </div>
                        )}

                        {staff.department && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Building className="h-4 w-4" />
                            <span className="truncate">{staff.department}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{staff.email}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{staff.phoneNumber}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4" data-testid="text-no-staff">
              {searchQuery || roleFilter !== "All" || statusFilter !== "All" 
                ? "No staff members match your filters" 
                : "No staff members added yet"}
            </p>
            {!searchQuery && roleFilter === "All" && statusFilter === "All" && (
              <Button onClick={() => setIsWizardOpen(true)} data-testid="button-add-first-staff">
                <UserPlus className="h-4 w-4 mr-2" />
                Add First Staff Member
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <StaffOnboardingWizard 
        open={isWizardOpen} 
        onOpenChange={setIsWizardOpen}
        onComplete={() => {
          // List will auto-update via Dexie live query
        }}
      />
    </div>
  );
}
