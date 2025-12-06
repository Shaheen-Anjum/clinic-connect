import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useBooking } from '@/context/BookingContext';
import { SlotType } from '@/types/booking';
import { Sun, Moon, MapPin, Clock, Users, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface BookingCardProps {
  slotType: SlotType;
}

export function BookingCard({ slotType }: BookingCardProps) {
  const { settings, addBooking, getQueueForSlot, isBookingOpen, hasBookedToday } = useBooking();
  const { toast } = useToast();
  
  const [mobileNumber, setMobileNumber] = useState('');
  const [patientName, setPatientName] = useState('');
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{ queueNumber: number; estimatedTime: Date } | null>(null);
  const [timeUntilOpen, setTimeUntilOpen] = useState<string>('');

  const clinic = slotType === 'morning' ? settings.morningClinic : settings.eveningClinic;
  const isMorning = slotType === 'morning';
  const bookingOpen = isBookingOpen(slotType);
  const queueCount = getQueueForSlot(slotType).filter(b => b.status === 'waiting').length;

  // Calculate time until booking opens
  useEffect(() => {
    const calculateTimeUntilOpen = () => {
      const now = new Date();
      const [openHour, openMin] = clinic.bookingOpenTime.split(':').map(Number);
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
  }, [clinic.bookingOpenTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    
    // Simulate a small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = addBooking(mobileNumber, patientName, slotType);
    
    setIsSubmitting(false);

    if (result.success && result.booking) {
      setBookingResult({
        queueNumber: result.booking.queueNumber,
        estimatedTime: result.booking.estimatedTime,
      });
      toast({
        title: "Booking Successful! 🎉",
        description: `You are #${result.booking.queueNumber} in the queue.`,
      });
    } else {
      toast({
        title: "Booking Failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const formatTime = (time: string) => {
    const [hour, min] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, min);
    return format(date, 'h:mm a');
  };

  if (!settings.isAvailable) {
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

  const isClosed = (isMorning && settings.morningBookingsClosed) || (!isMorning && settings.eveningBookingsClosed);

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

        {!bookingOpen && !isClosed && (
          <div className={`rounded-xl p-6 text-center ${isMorning ? 'bg-morning/10' : 'bg-evening/10'}`}>
            <Clock className={`mx-auto mb-3 h-8 w-8 ${isMorning ? 'text-morning' : 'text-evening'}`} />
            <p className="text-sm text-muted-foreground mb-2">Booking opens at</p>
            <p className="text-2xl font-semibold">{formatTime(clinic.bookingOpenTime)}</p>
            {timeUntilOpen && (
              <p className={`mt-2 text-lg font-medium ${isMorning ? 'text-morning' : 'text-evening'}`}>
                Opens in {timeUntilOpen}
              </p>
            )}
          </div>
        )}

        {isClosed && (
          <div className="rounded-xl bg-destructive/10 p-6 text-center">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive" />
            <p className="font-medium text-destructive">Booking Closed</p>
            <p className="text-sm text-muted-foreground mt-1">This session's booking has been closed.</p>
          </div>
        )}

        {bookingOpen && !isClosed && (
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
