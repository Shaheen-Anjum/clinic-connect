import { useBooking } from '@/context/BookingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { UserCheck, UserX } from 'lucide-react';

export function AvailabilityToggle() {
  const { settings, updateSettings } = useBooking();

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {settings.isAvailable ? (
            <UserCheck className="h-5 w-5 text-success" />
          ) : (
            <UserX className="h-5 w-5 text-destructive" />
          )}
          Doctor Availability
        </CardTitle>
        <CardDescription>
          Toggle your availability for today's appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
          <div className="space-y-1">
            <Label htmlFor="availability" className="text-base font-medium cursor-pointer">
              {settings.isAvailable ? 'Doctor is Available' : 'Doctor is NOT Available'}
            </Label>
            <p className="text-sm text-muted-foreground">
              {settings.isAvailable 
                ? 'Patients can book appointments for today'
                : 'All booking is currently disabled'
              }
            </p>
          </div>
          <Switch
            id="availability"
            checked={settings.isAvailable}
            onCheckedChange={(checked) => updateSettings({ isAvailable: checked })}
            className="data-[state=checked]:bg-success"
          />
        </div>
      </CardContent>
    </Card>
  );
}
