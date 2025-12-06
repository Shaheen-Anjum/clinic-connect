import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Stethoscope, AlertCircle, CheckCircle2 } from 'lucide-react';

export function AvailabilityToggle() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    const { data, error } = await supabase
      .from('clinic_settings')
      .select('id, doctor_available')
      .single();

    if (error) {
      console.error('Error fetching availability:', error);
    } else {
      setIsAvailable(data.doctor_available);
      setSettingsId(data.id);
    }
    setIsLoading(false);
  };

  const toggleAvailability = async () => {
    if (!settingsId) return;

    const newValue = !isAvailable;

    const { error } = await supabase
      .from('clinic_settings')
      .update({ doctor_available: newValue, updated_by: user?.id })
      .eq('id', settingsId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update availability.",
        variant: "destructive",
      });
    } else {
      setIsAvailable(newValue);
      toast({
        title: newValue ? "Now Available" : "Set as Unavailable",
        description: newValue 
          ? "Patients can now book appointments."
          : "Booking is now closed for today.",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="pt-6">
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className={isAvailable ? 'border-success/30' : 'border-destructive/30'}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${isAvailable ? 'bg-success/10' : 'bg-destructive/10'}`}>
              <Stethoscope className={`h-5 w-5 ${isAvailable ? 'text-success' : 'text-destructive'}`} />
            </div>
            <div>
              <CardTitle className="text-lg">Doctor Availability</CardTitle>
              <CardDescription>
                Toggle to open or close bookings for today
              </CardDescription>
            </div>
          </div>
          <Badge variant={isAvailable ? 'success' : 'destructive'} className="flex items-center gap-1">
            {isAvailable ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Available
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3" />
                Unavailable
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-lg bg-muted p-4">
          <div className="space-y-0.5">
            <Label htmlFor="availability-toggle" className="text-base font-medium">
              {isAvailable ? 'Bookings are Open' : 'Bookings are Closed'}
            </Label>
            <p className="text-sm text-muted-foreground">
              {isAvailable 
                ? 'Patients can book appointments during open hours.'
                : 'Patients will see "Doctor is unavailable today" message.'}
            </p>
          </div>
          <Switch
            id="availability-toggle"
            checked={isAvailable}
            onCheckedChange={toggleAvailability}
          />
        </div>
      </CardContent>
    </Card>
  );
}