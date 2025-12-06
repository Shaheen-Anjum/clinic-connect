import { useBooking } from '@/context/BookingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SlotType } from '@/types/booking';
import { Sun, Moon, CheckCircle2, Clock, Phone, User, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface QueueManagementProps {
  slotType: SlotType;
}

export function QueueManagement({ slotType }: QueueManagementProps) {
  const { settings, getQueueForSlot, markAsConsulted, closeBookingsForSlot } = useBooking();
  const { toast } = useToast();
  
  const queue = getQueueForSlot(slotType);
  const waitingQueue = queue.filter(b => b.status === 'waiting');
  const consultedQueue = queue.filter(b => b.status === 'consulted');
  
  const isMorning = slotType === 'morning';
  const clinic = isMorning ? settings.morningClinic : settings.eveningClinic;
  const isClosed = isMorning ? settings.morningBookingsClosed : settings.eveningBookingsClosed;

  const handleMarkConsulted = (bookingId: string, patientName: string) => {
    markAsConsulted(bookingId);
    toast({
      title: "Patient Consulted",
      description: `${patientName} has been marked as consulted.`,
    });
  };

  const handleCloseBookings = () => {
    closeBookingsForSlot(slotType);
    toast({
      title: "Bookings Closed",
      description: `${isMorning ? 'Morning' : 'Evening'} slot bookings are now closed.`,
    });
  };

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
              <CardDescription>{clinic.name}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isMorning ? 'morning' : 'evening'}>
              {waitingQueue.length} waiting
            </Badge>
            {!isClosed && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCloseBookings}
                className="gap-1"
              >
                <XCircle className="h-4 w-4" />
                Close
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isClosed && (
          <div className="rounded-lg bg-warning-light p-3 text-sm text-warning flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Bookings are closed for this slot
          </div>
        )}

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
                    #{booking.queueNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{booking.patientName}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {booking.mobileNumber}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(booking.estimatedTime, 'h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleMarkConsulted(booking.id, booking.patientName)}
                  className="gap-1"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Done
                </Button>
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
                    <Badge variant="consulted">#{booking.queueNumber}</Badge>
                    <span className="text-sm">{booking.patientName}</span>
                    <span className="text-sm text-muted-foreground">{booking.mobileNumber}</span>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
