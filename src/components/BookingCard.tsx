import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Sun, Moon, MapPin, Clock, Users, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
interface BookingCardProps {
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

export function BookingCard({ slotType }: BookingCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [mobileNumber, setMobileNumber] = useState('');
  const [patientName, setPatientName] = useState('');
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{ queueNumber: number; estimatedTime: Date } | null>(null);
  const [existingBooking, setExistingBooking] = useState<{ queueNumber: number; slotType: string; patientName: string; createdAt: string } | null>(null);
  const [timeUntilOpen, setTimeUntilOpen] = useState<string>('');
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [queueCount, setQueueCount] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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

    // Fetch queue count
    const today = new Date().toISOString().split('T')[0];
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('booking_date', today)
      .eq('slot_type', slotType)
      .eq('status', 'waiting');

    setQueueCount(bookings?.length || 0);

    // Check if logged-in user already has a booking for today
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .maybeSingle();

      if (profileData?.phone) {
        const { data: existingBookingData } = await supabase
          .from('bookings')
          .select('*')
          .eq('phone', profileData.phone)
          .eq('booking_date', today)
          .neq('status', 'consulted')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingBookingData) {
          setExistingBooking({
            queueNumber: existingBookingData.queue_number,
            slotType: existingBookingData.slot_type,
            patientName: existingBookingData.patient_name,
            createdAt: existingBookingData.created_at,
          });

          // Calculate current position
          const { data: waitingPatients } = await supabase
            .from('bookings')
            .select('queue_number')
            .eq('booking_date', today)
            .eq('slot_type', existingBookingData.slot_type)
            .eq('status', 'waiting')
            .lt('queue_number', existingBookingData.queue_number);

          setCurrentPosition((waitingPatients?.length || 0) + 1);
        } else {
          setExistingBooking(null);
        }
      }
    }

    setIsLoading(false);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`bookings-${slotType}`)
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

  const hasBookedToday = async (phone: string): Promise<boolean> => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('bookings')
      .select('id')
      .eq('phone', phone)
      .eq('booking_date', today)
      .neq('status', 'consulted')
      .limit(1);

    return (data?.length || 0) > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to book an appointment.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    if (!mobileNumber || mobileNumber.length < 10) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive",
      });
      return;
    }

    if (!captchaChecked) {
      toast({
        title: "Verification Required",
        description: "Please confirm you are not a robot.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Check if already booked
    const alreadyBooked = await hasBookedToday(mobileNumber);
    if (alreadyBooked) {
      toast({
        title: "Already Booked",
        description: "You have already booked a slot today. Please visit at your scheduled time.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Get current queue count for this slot
    const today = new Date().toISOString().split('T')[0];
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('queue_number')
      .eq('booking_date', today)
      .eq('slot_type', slotType)
      .order('queue_number', { ascending: false })
      .limit(1);

    const nextQueueNumber = (existingBookings?.[0]?.queue_number || 0) + 1;

    // Create booking
    const { data: newBooking, error } = await supabase
      .from('bookings')
      .insert({
        patient_name: patientName || 'Guest Patient',
        phone: mobileNumber,
        slot_type: slotType,
        queue_number: nextQueueNumber,
        booking_date: today,
      })
      .select()
      .single();

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    } else if (newBooking) {
      // Calculate estimated time
      const startTime = isMorning 
        ? settings!.morning_start_time 
        : settings!.evening_start_time;
      const [startHour, startMin] = startTime.split(':').map(Number);
      
      const estimatedTime = new Date();
      estimatedTime.setHours(startHour, startMin, 0, 0);
      estimatedTime.setMinutes(estimatedTime.getMinutes() + ((nextQueueNumber - 1) * settings!.minutes_per_patient));

      setBookingResult({
        queueNumber: nextQueueNumber,
        estimatedTime,
      });
      toast({
        title: "Booking Successful! 🎉",
        description: `You are #${nextQueueNumber} in the queue.`,
      });
    }
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
          <div className="h-64 bg-muted rounded" />
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

  // Calculate estimated time for existing booking
  const getExistingBookingEstimatedTime = () => {
    if (!existingBooking || !settings) return null;
    const isBookingMorning = existingBooking.slotType === 'morning';
    const startTime = isBookingMorning ? settings.morning_start_time : settings.evening_start_time;
    const [startHour, startMin] = startTime.split(':').map(Number);
    const waitingBefore = currentPosition - 1;
    const estimatedTime = new Date();
    estimatedTime.setHours(startHour, startMin, 0, 0);
    estimatedTime.setMinutes(estimatedTime.getMinutes() + (waitingBefore * settings.minutes_per_patient));
    return estimatedTime;
  };

  // Show existing booking info if user has already booked
  if (existingBooking && user) {
    const isBookingMorning = existingBooking.slotType === 'morning';
    const existingClinic = {
      name: isBookingMorning ? settings?.morning_clinic_name : settings?.evening_clinic_name,
      address: isBookingMorning ? settings?.morning_clinic_address : settings?.evening_clinic_address,
    };
    const estimatedTime = getExistingBookingEstimatedTime();

    return (
      <Card variant={isMorning ? 'morning' : 'evening'} className="animate-fade-in">
        <CardHeader className="text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${isBookingMorning ? 'bg-morning/20' : 'bg-evening/20'}`}>
            <CheckCircle2 className={`h-8 w-8 ${isBookingMorning ? 'text-morning' : 'text-evening'}`} />
          </div>
          <CardTitle className="text-xl">You have a booking!</CardTitle>
          <CardDescription className="text-base">{existingClinic.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className={`rounded-xl p-4 ${isBookingMorning ? 'bg-morning/10' : 'bg-evening/10'}`}>
            <p className="text-xs text-muted-foreground">Queue Number</p>
            <p className={`text-4xl font-bold font-display ${isBookingMorning ? 'text-morning' : 'text-evening'}`}>
              #{existingBooking.queueNumber}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Position</p>
              <p className="text-lg font-semibold">#{currentPosition}</p>
            </div>
            {estimatedTime && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Expected Time</p>
                <p className="text-lg font-semibold">{format(estimatedTime, 'h:mm a')}</p>
              </div>
            )}
          </div>

          <Badge variant={isBookingMorning ? 'morning' : 'evening'}>
            {isBookingMorning ? 'Morning Slot' : 'Evening Slot'}
          </Badge>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{existingClinic.address}</span>
          </div>

          <Button variant="outline" size="sm" asChild className="w-full">
            <a href="/my-booking">View Full Details</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (bookingResult) {
    return (
      <Card variant={isMorning ? 'morning' : 'evening'} className="animate-fade-in">
        <CardHeader className="text-center">
          <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${isMorning ? 'bg-morning/20' : 'bg-evening/20'}`}>
            <CheckCircle2 className={`h-10 w-10 ${isMorning ? 'text-morning' : 'text-evening'}`} />
          </div>
          <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
          <CardDescription className="text-base">{clinic.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className={`rounded-xl p-6 ${isMorning ? 'bg-morning/10' : 'bg-evening/10'}`}>
            <p className="text-sm text-muted-foreground">Your Queue Number</p>
            <p className={`text-5xl font-bold font-display ${isMorning ? 'text-morning' : 'text-evening'}`}>
              #{bookingResult.queueNumber}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Expected Time of Visit</p>
            <p className="text-2xl font-semibold">
              {format(bookingResult.estimatedTime, 'h:mm a')}
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-warning-light p-4 text-left">
            <AlertCircle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              This is an estimated time and may vary based on the doctor's consultations.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{clinic.address}</span>
          </div>
        </CardContent>
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
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{clinic.address}</span>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">Current Queue</span>
          </div>
          <span className="text-lg font-semibold">{queueCount} patients</span>
        </div>

        {!bookingOpen && (
          <div className={`rounded-xl p-6 text-center ${isMorning ? 'bg-morning/10' : 'bg-evening/10'}`}>
            <Clock className={`mx-auto mb-3 h-8 w-8 ${isMorning ? 'text-morning' : 'text-evening'}`} />
            <p className="text-sm text-muted-foreground mb-2">Booking window</p>
            <p className="text-2xl font-semibold">{formatTime(clinic.bookingOpenTime)} - {formatTime(clinic.bookingCloseTime)}</p>
            {timeUntilOpen && (
              <p className={`mt-2 text-lg font-medium ${isMorning ? 'text-morning' : 'text-evening'}`}>
                Opens in {timeUntilOpen}
              </p>
            )}
          </div>
        )}

        {bookingOpen && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`mobile-${slotType}`}>Mobile Number *</Label>
              <Input
                id={`mobile-${slotType}`}
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`name-${slotType}`}>Patient Name (Optional)</Label>
              <Input
                id={`name-${slotType}`}
                type="text"
                placeholder="Enter patient name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-3 rounded-lg bg-muted/50 p-4">
              <Checkbox
                id={`captcha-${slotType}`}
                checked={captchaChecked}
                onCheckedChange={(checked) => setCaptchaChecked(checked as boolean)}
              />
              <Label htmlFor={`captcha-${slotType}`} className="text-sm cursor-pointer">
                I am not a robot
              </Label>
            </div>

            <Button
              type="submit"
              variant={isMorning ? 'morning' : 'evening'}
              size="xl"
              className="w-full"
              disabled={isSubmitting || !mobileNumber || !captchaChecked}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  Book {isMorning ? 'Morning' : 'Evening'} Slot
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}