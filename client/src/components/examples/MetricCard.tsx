import { MetricCard } from '../MetricCard';
import { Users, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

export default function MetricCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      <MetricCard
        title="Total Patients"
        value={248}
        icon={Users}
        trend={{ value: "+12% from last month", isPositive: true }}
      />
      <MetricCard
        title="Appointments Today"
        value={18}
        icon={Calendar}
      />
      <MetricCard
        title="Critical Alerts"
        value={3}
        icon={AlertCircle}
        trend={{ value: "-2 from yesterday", isPositive: true }}
      />
      <MetricCard
        title="Completed Tasks"
        value={45}
        icon={CheckCircle}
        trend={{ value: "+8% this week", isPositive: true }}
      />
    </div>
  );
}
