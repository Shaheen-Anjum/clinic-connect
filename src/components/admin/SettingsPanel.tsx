import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Settings, Clock, MapPin, Sun, Moon } from 'lucide-react';

interface ClinicSettings {
  id: string;
  minutes_per_patient: number;
  morning_clinic_name: string;
  morning_clinic_address: string;
  morning_start_time: string;
  morning_end_time: string;
  morning_booking_open_time: string;
  evening_clinic_name: string;
  evening_clinic_address: string;
  evening_start_time: string;
  evening_end_time: string;
  evening_booking_open_time: string;
}

export function SettingsPanel() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('clinic_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching settings:', error);
    } else {
      setSettings(data);
    }
    setIsLoading(false);
  };

  const updateSettings = async (updates: Partial<ClinicSettings>) => {
    if (!settings) return;

    const { error } = await supabase
      .from('clinic_settings')
      .update({ ...updates, updated_by: user?.id })
      .eq('id', settings.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    } else {
      setSettings({ ...settings, ...updates });
      toast({
        title: "Settings Updated",
        description: "Your changes have been saved.",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="pt-6">
          <div className="h-96 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Failed to load settings.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Clinic Settings
        </CardTitle>
        <CardDescription>
          Configure clinic locations and timing preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Time per patient */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label>Minutes per Patient</Label>
            </div>
            <span className="text-lg font-semibold text-primary">{settings.minutes_per_patient} min</span>
          </div>
          <Slider
            value={[settings.minutes_per_patient]}
            onValueChange={([value]) => updateSettings({ minutes_per_patient: value })}
            min={5}
            max={30}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            This affects the estimated wait time shown to patients
          </p>
        </div>

        {/* Morning Clinic */}
        <div className="space-y-4 rounded-xl bg-morning-light p-4">
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-morning" />
            <h4 className="font-medium">Morning Clinic (Clinic A)</h4>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="morning-name" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Name
              </Label>
              <Input
                id="morning-name"
                value={settings.morning_clinic_name}
                onChange={(e) => updateSettings({ morning_clinic_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="morning-address">Address</Label>
              <Input
                id="morning-address"
                value={settings.morning_clinic_address}
                onChange={(e) => updateSettings({ morning_clinic_address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="morning-start">Start Time</Label>
              <Input
                id="morning-start"
                type="time"
                value={settings.morning_start_time}
                onChange={(e) => updateSettings({ morning_start_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="morning-end">End Time</Label>
              <Input
                id="morning-end"
                type="time"
                value={settings.morning_end_time}
                onChange={(e) => updateSettings({ morning_end_time: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="morning-booking">Booking Opens At</Label>
              <Input
                id="morning-booking"
                type="time"
                value={settings.morning_booking_open_time}
                onChange={(e) => updateSettings({ morning_booking_open_time: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Patients can start booking at this time
              </p>
            </div>
          </div>
        </div>

        {/* Evening Clinic */}
        <div className="space-y-4 rounded-xl bg-evening-light p-4">
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-evening" />
            <h4 className="font-medium">Evening Clinic (Clinic B)</h4>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="evening-name" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Name
              </Label>
              <Input
                id="evening-name"
                value={settings.evening_clinic_name}
                onChange={(e) => updateSettings({ evening_clinic_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evening-address">Address</Label>
              <Input
                id="evening-address"
                value={settings.evening_clinic_address}
                onChange={(e) => updateSettings({ evening_clinic_address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evening-start">Start Time</Label>
              <Input
                id="evening-start"
                type="time"
                value={settings.evening_start_time}
                onChange={(e) => updateSettings({ evening_start_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evening-end">End Time</Label>
              <Input
                id="evening-end"
                type="time"
                value={settings.evening_end_time}
                onChange={(e) => updateSettings({ evening_end_time: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="evening-booking">Booking Opens At</Label>
              <Input
                id="evening-booking"
                type="time"
                value={settings.evening_booking_open_time}
                onChange={(e) => updateSettings({ evening_booking_open_time: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Patients can start booking at this time
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}