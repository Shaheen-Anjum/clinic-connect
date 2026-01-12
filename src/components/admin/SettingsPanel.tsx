import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface FormSettings {
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

// Convert 24-hour time to 12-hour format with AM/PM
const convertTo12Hour = (time24: string): { hour: string; minute: string; period: 'AM' | 'PM' } => {
  if (!time24) return { hour: '12', minute: '00', period: 'AM' };
  const [hours, minutes] = time24.split(':');
  let hour = parseInt(hours, 10);
  const period: 'AM' | 'PM' = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return { hour: hour.toString().padStart(2, '0'), minute: minutes || '00', period };
};

// Convert 12-hour format to 24-hour time
const convertTo24Hour = (hour: string, minute: string, period: 'AM' | 'PM'): string => {
  let h = parseInt(hour, 10);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${minute}`;
};

// Format time for display
const formatTimeDisplay = (time24: string): string => {
  const { hour, minute, period } = convertTo12Hour(time24);
  return `${hour}:${minute} ${period}`;
};

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

function TimePicker({ value, onChange, label }: TimePickerProps) {
  const { hour, minute, period } = convertTo12Hour(value);

  const handleChange = (newHour: string, newMinute: string, newPeriod: 'AM' | 'PM') => {
    const time24 = convertTo24Hour(newHour, newMinute, newPeriod);
    onChange(time24);
  };

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2">
        <Select value={hour} onValueChange={(h) => handleChange(h, minute, period)}>
          <SelectTrigger className="w-20 bg-background">
            <SelectValue placeholder="HH" />
          </SelectTrigger>
          <SelectContent>
            {hours.map((h) => (
              <SelectItem key={h} value={h}>{h}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="flex items-center text-lg font-semibold text-muted-foreground">:</span>
        <Select value={minute} onValueChange={(m) => handleChange(hour, m, period)}>
          <SelectTrigger className="w-20 bg-background">
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent>
            {minutes.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={(p) => handleChange(hour, minute, p as 'AM' | 'PM')}>
          <SelectTrigger className="w-20 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function SettingsPanel() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState<FormSettings>({
    minutes_per_patient: 10,
    morning_clinic_name: '',
    morning_clinic_address: '',
    morning_start_time: '',
    morning_end_time: '',
    morning_booking_open_time: '',
    morning_booking_close_time: '',
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

  useEffect(() => {
    if (settings) {
      setFormData({
        minutes_per_patient: settings.minutes_per_patient,
        morning_clinic_name: settings.morning_clinic_name,
        morning_clinic_address: settings.morning_clinic_address,
        morning_start_time: settings.morning_start_time,
        morning_end_time: settings.morning_end_time,
        morning_booking_open_time: settings.morning_booking_open_time,
        morning_booking_close_time: settings.morning_booking_close_time,
        evening_clinic_name: settings.evening_clinic_name,
        evening_clinic_address: settings.evening_clinic_address,
        evening_start_time: settings.evening_start_time,
        evening_end_time: settings.evening_end_time,
        evening_booking_open_time: settings.evening_booking_open_time,
        evening_booking_close_time: settings.evening_booking_close_time,
      });
      setHasChanges(false);
    }
  }, [settings]);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('clinic_settings')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error fetching settings:', error);
    } else if (data) {
      setSettings(data);
    }
    setIsLoading(false);
  };

  const updateFormData = (updates: Partial<FormSettings>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    const { error } = await supabase
      .from('clinic_settings')
      .update({ ...formData, updated_by: user?.id })
      .eq('id', settings.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    } else {
      setSettings({ ...settings, ...formData });
      setHasChanges(false);
      toast({
        title: "Settings Saved",
        description: "All your changes have been saved successfully.",
      });
    }
    setIsSaving(false);
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Clinic Settings
            </CardTitle>
            <CardDescription>
              Configure clinic locations and timing preferences
            </CardDescription>
          </div>
          <Button 
            onClick={saveSettings} 
            disabled={isSaving || !hasChanges}
            size="lg"
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Time per patient */}
        <div className="space-y-4 p-4 rounded-xl bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label>Minutes per Patient</Label>
            </div>
            <span className="text-lg font-semibold text-primary">{formData.minutes_per_patient} min</span>
          </div>
          <Slider
            value={[formData.minutes_per_patient]}
            onValueChange={([value]) => updateFormData({ minutes_per_patient: value })}
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
        <div className="space-y-4 rounded-xl bg-morning-light p-5">
          <div className="flex items-center gap-2 pb-2 border-b border-morning/20">
            <Sun className="h-5 w-5 text-morning" />
            <h4 className="font-semibold text-lg">Morning Clinic</h4>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="morning-name" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Clinic Name
              </Label>
              <Input
                id="morning-name"
                value={formData.morning_clinic_name}
                onChange={(e) => updateFormData({ morning_clinic_name: e.target.value })}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="morning-address">Address</Label>
              <Input
                id="morning-address"
                value={formData.morning_clinic_address}
                onChange={(e) => updateFormData({ morning_clinic_address: e.target.value })}
                className="bg-background"
              />
            </div>
          </div>

          <div className="pt-2">
            <h5 className="text-sm font-medium text-muted-foreground mb-3">Clinic Hours</h5>
            <div className="grid gap-4 sm:grid-cols-2">
              <TimePicker
                label="Start Time"
                value={formData.morning_start_time}
                onChange={(v) => updateFormData({ morning_start_time: v })}
              />
              <TimePicker
                label="End Time"
                value={formData.morning_end_time}
                onChange={(v) => updateFormData({ morning_end_time: v })}
              />
            </div>
          </div>

          <div className="pt-2">
            <h5 className="text-sm font-medium text-muted-foreground mb-3">Booking Window</h5>
            <div className="grid gap-4 sm:grid-cols-2">
              <TimePicker
                label="Booking Opens"
                value={formData.morning_booking_open_time}
                onChange={(v) => updateFormData({ morning_booking_open_time: v })}
              />
              <TimePicker
                label="Booking Closes"
                value={formData.morning_booking_close_time}
                onChange={(v) => updateFormData({ morning_booking_close_time: v })}
              />
            </div>
          </div>
        </div>

        {/* Evening Clinic */}
        <div className="space-y-4 rounded-xl bg-evening-light p-5">
          <div className="flex items-center gap-2 pb-2 border-b border-evening/20">
            <Moon className="h-5 w-5 text-evening" />
            <h4 className="font-semibold text-lg">Evening Clinic</h4>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="evening-name" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Clinic Name
              </Label>
              <Input
                id="evening-name"
                value={formData.evening_clinic_name}
                onChange={(e) => updateFormData({ evening_clinic_name: e.target.value })}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evening-address">Address</Label>
              <Input
                id="evening-address"
                value={formData.evening_clinic_address}
                onChange={(e) => updateFormData({ evening_clinic_address: e.target.value })}
                className="bg-background"
              />
            </div>
          </div>

          <div className="pt-2">
            <h5 className="text-sm font-medium text-muted-foreground mb-3">Clinic Hours</h5>
            <div className="grid gap-4 sm:grid-cols-2">
              <TimePicker
                label="Start Time"
                value={formData.evening_start_time}
                onChange={(v) => updateFormData({ evening_start_time: v })}
              />
              <TimePicker
                label="End Time"
                value={formData.evening_end_time}
                onChange={(v) => updateFormData({ evening_end_time: v })}
              />
            </div>
          </div>

          <div className="pt-2">
            <h5 className="text-sm font-medium text-muted-foreground mb-3">Booking Window</h5>
            <div className="grid gap-4 sm:grid-cols-2">
              <TimePicker
                label="Booking Opens"
                value={formData.evening_booking_open_time}
                onChange={(v) => updateFormData({ evening_booking_open_time: v })}
              />
              <TimePicker
                label="Booking Closes"
                value={formData.evening_booking_close_time}
                onChange={(v) => updateFormData({ evening_booking_close_time: v })}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
