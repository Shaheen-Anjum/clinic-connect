import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, XCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export function StatusBanner() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [morningQueue, setMorningQueue] = useState(0);
  const [eveningQueue, setEveningQueue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }, []);

  const fetchData = async () => {
    // Fetch settings
    const { data: settings } = await supabase
      .from('clinic_settings')
      .select('doctor_available')
      .single();

    if (settings) {
      setIsAvailable(settings.doctor_available);
    }

    // Fetch queue counts
    const today = new Date().toISOString().split('T')[0];
    
    const { data: morningBookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('booking_date', today)
      .eq('slot_type', 'morning')
      .eq('status', 'waiting');

    const { data: eveningBookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('booking_date', today)
      .eq('slot_type', 'evening')
      .eq('status', 'waiting');

    setMorningQueue(morningBookings?.length || 0);
    setEveningQueue(eveningBookings?.length || 0);
    setIsLoading(false);
  };

  const setupRealtimeSubscription = () => {
    const bookingsChannel = supabase
      .channel('status-bookings')
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

    const settingsChannel = supabase
      .channel('status-settings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clinic_settings',
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(settingsChannel);
    };
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-gradient-card border shadow-card p-6 animate-pulse">
        <div className="h-20 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-card border shadow-card p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <Calendar className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">Today's Booking Status</h2>
            <p className="text-sm text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAvailable ? (
            <Badge variant="success" className="gap-1.5 px-4 py-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Doctor Available
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1.5 px-4 py-1.5">
              <XCircle className="h-3.5 w-3.5" />
              Doctor Unavailable
            </Badge>
          )}
        </div>
      </div>

      {isAvailable && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-morning-light p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-morning">Morning Queue</span>
              <span className="text-2xl font-bold text-morning">{morningQueue}</span>
            </div>
          </div>
          <div className="rounded-xl bg-evening-light p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-evening">Evening Queue</span>
              <span className="text-2xl font-bold text-evening">{eveningQueue}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}