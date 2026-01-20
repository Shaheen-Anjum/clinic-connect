import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Save, Loader2, Sun, Moon, Clock, MapPin, Building2, Timer, CalendarClock } from 'lucide-react';

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

interface CompactTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  variant?: 'morning' | 'evening';
}

function CompactTimePicker({ value, onChange, variant = 'morning' }: CompactTimePickerProps) {
  const { hour, minute, period } = convertTo12Hour(value);

  const handleChange = (newHour: string, newMinute: string, newPeriod: 'AM' | 'PM') => {
    onChange(convertTo24Hour(newHour, newMinute, newPeriod));
  };

  const selectClass = variant === 'morning' 
    ? "h-7 text-xs border-morning/30 bg-morning-light/50 focus:ring-morning" 
    : "h-7 text-xs border-evening/30 bg-evening-light/50 focus:ring-evening";

  return (
    <div className="inline-flex items-center gap-0.5 bg-background/80 rounded-md p-0.5">
      <Select value={hour} onValueChange={(h) => handleChange(h, minute, period)}>
        <SelectTrigger className={`w-11 ${selectClass} px-1.5`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map((h) => (
            <SelectItem key={h} value={h} className="text-xs">{h}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground font-bold">:</span>
      <Select value={minute} onValueChange={(m) => handleChange(hour, m, period)}>
        <SelectTrigger className={`w-11 ${selectClass} px-1.5`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {['00', '15', '30', '45'].map((m) => (
            <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={period} onValueChange={(p) => handleChange(hour, minute, p as 'AM' | 'PM')}>
        <SelectTrigger className={`w-12 ${selectClass} px-1`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM" className="text-xs">AM</SelectItem>
          <SelectItem value="PM" className="text-xs">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

interface TimeRowProps {
  icon: React.ReactNode;
  label: string;
  startValue: string;
  endValue: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  variant: 'morning' | 'evening';
}

function TimeRow({ icon, label, startValue, endValue, onStartChange, onEndChange, variant }: TimeRowProps) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <div className="flex items-center gap-1.5 min-w-[90px]">
        {icon}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-1 justify-end">
        <CompactTimePicker value={startValue} onChange={onStartChange} variant={variant} />
        <span className="text-muted-foreground text-sm">→</span>
        <CompactTimePicker value={endValue} onChange={onEndChange} variant={variant} />
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
        title: "Saved",
        description: "Settings updated successfully.",
      });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Failed to load settings.
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Consultation Duration - Compact horizontal card */}
      <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/20 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/15">
            <Timer className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">Consultation Duration</p>
            <p className="text-xs text-muted-foreground">Average time per patient</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select 
            value={formData.minutes_per_patient.toString()} 
            onValueChange={(v) => updateFormData({ minutes_per_patient: parseInt(v) })}
          >
            <SelectTrigger className="w-20 h-9 font-semibold border-primary/30 bg-primary/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 7, 10, 12, 15, 20, 25, 30].map((m) => (
                <SelectItem key={m} value={m.toString()}>{m} min</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Two Column Grid for Clinics */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Morning Clinic */}
        <div className="rounded-xl border-2 border-morning/30 overflow-hidden bg-gradient-to-br from-morning-light via-background to-background">
          {/* Header */}
          <div className="bg-gradient-morning px-4 py-2.5 flex items-center gap-2">
            <Sun className="h-5 w-5 text-white" />
            <span className="font-semibold text-white text-sm">Morning Session</span>
          </div>

          <div className="p-3 space-y-3">
            {/* Clinic Info */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
                  <Building2 className="h-3 w-3" /> Clinic Name
                </Label>
                <Input
                  value={formData.morning_clinic_name}
                  onChange={(e) => updateFormData({ morning_clinic_name: e.target.value })}
                  className="h-8 text-xs border-morning/20 focus:border-morning"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
                  <MapPin className="h-3 w-3" /> Address
                </Label>
                <Input
                  value={formData.morning_clinic_address}
                  onChange={(e) => updateFormData({ morning_clinic_address: e.target.value })}
                  className="h-8 text-xs border-morning/20 focus:border-morning"
                  placeholder="Enter address"
                />
              </div>
            </div>

            {/* Time Settings */}
            <div className="bg-morning-light/60 rounded-lg p-2 space-y-1 border border-morning/10">
              <TimeRow
                icon={<Clock className="h-3.5 w-3.5 text-morning" />}
                label="Clinic Hours"
                startValue={formData.morning_start_time}
                endValue={formData.morning_end_time}
                onStartChange={(v) => updateFormData({ morning_start_time: v })}
                onEndChange={(v) => updateFormData({ morning_end_time: v })}
                variant="morning"
              />
              <TimeRow
                icon={<CalendarClock className="h-3.5 w-3.5 text-morning" />}
                label="Booking Window"
                startValue={formData.morning_booking_open_time}
                endValue={formData.morning_booking_close_time}
                onStartChange={(v) => updateFormData({ morning_booking_open_time: v })}
                onEndChange={(v) => updateFormData({ morning_booking_close_time: v })}
                variant="morning"
              />
            </div>
          </div>
        </div>

        {/* Evening Clinic */}
        <div className="rounded-xl border-2 border-evening/30 overflow-hidden bg-gradient-to-br from-evening-light via-background to-background">
          {/* Header */}
          <div className="bg-gradient-evening px-4 py-2.5 flex items-center gap-2">
            <Moon className="h-5 w-5 text-white" />
            <span className="font-semibold text-white text-sm">Evening Session</span>
          </div>

          <div className="p-3 space-y-3">
            {/* Clinic Info */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
                  <Building2 className="h-3 w-3" /> Clinic Name
                </Label>
                <Input
                  value={formData.evening_clinic_name}
                  onChange={(e) => updateFormData({ evening_clinic_name: e.target.value })}
                  className="h-8 text-xs border-evening/20 focus:border-evening"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
                  <MapPin className="h-3 w-3" /> Address
                </Label>
                <Input
                  value={formData.evening_clinic_address}
                  onChange={(e) => updateFormData({ evening_clinic_address: e.target.value })}
                  className="h-8 text-xs border-evening/20 focus:border-evening"
                  placeholder="Enter address"
                />
              </div>
            </div>

            {/* Time Settings */}
            <div className="bg-evening-light/60 rounded-lg p-2 space-y-1 border border-evening/10">
              <TimeRow
                icon={<Clock className="h-3.5 w-3.5 text-evening" />}
                label="Clinic Hours"
                startValue={formData.evening_start_time}
                endValue={formData.evening_end_time}
                onStartChange={(v) => updateFormData({ evening_start_time: v })}
                onEndChange={(v) => updateFormData({ evening_end_time: v })}
                variant="evening"
              />
              <TimeRow
                icon={<CalendarClock className="h-3.5 w-3.5 text-evening" />}
                label="Booking Window"
                startValue={formData.evening_booking_open_time}
                endValue={formData.evening_booking_close_time}
                onStartChange={(v) => updateFormData({ evening_booking_open_time: v })}
                onEndChange={(v) => updateFormData({ evening_booking_close_time: v })}
                variant="evening"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <Button 
        onClick={saveSettings} 
        disabled={isSaving || !hasChanges}
        className={`w-full gap-2 h-11 text-sm font-semibold transition-all ${
          hasChanges 
            ? 'bg-gradient-hero hover:opacity-90 shadow-lg' 
            : 'bg-muted text-muted-foreground'
        }`}
        size="lg"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving Changes...
          </>
        ) : hasChanges ? (
          <>
            <Save className="h-4 w-4" />
            Save All Changes
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            All Changes Saved
          </>
        )}
      </Button>
    </div>
  );
}
