import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Clock, Hash, MapPin, CalendarDays, ArrowLeft, RefreshCw } from 'lucide-react';

interface Booking {
  id: string;
  patient_name: string;
  phone: string;
  slot_type: string;
  queue_number: number;
  status: string;
  created_at: string;
}

interface ClinicSettings {
  morning_clinic_name: string;
  morning_clinic_address: string;
  morning_start_time: string;
  evening_clinic_name: string;
  evening_clinic_address: string;
  evening_start_time: string;
  minutes_per_patient: number;
}

const MyBooking = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, role } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (!authLoading && user && role && (role === 'doctor' || role === 'receptionist')) {
      navigate('/admin');
      return;
    }

    if (user) {
      fetchData();
      setupRealtimeSubscription();
    }
  }, [user, authLoading, role, navigate]);

  const fetchData = async () => {
    setIsLoading(true);

    // Fetch clinic settings
    const { data: settingsData } = await supabase
      .from('clinic_settings')
      .select('*')
      .single();

    if (settingsData) {
      setSettings(settingsData);
    }

    // Fetch user's booking for today using phone from profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', user!.id)
      .single();

    if (profileData?.phone) {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*')
        .eq('phone', profileData.phone)
        .eq('booking_date', today)
        .neq('status', 'consulted')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (bookingData) {
        setBooking(bookingData);
        await calculatePosition(bookingData);
      }
    }

    setIsLoading(false);
  };

  const calculatePosition = async (myBooking: Booking) => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: waitingPatients } = await supabase
      .from('bookings')
      .select('queue_number')
      .eq('booking_date', today)
      .eq('slot_type', myBooking.slot_type)
      .eq('status', 'waiting')
      .lt('queue_number', myBooking.queue_number);

    setCurrentPosition((waitingPatients?.length || 0) + 1);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('booking-updates')
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

  const getEstimatedTime = () => {
    if (!booking || !settings) return null;

    const clinic = booking.slot_type === 'morning' 
      ? { startTime: settings.morning_start_time }
      : { startTime: settings.evening_start_time };

    const [startHour, startMin] = clinic.startTime.split(':').map(Number);
    const waitingBefore = currentPosition - 1;

    const estimatedTime = new Date();
    estimatedTime.setHours(startHour, startMin, 0, 0);
    estimatedTime.setMinutes(estimatedTime.getMinutes() + (waitingBefore * settings.minutes_per_patient));

    return estimatedTime;
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  const estimatedTime = getEstimatedTime();
  const clinicName = booking?.slot_type === 'morning' 
    ? settings?.morning_clinic_name 
    : settings?.evening_clinic_name;
  const clinicAddress = booking?.slot_type === 'morning'
    ? settings?.morning_clinic_address
    : settings?.evening_clinic_address;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8 space-y-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold">My Booking</h1>
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {booking ? (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Queue Status Card */}
            <Card variant="elevated" className="animate-fade-in">
              <CardHeader className="text-center pb-2">
                <CardDescription>Your Queue Number</CardDescription>
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-hero text-primary-foreground">
                  <span className="text-4xl font-bold">#{booking.queue_number}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Badge variant={booking.slot_type === 'morning' ? 'morning' : 'evening'}>
                    {booking.slot_type === 'morning' ? 'Morning Slot' : 'Evening Slot'}
                  </Badge>
                  <Badge variant={booking.status === 'waiting' ? 'waiting' : 'consulted'}>
                    {booking.status === 'waiting' ? 'Waiting' : 'Consulted'}
                  </Badge>
                </div>

                <div className="rounded-lg bg-muted p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Hash className="h-4 w-4" />
                      Current Position
                    </div>
                    <span className="font-semibold">{currentPosition}</span>
                  </div>

                  {estimatedTime && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Expected Time
                      </div>
                      <span className="font-semibold">{format(estimatedTime, 'h:mm a')}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  This is an estimated time and may vary based on consultations.
                </p>
              </CardContent>
            </Card>

            {/* Clinic Details Card */}
            <Card variant="elevated" className="animate-fade-in stagger-1">
              <CardHeader>
                <CardTitle className="text-lg">Clinic Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">{clinicName}</p>
                      <p className="text-sm text-muted-foreground">{clinicAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <CalendarDays className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Booking Details</p>
                      <p className="text-sm text-muted-foreground">
                        Booked at {format(new Date(booking.created_at), 'h:mm a, MMM d')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Patient: {booking.patient_name}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card variant="elevated" className="animate-fade-in">
            <CardContent className="py-12 text-center space-y-4">
              <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="font-display text-lg font-semibold">No Active Booking</h3>
                <p className="text-muted-foreground">
                  You don't have any active booking for today.
                </p>
              </div>
              <Button asChild>
                <Link to="/">Book an Appointment</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default MyBooking;
