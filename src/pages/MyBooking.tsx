import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Clock, Hash, MapPin, CalendarDays, ArrowLeft, RefreshCw, Sun, Moon, Loader2, Users, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  doctor_available: boolean;
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
  minutes_per_patient: number;
}

const MyBooking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading, role } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userPhone, setUserPhone] = useState<string | null>(null);

  // Booking form state
  const [selectedSlot, setSelectedSlot] = useState<'morning' | 'evening' | null>(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [patientName, setPatientName] = useState('');
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [morningQueueCount, setMorningQueueCount] = useState(0);
  const [eveningQueueCount, setEveningQueueCount] = useState(0);

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
      const cleanup = setupRealtimeSubscription();
      return cleanup;
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

    setMorningQueueCount(morningBookings?.length || 0);
    setEveningQueueCount(eveningBookings?.length || 0);

    // Fetch user's booking for today using phone from profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('phone, full_name')
      .eq('id', user!.id)
      .maybeSingle();

    if (profileData?.phone) {
      setUserPhone(profileData.phone);
      setMobileNumber(profileData.phone);
      if (profileData.full_name) {
        setPatientName(profileData.full_name);
      }
      
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*')
        .eq('phone', profileData.phone)
        .eq('booking_date', today)
        .neq('status', 'consulted')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (bookingData) {
        setBooking(bookingData);
        await calculatePosition(bookingData);
      } else {
        setBooking(null);
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

  const isBookingOpen = (slotType: 'morning' | 'evening'): boolean => {
    if (!settings || !settings.doctor_available) return false;

    const now = new Date();
    const bookingOpenTime = slotType === 'morning' 
      ? settings.morning_booking_open_time 
      : settings.evening_booking_open_time;
    const bookingCloseTime = slotType === 'morning' 
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSlot) {
      toast({
        title: "Select a Slot",
        description: "Please select morning or evening slot.",
        variant: "destructive",
      });
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
    const today = new Date().toISOString().split('T')[0];
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('phone', mobileNumber)
      .eq('booking_date', today)
      .neq('status', 'consulted')
      .limit(1);

    if (existingBooking && existingBooking.length > 0) {
      toast({
        title: "Already Booked",
        description: "You have already booked a slot today.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Get current queue count for this slot
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('queue_number')
      .eq('booking_date', today)
      .eq('slot_type', selectedSlot)
      .order('queue_number', { ascending: false })
      .limit(1);

    const nextQueueNumber = (existingBookings?.[0]?.queue_number || 0) + 1;

    // Create booking
    const { error } = await supabase
      .from('bookings')
      .insert({
        patient_name: patientName || 'Guest Patient',
        phone: mobileNumber,
        slot_type: selectedSlot,
        queue_number: nextQueueNumber,
        booking_date: today,
      });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Booking Successful! 🎉",
        description: `You are #${nextQueueNumber} in the queue.`,
      });
      fetchData();
    }
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

  const morningOpen = isBookingOpen('morning');
  const eveningOpen = isBookingOpen('evening');

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
          <div className="space-y-6">
            <Card variant="elevated" className="animate-fade-in">
              <CardHeader className="text-center">
                <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <CardTitle>Book an Appointment</CardTitle>
                <CardDescription>
                  Select a slot and book your appointment for today
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!settings?.doctor_available ? (
                  <div className="text-center py-6">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                      The Doctor is unavailable today. Booking is closed.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Slot Selection */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Morning Slot */}
                      <button
                        type="button"
                        onClick={() => morningOpen && setSelectedSlot('morning')}
                        disabled={!morningOpen}
                        className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                          selectedSlot === 'morning'
                            ? 'border-morning bg-morning/10'
                            : morningOpen
                            ? 'border-border hover:border-morning/50'
                            : 'border-border opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-morning/20">
                            <Sun className="h-5 w-5 text-morning" />
                          </div>
                          <div>
                            <p className="font-semibold">Morning Slot</p>
                            <p className="text-sm text-muted-foreground">{settings?.morning_clinic_name}</p>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {settings && formatTime(settings.morning_start_time)} - {settings && formatTime(settings.morning_end_time)}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            {morningQueueCount} patients in queue
                          </div>
                        </div>
                        {!morningOpen && (
                          <Badge variant="outline" className="absolute top-2 right-2 text-xs">
                            Closed
                          </Badge>
                        )}
                      </button>

                      {/* Evening Slot */}
                      <button
                        type="button"
                        onClick={() => eveningOpen && setSelectedSlot('evening')}
                        disabled={!eveningOpen}
                        className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                          selectedSlot === 'evening'
                            ? 'border-evening bg-evening/10'
                            : eveningOpen
                            ? 'border-border hover:border-evening/50'
                            : 'border-border opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-evening/20">
                            <Moon className="h-5 w-5 text-evening" />
                          </div>
                          <div>
                            <p className="font-semibold">Evening Slot</p>
                            <p className="text-sm text-muted-foreground">{settings?.evening_clinic_name}</p>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {settings && formatTime(settings.evening_start_time)} - {settings && formatTime(settings.evening_end_time)}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            {eveningQueueCount} patients in queue
                          </div>
                        </div>
                        {!eveningOpen && (
                          <Badge variant="outline" className="absolute top-2 right-2 text-xs">
                            Closed
                          </Badge>
                        )}
                      </button>
                    </div>

                    {(!morningOpen && !eveningOpen) && (
                      <div className="text-center py-4 rounded-lg bg-muted">
                        <p className="text-muted-foreground">
                          Booking windows are currently closed. Please check the booking times on the home page.
                        </p>
                      </div>
                    )}

                    {(morningOpen || eveningOpen) && (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="mobile">Mobile Number *</Label>
                          <Input
                            id="mobile"
                            type="tel"
                            placeholder="Enter 10-digit mobile number"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            maxLength={10}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="name">Patient Name (Optional)</Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="Enter patient name"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                          />
                        </div>

                        <div className="flex items-center space-x-3 rounded-lg bg-muted/50 p-4">
                          <Checkbox
                            id="captcha"
                            checked={captchaChecked}
                            onCheckedChange={(checked) => setCaptchaChecked(checked as boolean)}
                          />
                          <Label htmlFor="captcha" className="text-sm cursor-pointer">
                            I am not a robot
                          </Label>
                        </div>

                        <Button
                          type="submit"
                          variant={selectedSlot === 'morning' ? 'morning' : selectedSlot === 'evening' ? 'evening' : 'default'}
                          size="lg"
                          className="w-full"
                          disabled={isSubmitting || !mobileNumber || !captchaChecked || !selectedSlot}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin mr-2" />
                              Booking...
                            </>
                          ) : (
                            <>Book {selectedSlot === 'morning' ? 'Morning' : selectedSlot === 'evening' ? 'Evening' : ''} Slot</>
                          )}
                        </Button>
                      </form>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyBooking;