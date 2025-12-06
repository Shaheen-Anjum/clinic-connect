import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Sun, Moon, CheckCircle2, Clock, Phone, User, XCircle, UserX } from 'lucide-react';

interface Booking {
  id: string;
  patient_name: string;
  phone: string;
  queue_number: number;
  status: string;
  created_at: string;
}

interface QueueManagementProps {
  slotType: 'morning' | 'evening';
}

export function QueueManagement({ slotType }: QueueManagementProps) {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<{ 
    morning_clinic_name: string; 
    evening_clinic_name: string;
    minutes_per_patient: number;
    morning_start_time: string;
    evening_start_time: string;
  } | null>(null);

  useEffect(() => {
    fetchData();
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }, [slotType]);

  const fetchData = async () => {
    const today = new Date().toISOString().split('T')[0];

    // Fetch settings
    const { data: settingsData } = await supabase
      .from('clinic_settings')
      .select('morning_clinic_name, evening_clinic_name, minutes_per_patient, morning_start_time, evening_start_time')
      .single();

    if (settingsData) {
      setSettings(settingsData);
    }

    // Fetch bookings
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_date', today)
      .eq('slot_type', slotType)
      .order('queue_number', { ascending: true });

    if (error) {
      console.error('Error fetching bookings:', error);
    } else {
      setBookings(data || []);
    }
    setIsLoading(false);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`queue-${slotType}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getEstimatedTime = (queueNumber: number): Date => {
    if (!settings) return new Date();
    
    const startTime = slotType === 'morning' 
      ? settings.morning_start_time 
      : settings.evening_start_time;
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const waitingBefore = bookings.filter(
      b => b.status === 'waiting' && b.queue_number < queueNumber
    ).length;

    const estimatedTime = new Date();
    estimatedTime.setHours(startHour, startMin, 0, 0);
    estimatedTime.setMinutes(estimatedTime.getMinutes() + (waitingBefore * settings.minutes_per_patient));
    
    return estimatedTime;
  };

  const markAsConsulted = async (bookingId: string, patientName: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'consulted', consulted_at: new Date().toISOString() })
      .eq('id', bookingId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Patient Consulted",
        description: `${patientName} has been marked as consulted.`,
      });
    }
  };

  const markAsNoShow = async (bookingId: string, patientName: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'no_show' })
      .eq('id', bookingId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Marked as No Show",
        description: `${patientName} has been marked as no show.`,
      });
    }
  };

  const waitingQueue = bookings.filter(b => b.status === 'waiting');
  const consultedQueue = bookings.filter(b => b.status === 'consulted');
  const noShowQueue = bookings.filter(b => b.status === 'no_show');
  
  const isMorning = slotType === 'morning';
  const clinicName = settings 
    ? (isMorning ? settings.morning_clinic_name : settings.evening_clinic_name)
    : '';

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="pt-6">
          <div className="h-64 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant={isMorning ? 'morning' : 'evening'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isMorning ? 'bg-morning/20' : 'bg-evening/20'}`}>
              {isMorning ? (
                <Sun className="h-5 w-5 text-morning" />
              ) : (
                <Moon className="h-5 w-5 text-evening" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{isMorning ? 'Morning Queue' : 'Evening Queue'}</CardTitle>
              <CardDescription>{clinicName}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isMorning ? 'morning' : 'evening'}>
              {waitingQueue.length} waiting
            </Badge>
            <Badge variant="consulted">
              {consultedQueue.length} done
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {waitingQueue.length === 0 ? (
          <div className="rounded-xl bg-muted/50 p-8 text-center">
            <p className="text-muted-foreground">No patients in queue</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Waiting ({waitingQueue.length})</h4>
            {waitingQueue.map((booking) => (
              <div 
                key={booking.id} 
                className="flex items-center justify-between rounded-xl border bg-card p-4 transition-all hover:shadow-card"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${isMorning ? 'bg-morning/20 text-morning' : 'bg-evening/20 text-evening'}`}>
                    #{booking.queue_number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{booking.patient_name}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {booking.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(getEstimatedTime(booking.queue_number), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => markAsConsulted(booking.id, booking.patient_name)}
                    className="gap-1"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Done
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsNoShow(booking.id, booking.patient_name)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <UserX className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {consultedQueue.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-medium text-muted-foreground">Consulted ({consultedQueue.length})</h4>
            <div className="space-y-2">
              {consultedQueue.map((booking) => (
                <div 
                  key={booking.id} 
                  className="flex items-center justify-between rounded-xl bg-success-light p-3"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="consulted">#{booking.queue_number}</Badge>
                    <span className="text-sm">{booking.patient_name}</span>
                    <span className="text-sm text-muted-foreground">{booking.phone}</span>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
              ))}
            </div>
          </div>
        )}

        {noShowQueue.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-medium text-muted-foreground">No Show ({noShowQueue.length})</h4>
            <div className="space-y-2">
              {noShowQueue.map((booking) => (
                <div 
                  key={booking.id} 
                  className="flex items-center justify-between rounded-xl bg-destructive/10 p-3"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive">#{booking.queue_number}</Badge>
                    <span className="text-sm">{booking.patient_name}</span>
                  </div>
                  <XCircle className="h-4 w-4 text-destructive" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}