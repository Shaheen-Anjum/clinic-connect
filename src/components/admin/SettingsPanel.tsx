import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Save, Loader2, Sun, Moon, Clock, MapPin, Building2, Timer } from 'lucide-react';

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
}

function CompactTimePicker({ value, onChange }: CompactTimePickerProps) {
  const { hour, minute, period } = convertTo12Hour(value);

  const handleChange = (newHour: string, newMinute: string, newPeriod: 'AM' | 'PM') => {
    onChange(convertTo24Hour(newHour, newMinute, newPeriod));
  };

  return (
    <div className="flex items-center gap-0.5">
      <Select value={hour} onValueChange={(h) => handleChange(h, minute, period)}>
        <SelectTrigger className="w-12 h-7 text-xs px-2 border-0 bg-muted/50">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map((h) => (
            <SelectItem key={h} value={h} className="text-xs">{h}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground text-xs">:</span>
      <Select value={minute} onValueChange={(m) => handleChange(hour, m, period)}>
        <SelectTrigger className="w-12 h-7 text-xs px-2 border-0 bg-muted/50">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {['00', '15', '30', '45'].map((m) => (
            <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={period} onValueChange={(p) => handleChange(hour, minute, p as 'AM' | 'PM')}>
        <SelectTrigger className="w-12 h-7 text-xs px-2 border-0 bg-muted/50">
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

interface TimeRangeProps {
  label: string;
  startValue: string;
  endValue: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
}

function TimeRange({ label, startValue, endValue, onStartChange, onEndChange }: TimeRangeProps) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <span className="text-xs text-muted-foreground font-medium min-w-[70px]">{label}</span>
      <div className="flex items-center gap-1">
        <CompactTimePicker value={startValue} onChange={onStartChange} />
        <span className="text-muted-foreground text-xs px-1">–</span>
        <CompactTimePicker value={endValue} onChange={onEndChange} />
      </div>
    </div>
  );
}

interface ClinicSectionProps {
  type: 'morning' | 'evening';
  icon: React.ReactNode;
  title: string;
  clinicName: string;
  clinicAddress: string;
  startTime: string;
  endTime: string;
  bookingOpenTime: string;
  bookingCloseTime: string;
  onUpdate: (updates: Partial<FormSettings>) => void;
}

function ClinicSection({
  type,
  icon,
  title,
  clinicName,
  clinicAddress,
  startTime,
  endTime,
  bookingOpenTime,
  bookingCloseTime,
  onUpdate,
}: ClinicSectionProps) {
  const prefix = type === 'morning' ? 'morning' : 'evening';
  const gradientClass = type === 'morning' ? 'from-morning/20 to-morning/5' : 'from-evening/20 to-evening/5';
  const borderClass = type === 'morning' ? 'border-morning/30' : 'border-evening/30';
  const iconBgClass = type === 'morning' ? 'bg-morning/10 text-morning' : 'bg-evening/10 text-evening';

  return (
    <div className={`rounded-xl border ${borderClass} bg-gradient-to-br ${gradientClass} overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
        <div className={`p-1.5 rounded-lg ${iconBgClass}`}>
          {icon}
        </div>
        <span className="font-medium text-sm">{title}</span>
      </div>

      <div className="p-3 space-y-3">
        {/* Clinic Info */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3 text-muted-foreground" />
              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Name</Label>
            </div>
            <Input
              value={clinicName}
              onChange={(e) => onUpdate({ [`${prefix}_clinic_name`]: e.target.value })}
              className="h-7 text-xs"
              placeholder="Clinic name"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Address</Label>
            </div>
            <Input
              value={clinicAddress}
              onChange={(e) => onUpdate({ [`${prefix}_clinic_address`]: e.target.value })}
              className="h-7 text-xs"
              placeholder="Address"
            />
          </div>
        </div>

        {/* Time Settings */}
        <div className="bg-background/60 rounded-lg p-2 space-y-0.5">
          <TimeRange
            label="Clinic Hours"
            startValue={startTime}
            endValue={endTime}
            onStartChange={(v) => onUpdate({ [`${prefix}_start_time`]: v })}
            onEndChange={(v) => onUpdate({ [`${prefix}_end_time`]: v })}
          />
          <TimeRange
            label="Booking"
            startValue={bookingOpenTime}
            endValue={bookingCloseTime}
            onStartChange={(v) => onUpdate({ [`${prefix}_booking_open_time`]: v })}
            onEndChange={(v) => onUpdate({ [`${prefix}_booking_close_time`]: v })}
          />
        </div>
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
    <div className="space-y-3 max-w-2xl mx-auto">
      {/* Consultation Time */}
      <div className="flex items-center justify-between bg-card rounded-xl border p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Timer className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Consultation Duration</p>
            <p className="text-[10px] text-muted-foreground">Time per patient</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select 
            value={formData.minutes_per_patient.toString()} 
            onValueChange={(v) => updateFormData({ minutes_per_patient: parseInt(v) })}
          >
            <SelectTrigger className="w-16 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 7, 10, 12, 15, 20, 25, 30].map((m) => (
                <SelectItem key={m} value={m.toString()}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">min</span>
        </div>
      </div>

      {/* Clinic Sections Grid */}
      <div className="grid gap-3 md:grid-cols-2">
        <ClinicSection
          type="morning"
          icon={<Sun className="h-4 w-4" />}
          title="Morning"
          clinicName={formData.morning_clinic_name}
          clinicAddress={formData.morning_clinic_address}
          startTime={formData.morning_start_time}
          endTime={formData.morning_end_time}
          bookingOpenTime={formData.morning_booking_open_time}
          bookingCloseTime={formData.morning_booking_close_time}
          onUpdate={updateFormData}
        />

        <ClinicSection
          type="evening"
          icon={<Moon className="h-4 w-4" />}
          title="Evening"
          clinicName={formData.evening_clinic_name}
          clinicAddress={formData.evening_clinic_address}
          startTime={formData.evening_start_time}
          endTime={formData.evening_end_time}
          bookingOpenTime={formData.evening_booking_open_time}
          bookingCloseTime={formData.evening_booking_close_time}
          onUpdate={updateFormData}
        />
      </div>

      {/* Save Button */}
      <Button 
        onClick={saveSettings} 
        disabled={isSaving || !hasChanges}
        className="w-full gap-2"
        size="default"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            {hasChanges ? 'Save Changes' : 'All Saved'}
          </>
        )}
      </Button>
    </div>
  );
}
