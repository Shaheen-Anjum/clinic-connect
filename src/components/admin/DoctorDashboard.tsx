import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, UserCheck, UserX, Sun, Moon, TrendingUp } from 'lucide-react';

interface DailyStats {
  total_bookings: number;
  patients_consulted: number;
  patients_no_show: number;
  morning_bookings: number;
  evening_bookings: number;
}

export function DoctorDashboard() {
  const [stats, setStats] = useState<DailyStats>({
    total_bookings: 0,
    patients_consulted: 0,
    patients_no_show: 0,
    morning_bookings: 0,
    evening_bookings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    setupRealtimeSubscription();
  }, []);

  const fetchStats = async () => {
    const today = new Date().toISOString().split('T')[0];

    // Fetch bookings for today
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_date', today);

    if (bookings) {
      const total = bookings.length;
      const consulted = bookings.filter(b => b.status === 'consulted').length;
      const noShow = bookings.filter(b => b.status === 'no_show').length;
      const morning = bookings.filter(b => b.slot_type === 'morning').length;
      const evening = bookings.filter(b => b.slot_type === 'evening').length;

      setStats({
        total_bookings: total,
        patients_consulted: consulted,
        patients_no_show: noShow,
        morning_bookings: morning,
        evening_bookings: evening,
      });
    }

    setIsLoading(false);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('stats-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats.total_bookings,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Patients Consulted',
      value: stats.patients_consulted,
      icon: UserCheck,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'No Shows',
      value: stats.patients_no_show,
      icon: UserX,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      title: 'Morning Bookings',
      value: stats.morning_bookings,
      icon: Sun,
      color: 'text-morning',
      bgColor: 'bg-morning/10',
    },
    {
      title: 'Evening Bookings',
      value: stats.evening_bookings,
      icon: Moon,
      color: 'text-evening',
      bgColor: 'bg-evening/10',
    },
  ];

  const waitingPatients = stats.total_bookings - stats.patients_consulted - stats.patients_no_show;
  const consultationRate = stats.total_bookings > 0 
    ? Math.round((stats.patients_consulted / stats.total_bookings) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <Card key={stat.title} variant="elevated" className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Card */}
      <Card variant="elevated" className="animate-fade-in stagger-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Today's Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">Waiting Patients</p>
              <p className="text-3xl font-bold text-primary">{waitingPatients}</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">Consultation Rate</p>
              <p className="text-3xl font-bold text-success">{consultationRate}%</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">Avg. Wait Time</p>
              <p className="text-3xl font-bold text-accent">~{waitingPatients * 10}min</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
