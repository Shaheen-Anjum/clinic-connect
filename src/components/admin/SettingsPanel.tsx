import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Save, Loader2, Sun, Moon } from 'lucide-react';

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

// Convert 24-hour time to 12-hour format
const convertTo12Hour = (time24: string): { hour: string; minute: string; period: 'AM' | 'PM' } => {
  if (!time24) return { hour: '12', minute: '00', period: 'AM' };
  const [hours, minutes] = time24.split(':');
  let hour = parseInt(hours, 10);
  const period: 'AM' | 'PM' = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return { hour: hour.toString(), minute: minutes || '00', period };
};

// Convert 12-hour format to 24-hour time
const convertTo24Hour = (hour: string, minute: string, period: 'AM' | 'PM'): string => {
  let h = parseInt(hour, 10);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${minute}`;
};

interface SimpleTimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

function SimpleTimePicker({ value, onChange }: SimpleTimePickerProps) {
  const { hour, minute, period } = convertTo12Hour(value);

  const handleChange = (newHour: string, newMinute: string, newPeriod: 'AM' | 'PM') => {
    onChange(convertTo24Hour(newHour, newMinute, newPeriod));
  };

  return (
    <div className="flex items-center gap-1">
      <Select value={hour} onValueChange={(h) => handleChange(h, minute, period)}>
        <SelectTrigger className="w-16 h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map((h) => (
            <SelectItem key={h} value={h}>{h}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground">:</span>
      <Select value={minute} onValueChange={(m) => handleChange(hour, m, period)}>
        <SelectTrigger className="w-16 h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {['00', '15', '30', '45'].map((m) => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={period} onValueChange={(p) => handleChange(hour, minute, p as 'AM' | 'PM')}>
        <SelectTrigger className="w-16 h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

interface TimeRowProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function TimeRow({ label, value, onChange }: TimeRowProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <SimpleTimePicker value={value} onChange={onChange} />
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
        title: "Saved",
        description: "Settings updated successfully.",
      });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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
    <div className="space-y-3">
      {/* Minutes per Patient */}
      <Card>
        <CardHeader className="py-3 pb-2">
          <CardTitle className="text-base font-medium">Consultation Time</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          <div className="flex items-center gap-3">
            <Label className="text-sm text-muted-foreground">Minutes per patient</Label>
            <Select 
              value={formData.minutes_per_patient.toString()} 
              onValueChange={(v) => updateFormData({ minutes_per_patient: parseInt(v) })}
            >
              <SelectTrigger className="w-20 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 7, 10, 12, 15, 20, 25, 30].map((m) => (
                  <SelectItem key={m} value={m.toString()}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Morning Clinic */}
      <Card>
        <CardHeader className="py-3 pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Sun className="h-4 w-4 text-amber-500" />
            Morning Clinic
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0 pb-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">Clinic Name</Label>
              <Input
                value={formData.morning_clinic_name}
                onChange={(e) => updateFormData({ morning_clinic_name: e.target.value })}
                className="mt-1 h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Address</Label>
              <Input
                value={formData.morning_clinic_address}
                onChange={(e) => updateFormData({ morning_clinic_address: e.target.value })}
                className="mt-1 h-8"
              />
            </div>
          </div>
          
          <div className="border-t pt-2">
            <p className="text-xs font-medium text-muted-foreground mb-1">Clinic Hours</p>
            <TimeRow 
              label="Opens at" 
              value={formData.morning_start_time} 
              onChange={(v) => updateFormData({ morning_start_time: v })} 
            />
            <TimeRow 
              label="Closes at" 
              value={formData.morning_end_time} 
              onChange={(v) => updateFormData({ morning_end_time: v })} 
            />
          </div>

          <div className="border-t pt-2">
            <p className="text-xs font-medium text-muted-foreground mb-1">Booking Window</p>
            <TimeRow 
              label="Booking opens" 
              value={formData.morning_booking_open_time} 
              onChange={(v) => updateFormData({ morning_booking_open_time: v })} 
            />
            <TimeRow 
              label="Booking closes" 
              value={formData.morning_booking_close_time} 
              onChange={(v) => updateFormData({ morning_booking_close_time: v })} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Evening Clinic */}
      <Card>
        <CardHeader className="py-3 pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Moon className="h-4 w-4 text-indigo-500" />
            Evening Clinic
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0 pb-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">Clinic Name</Label>
              <Input
                value={formData.evening_clinic_name}
                onChange={(e) => updateFormData({ evening_clinic_name: e.target.value })}
                className="mt-1 h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Address</Label>
              <Input
                value={formData.evening_clinic_address}
                onChange={(e) => updateFormData({ evening_clinic_address: e.target.value })}
                className="mt-1 h-8"
              />
            </div>
          </div>
          
          <div className="border-t pt-2">
            <p className="text-xs font-medium text-muted-foreground mb-1">Clinic Hours</p>
            <TimeRow 
              label="Opens at" 
              value={formData.evening_start_time} 
              onChange={(v) => updateFormData({ evening_start_time: v })} 
            />
            <TimeRow 
              label="Closes at" 
              value={formData.evening_end_time} 
              onChange={(v) => updateFormData({ evening_end_time: v })} 
            />
          </div>

          <div className="border-t pt-2">
            <p className="text-xs font-medium text-muted-foreground mb-1">Booking Window</p>
            <TimeRow 
              label="Booking opens" 
              value={formData.evening_booking_open_time} 
              onChange={(v) => updateFormData({ evening_booking_open_time: v })} 
            />
            <TimeRow 
              label="Booking closes" 
              value={formData.evening_booking_close_time} 
              onChange={(v) => updateFormData({ evening_booking_close_time: v })} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button 
        onClick={saveSettings} 
        disabled={isSaving || !hasChanges}
        className="w-full gap-2"
        size="lg"
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
  );
}
