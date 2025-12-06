import { useBooking } from '@/context/BookingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Settings, Clock, MapPin, Sun, Moon } from 'lucide-react';

export function SettingsPanel() {
  const { settings, updateSettings } = useBooking();

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
            <span className="text-lg font-semibold text-primary">{settings.minutesPerPatient} min</span>
          </div>
          <Slider
            value={[settings.minutesPerPatient]}
            onValueChange={([value]) => updateSettings({ minutesPerPatient: value })}
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
                value={settings.morningClinic.name}
                onChange={(e) => updateSettings({
                  morningClinic: { ...settings.morningClinic, name: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="morning-address">Address</Label>
              <Input
                id="morning-address"
                value={settings.morningClinic.address}
                onChange={(e) => updateSettings({
                  morningClinic: { ...settings.morningClinic, address: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="morning-start">Start Time</Label>
              <Input
                id="morning-start"
                type="time"
                value={settings.morningClinic.startTime}
                onChange={(e) => updateSettings({
                  morningClinic: { ...settings.morningClinic, startTime: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="morning-end">End Time</Label>
              <Input
                id="morning-end"
                type="time"
                value={settings.morningClinic.endTime}
                onChange={(e) => updateSettings({
                  morningClinic: { ...settings.morningClinic, endTime: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="morning-booking">Booking Opens At</Label>
              <Input
                id="morning-booking"
                type="time"
                value={settings.morningClinic.bookingOpenTime}
                onChange={(e) => updateSettings({
                  morningClinic: { ...settings.morningClinic, bookingOpenTime: e.target.value }
                })}
              />
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
                value={settings.eveningClinic.name}
                onChange={(e) => updateSettings({
                  eveningClinic: { ...settings.eveningClinic, name: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evening-address">Address</Label>
              <Input
                id="evening-address"
                value={settings.eveningClinic.address}
                onChange={(e) => updateSettings({
                  eveningClinic: { ...settings.eveningClinic, address: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evening-start">Start Time</Label>
              <Input
                id="evening-start"
                type="time"
                value={settings.eveningClinic.startTime}
                onChange={(e) => updateSettings({
                  eveningClinic: { ...settings.eveningClinic, startTime: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evening-end">End Time</Label>
              <Input
                id="evening-end"
                type="time"
                value={settings.eveningClinic.endTime}
                onChange={(e) => updateSettings({
                  eveningClinic: { ...settings.eveningClinic, endTime: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="evening-booking">Booking Opens At</Label>
              <Input
                id="evening-booking"
                type="time"
                value={settings.eveningClinic.bookingOpenTime}
                onChange={(e) => updateSettings({
                  eveningClinic: { ...settings.eveningClinic, bookingOpenTime: e.target.value }
                })}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
