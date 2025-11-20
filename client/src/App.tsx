import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/Patients";
import NewPatient from "@/pages/NewPatient";
import PatientProfile from "@/pages/PatientProfile";
import PatientCarePlan from "@/pages/PatientCarePlan";
import CarePlansManagement from "@/pages/CarePlansManagement";
import CarePlanTemplateForm from "@/pages/CarePlanTemplateForm";
import Tasks from "@/pages/Tasks";
import StaffList from "@/pages/StaffList";
import StaffDetails from "@/pages/StaffDetails";
import Rota from "@/pages/Rota";
import CQCCompliance from "@/pages/CQCCompliance";
import NotFound from "@/pages/not-found";

function ProtectedRoutes() {
  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b border-border bg-background sticky top-0 z-50">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Switch>
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/patients" component={Patients} />
              <Route path="/patients/new" component={NewPatient} />
              <Route path="/patient/:id/careplan" component={PatientCarePlan} />
              <Route path="/patient/:id" component={PatientProfile} />
              <Route path="/care-plans/new-template" component={CarePlanTemplateForm} />
              <Route path="/care-plans/edit-template/:id" component={CarePlanTemplateForm} />
              <Route path="/care-plans" component={CarePlansManagement} />
              <Route path="/tasks" component={Tasks} />
              <Route path="/rota" component={Rota} />
              <Route path="/staff/:id" component={StaffDetails} />
              <Route path="/staff" component={StaffList} />
              <Route path="/cqc-compliance" component={CQCCompliance} />
              <Route path="/reports">
                <div className="flex items-center justify-center h-96">
                  <p className="text-muted-foreground">Reports - Coming Soon</p>
                </div>
              </Route>
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={ProtectedRoutes} />
      <Route path="/patients" component={ProtectedRoutes} />
      <Route path="/patients/new" component={ProtectedRoutes} />
      <Route path="/patient/:id/careplan" component={ProtectedRoutes} />
      <Route path="/patient/:id" component={ProtectedRoutes} />
      <Route path="/care-plans/new-template" component={ProtectedRoutes} />
      <Route path="/care-plans/edit-template/:id" component={ProtectedRoutes} />
      <Route path="/care-plans" component={ProtectedRoutes} />
      <Route path="/tasks" component={ProtectedRoutes} />
      <Route path="/rota" component={ProtectedRoutes} />
      <Route path="/staff/:id" component={ProtectedRoutes} />
      <Route path="/staff" component={ProtectedRoutes} />
      <Route path="/cqc-compliance" component={ProtectedRoutes} />
      <Route path="/reports" component={ProtectedRoutes} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
