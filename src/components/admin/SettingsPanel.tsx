import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Settings, Clock, MapPin, Sun, Moon, Save, Loader2 } from 'lucide-react';

interface ClinicSettings {
  id: string;
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

interface MorningSettings {
  morning_clinic_name: string;
  morning_clinic_address: string;
  morning_start_time: string;
  morning_end_time: string;
  morning_booking_open_time: string;
  morning_booking_close_time: string;
}

interface EveningSettings {
  evening_clinic_name: string;
  evening_clinic_address: string;
  evening_start_time: string;
  evening_end_time: string;
  evening_booking_open_time: string;
  evening_booking_close_time: string;
}

export function SettingsPanel() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingMorning, setIsSavingMorning] = useState(false);
  const [isSavingEvening, setIsSavingEvening] = useState(false);

  // Local state for form inputs
  const [morningForm, setMorningForm] = useState<MorningSettings>({
    morning_clinic_name: '',
    morning_clinic_address: '',
    morning_start_time: '',
    morning_end_time: '',
    morning_booking_open_time: '',
    morning_booking_close_time: '',
  });

  const [eveningForm, setEveningForm] = useState<EveningSettings>({
    evening_clinic_name: '',
    evening_clinic_address: '',
    evening_start_time: '',
    evening_end_time: '',
    evening_booking_open_time: '',
    evening_booking_close_time: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  // Sync form state when settings are fetched
  useEffect(() => {
    if (settings) {
      setMorningForm({
        morning_clinic_name: settings.morning_clinic_name,
        morning_clinic_address: settings.morning_clinic_address,
        morning_start_time: settings.morning_start_time,
        morning_end_time: settings.morning_end_time,
        morning_booking_open_time: settings.morning_booking_open_time,
        morning_booking_close_time: settings.morning_booking_close_time,
      });
      setEveningForm({
        evening_clinic_name: settings.evening_clinic_name,
        evening_clinic_address: settings.evening_clinic_address,
        evening_start_time: settings.evening_start_time,
        evening_end_time: settings.evening_end_time,
        evening_booking_open_time: settings.evening_booking_open_time,
        evening_booking_close_time: settings.evening_booking_close_time,
      });
    }
  }, [settings]);

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
    if (!settings) return false;

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
      return false;
    } else {
      setSettings({ ...settings, ...updates });
      toast({
        title: "Settings Updated",
        description: "Your changes have been saved.",
      });
      return true;
    }
  };

  const saveMorningSettings = async () => {
    setIsSavingMorning(true);
    await updateSettings(morningForm);
    setIsSavingMorning(false);
  };

  const saveEveningSettings = async () => {
    setIsSavingEvening(true);
    await updateSettings(eveningForm);
    setIsSavingEvening(false);
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
                value={morningForm.morning_clinic_name}
                onChange={(e) => setMorningForm({ ...morningForm, morning_clinic_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="morning-address">Address</Label>
              <Input
                id="morning-address"
                value={morningForm.morning_clinic_address}
                onChange={(e) => setMorningForm({ ...morningForm, morning_clinic_address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="morning-start">Start Time</Label>
              <Input
                id="morning-start"
                type="time"
                value={morningForm.morning_start_time}
                onChange={(e) => setMorningForm({ ...morningForm, morning_start_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="morning-end">End Time</Label>
              <Input
                id="morning-end"
                type="time"
                value={morningForm.morning_end_time}
                onChange={(e) => setMorningForm({ ...morningForm, morning_end_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="morning-booking">Booking Opens At</Label>
              <Input
                id="morning-booking"
                type="time"
                value={morningForm.morning_booking_open_time}
                onChange={(e) => setMorningForm({ ...morningForm, morning_booking_open_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="morning-booking-close">Booking Closes At</Label>
              <Input
                id="morning-booking-close"
                type="time"
                value={morningForm.morning_booking_close_time}
                onChange={(e) => setMorningForm({ ...morningForm, morning_booking_close_time: e.target.value })}
              />
            </div>
            <p className="text-xs text-muted-foreground sm:col-span-2">
              Patients can book between these times
            </p>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={saveMorningSettings} disabled={isSavingMorning}>
              {isSavingMorning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Morning Settings
                </>
              )}
            </Button>
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
                value={eveningForm.evening_clinic_name}
                onChange={(e) => setEveningForm({ ...eveningForm, evening_clinic_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evening-address">Address</Label>
              <Input
                id="evening-address"
                value={eveningForm.evening_clinic_address}
                onChange={(e) => setEveningForm({ ...eveningForm, evening_clinic_address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evening-start">Start Time</Label>
              <Input
                id="evening-start"
                type="time"
                value={eveningForm.evening_start_time}
                onChange={(e) => setEveningForm({ ...eveningForm, evening_start_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evening-end">End Time</Label>
              <Input
                id="evening-end"
                type="time"
                value={eveningForm.evening_end_time}
                onChange={(e) => setEveningForm({ ...eveningForm, evening_end_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evening-booking">Booking Opens At</Label>
              <Input
                id="evening-booking"
                type="time"
                value={eveningForm.evening_booking_open_time}
                onChange={(e) => setEveningForm({ ...eveningForm, evening_booking_open_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evening-booking-close">Booking Closes At</Label>
              <Input
                id="evening-booking-close"
                type="time"
                value={eveningForm.evening_booking_close_time}
                onChange={(e) => setEveningForm({ ...eveningForm, evening_booking_close_time: e.target.value })}
              />
            </div>
            <p className="text-xs text-muted-foreground sm:col-span-2">
              Patients can book between these times
            </p>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={saveEveningSettings} disabled={isSavingEvening}>
              {isSavingEvening ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Evening Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
