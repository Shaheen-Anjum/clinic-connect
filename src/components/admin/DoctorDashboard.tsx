import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { Users, UserCheck, UserX, Sun, Moon, TrendingUp, CalendarIcon, AlertCircle } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface DailyStats {
  total_bookings: number;
  patients_consulted: number;
  patients_no_show: number;
  morning_bookings: number;
  evening_bookings: number;
}

export function DoctorDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [stats, setStats] = useState<DailyStats>({
    total_bookings: 0,
    patients_consulted: 0,
    patients_no_show: 0,
    morning_bookings: 0,
    evening_bookings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [selectedDate]);

  useEffect(() => {
    // Only set up realtime subscription for today's data
    if (isToday(selectedDate)) {
      const cleanup = setupRealtimeSubscription();
      return cleanup;
    }
  }, [selectedDate]);

  const fetchStats = async () => {
    setIsLoading(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    // Fetch bookings for selected date
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_date', dateStr);

    if (bookings && bookings.length > 0) {
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
      setHasData(true);
    } else {
      setStats({
        total_bookings: 0,
        patients_consulted: 0,
        patients_no_show: 0,
        morning_bookings: 0,
        evening_bookings: 0,
      });
      setHasData(false);
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

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
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

  return (
    <div className="space-y-6">
      {/* Date Picker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">
            {isToday(selectedDate) ? "Today's Statistics" : `Statistics for ${format(selectedDate, 'MMMM d, yyyy')}`}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isToday(selectedDate) ? 'Live updates enabled' : 'Viewing historical data'}
          </p>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[240px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, 'PPP')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => date > new Date()}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !hasData ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Records Found</h3>
            <p className="text-muted-foreground max-w-sm">
              There are no booking records for {format(selectedDate, 'MMMM d, yyyy')}. 
              {!isToday(selectedDate) && ' Try selecting a different date or check today\'s statistics.'}
            </p>
            {!isToday(selectedDate) && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSelectedDate(new Date())}
              >
                View Today's Stats
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
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
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {isToday(selectedDate) ? "Today's Summary" : 'Daily Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {isToday(selectedDate) ? 'Waiting Patients' : 'Were Waiting'}
                  </p>
                  <p className="text-2xl font-bold text-amber-600">{waitingPatients}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Consultation Rate</p>
                  <p className="text-2xl font-bold text-success">{consultationRate}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Morning vs Evening</p>
                  <p className="text-2xl font-bold">
                    <span className="text-morning">{stats.morning_bookings}</span>
                    <span className="text-muted-foreground mx-2">/</span>
                    <span className="text-evening">{stats.evening_bookings}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
