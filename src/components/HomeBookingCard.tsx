import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Sun, Moon, MapPin, Clock, AlertCircle, Loader2, Eye, CalendarPlus } from 'lucide-react';
import { format } from 'date-fns';

interface HomeBookingCardProps {
  slotType: 'morning' | 'evening';
}

interface ClinicSettings {
  doctor_available: boolean;
  minutes_per_patient: number;
  morning_clinic_name: string;
  morning_clinic_address: string;
  morning_start_time: string;
  morning_end_time: string;
  morning_booking_open_time: string;
  morning_booking_close_time: string;
  evening_clinic_name: string;
  evening_clinic_address: string;
  evening_start_time: string;
  evening_end_time: string;
  evening_booking_open_time: string;
  evening_booking_close_time: string;
}

export function HomeBookingCard({ slotType }: HomeBookingCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [existingBooking, setExistingBooking] = useState<{ slotType: string } | null>(null);
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeUntilOpen, setTimeUntilOpen] = useState<string>('');

  const isMorning = slotType === 'morning';

  useEffect(() => {
    fetchData();
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }, [slotType, user]);

  const fetchData = async () => {
    // Fetch settings
    const { data: settingsData } = await supabase
      .from('clinic_settings')
      .select('*')
      .single();

    if (settingsData) {
      setSettings(settingsData);
    }

    // Check if logged-in user already has a booking for today
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .maybeSingle();

      if (profileData?.phone) {
        const today = new Date().toISOString().split('T')[0];
        const { data: existingBookingData } = await supabase
          .from('bookings')
          .select('slot_type')
          .eq('phone', profileData.phone)
          .eq('booking_date', today)
          .neq('status', 'consulted')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingBookingData) {
          setExistingBooking({ slotType: existingBookingData.slot_type });
        } else {
          setExistingBooking(null);
        }
      }
    }

    setIsLoading(false);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`home-bookings-${slotType}`)
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

  // Calculate time until booking opens
  useEffect(() => {
    if (!settings) return;

    const bookingOpenTime = isMorning 
      ? settings.morning_booking_open_time 
      : settings.evening_booking_open_time;

    const calculateTimeUntilOpen = () => {
      const now = new Date();
      const [openHour, openMin] = bookingOpenTime.split(':').map(Number);
      const openTime = new Date();
      openTime.setHours(openHour, openMin, 0, 0);

      if (now >= openTime) {
        setTimeUntilOpen('');
        return;
      }

      const diff = openTime.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeUntilOpen(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeUntilOpen(`${minutes}m ${seconds}s`);
      } else {
        setTimeUntilOpen(`${seconds}s`);
      }
    };

    calculateTimeUntilOpen();
    const interval = setInterval(calculateTimeUntilOpen, 1000);
    return () => clearInterval(interval);
  }, [settings, isMorning]);

  const isBookingOpen = (): boolean => {
    if (!settings || !settings.doctor_available) return false;

    const now = new Date();
    const bookingOpenTime = isMorning 
      ? settings.morning_booking_open_time 
      : settings.evening_booking_open_time;
    const bookingCloseTime = isMorning 
      ? settings.morning_booking_close_time 
      : settings.evening_booking_close_time;

    const [openHour, openMin] = bookingOpenTime.split(':').map(Number);
    const [closeHour, closeMin] = bookingCloseTime.split(':').map(Number);

    const openDateTime = new Date();
    openDateTime.setHours(openHour, openMin, 0, 0);

    const closeDateTime = new Date();
    closeDateTime.setHours(closeHour, closeMin, 0, 0);

    return now >= openDateTime && now <= closeDateTime;
  };

  const formatTime = (time: string) => {
    const [hour, min] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, min);
    return format(date, 'h:mm a');
  };

  if (isLoading || !settings) {
    return (
      <Card className="animate-pulse">
        <CardContent className="pt-6">
          <div className="h-48 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const clinic = {
    name: isMorning ? settings.morning_clinic_name : settings.evening_clinic_name,
    address: isMorning ? settings.morning_clinic_address : settings.evening_clinic_address,
    startTime: isMorning ? settings.morning_start_time : settings.evening_start_time,
    endTime: isMorning ? settings.morning_end_time : settings.evening_end_time,
    bookingOpenTime: isMorning ? settings.morning_booking_open_time : settings.evening_booking_open_time,
    bookingCloseTime: isMorning ? settings.morning_booking_close_time : settings.evening_booking_close_time,
  };

  const bookingOpen = isBookingOpen();
  const hasBookingForThisSlot = existingBooking?.slotType === slotType;
  const hasBookingForOtherSlot = existingBooking && existingBooking.slotType !== slotType;

  // Doctor unavailable
  if (!settings.doctor_available) {
    return (
      <Card variant={isMorning ? 'morning' : 'evening'} className="opacity-75">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">{clinic.name}</CardTitle>
          <CardDescription className="text-base">
            The Doctor is unavailable today. Booking is closed.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card variant={isMorning ? 'morning' : 'evening'} className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isMorning ? 'bg-morning/20' : 'bg-evening/20'}`}>
              {isMorning ? (
                <Sun className="h-6 w-6 text-morning" />
              ) : (
                <Moon className="h-6 w-6 text-evening" />
              )}
            </div>
            <div>
              <CardTitle className="text-xl">{isMorning ? 'Morning Slot' : 'Evening Slot'}</CardTitle>
              <CardDescription>{clinic.name}</CardDescription>
            </div>
          </div>
          <Badge variant={isMorning ? 'morning' : 'evening'}>
            {formatTime(clinic.startTime)} - {formatTime(clinic.endTime)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{clinic.address}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Booking: {formatTime(clinic.bookingOpenTime)} - {formatTime(clinic.bookingCloseTime)}</span>
        </div>

        {/* Action Buttons */}
        <div className="pt-2">
          {hasBookingForThisSlot ? (
            // User has booking for this slot - show View Details
            <Button
              variant={isMorning ? 'morning' : 'evening'}
              size="lg"
              className="w-full"
              onClick={() => navigate('/my-booking')}
            >
              <Eye className="h-5 w-5 mr-2" />
              View Booking Details
            </Button>
          ) : hasBookingForOtherSlot ? (
            // User has booking for other slot - show disabled
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              disabled
            >
              <AlertCircle className="h-5 w-5 mr-2" />
              Booking Closed
            </Button>
          ) : bookingOpen ? (
            // No booking and booking is open - show Book Now
            <Button
              variant={isMorning ? 'morning' : 'evening'}
              size="lg"
              className="w-full"
              onClick={() => navigate(`/book/${slotType}`)}
            >
              <CalendarPlus className="h-5 w-5 mr-2" />
              Book Now
            </Button>
          ) : (
            // Booking window not open
            <div className="space-y-3">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                disabled
              >
                <Clock className="h-5 w-5 mr-2" />
                Booking Not Open
              </Button>
              {timeUntilOpen && (
                <p className={`text-center text-sm font-medium ${isMorning ? 'text-morning' : 'text-evening'}`}>
                  Opens in {timeUntilOpen}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
