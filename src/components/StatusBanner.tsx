import { useBooking } from '@/context/BookingContext';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export function StatusBanner() {
  const { settings, getQueueForSlot } = useBooking();
  
  const morningQueue = getQueueForSlot('morning').filter(b => b.status === 'waiting').length;
  const eveningQueue = getQueueForSlot('evening').filter(b => b.status === 'waiting').length;

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
          {settings.isAvailable ? (
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

      {settings.isAvailable && (
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
