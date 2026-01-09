import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Sun, Moon, Navigation, Wifi, ParkingCircle, Armchair, Stethoscope, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ClinicSettings {
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

const Clinics = () => {
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('clinic_settings')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching clinic settings:', error);
      } else if (data) {
        setSettings(data);
      }
      setIsLoading(false);
    };

    fetchSettings();
  }, []);

  const openInMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4 animate-fade-in">
          <h1 className="font-display text-4xl sm:text-5xl font-bold">
            Our <span className="text-primary">Clinic</span> Locations
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Visit us at our two convenient locations. Each clinic is equipped to provide you 
            with the best homeopathic care.
          </p>
        </section>

        {/* Clinic Cards */}
        <section className="grid gap-8 lg:grid-cols-2 animate-fade-in stagger-1">
          {/* Morning Clinic */}
          <Card className="overflow-hidden border-2 border-morning/30 shadow-lg">
            <div className="bg-gradient-morning p-6 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-primary-foreground mb-3">
                <Sun className="h-5 w-5" />
                <span className="font-medium">Morning Clinic</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-primary-foreground">
                {settings?.morning_clinic_name || "Morning Clinic"}
              </h2>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-morning/10">
                  <MapPin className="h-5 w-5 text-morning" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Address</h3>
                  <p className="text-muted-foreground">
                    {settings?.morning_clinic_address || "Address not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-morning/10">
                  <Clock className="h-5 w-5 text-morning" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Timing</h3>
                  <p className="text-muted-foreground">
                    {settings ? `${formatTime(settings.morning_start_time)} - ${formatTime(settings.morning_end_time)}` : "Not specified"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Booking: {settings ? `${formatTime(settings.morning_booking_open_time)} - ${formatTime(settings.morning_booking_close_time)}` : "Not specified"}
                  </p>
                </div>
              </div>

              <Button 
                variant="morning" 
                className="w-full gap-2"
                onClick={() => openInMaps(settings?.morning_clinic_address || "")}
                disabled={!settings?.morning_clinic_address}
              >
                <Navigation className="h-4 w-4" />
                Get Directions
              </Button>
            </CardContent>
          </Card>

          {/* Evening Clinic */}
          <Card className="overflow-hidden border-2 border-evening/30 shadow-lg">
            <div className="bg-gradient-evening p-6 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-primary-foreground mb-3">
                <Moon className="h-5 w-5" />
                <span className="font-medium">Evening Clinic</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-primary-foreground">
                {settings?.evening_clinic_name || "Evening Clinic"}
              </h2>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-evening/10">
                  <MapPin className="h-5 w-5 text-evening" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Address</h3>
                  <p className="text-muted-foreground">
                    {settings?.evening_clinic_address || "Address not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-evening/10">
                  <Clock className="h-5 w-5 text-evening" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Timing</h3>
                  <p className="text-muted-foreground">
                    {settings ? `${formatTime(settings.evening_start_time)} - ${formatTime(settings.evening_end_time)}` : "Not specified"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Booking: {settings ? `${formatTime(settings.evening_booking_open_time)} - ${formatTime(settings.evening_booking_close_time)}` : "Not specified"}
                  </p>
                </div>
              </div>

              <Button 
                variant="evening" 
                className="w-full gap-2"
                onClick={() => openInMaps(settings?.evening_clinic_address || "")}
                disabled={!settings?.evening_clinic_address}
              >
                <Navigation className="h-4 w-4" />
                Get Directions
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Facilities Section */}
        <section className="space-y-6 animate-fade-in stagger-2">
          <h2 className="text-2xl font-display font-bold text-center">
            Clinic <span className="text-primary">Facilities</span>
          </h2>
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="bg-gradient-card border shadow-card">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Wifi className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold">Free WiFi</h3>
                <p className="text-sm text-muted-foreground">
                  Stay connected while you wait with our complimentary high-speed WiFi.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-card border shadow-card">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <ParkingCircle className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold">Parking Available</h3>
                <p className="text-sm text-muted-foreground">
                  Convenient parking space available for all patients.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-card border shadow-card">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Armchair className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold">Waiting Lounge</h3>
                <p className="text-sm text-muted-foreground">
                  Comfortable seating area with refreshments for your convenience.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-card border shadow-card">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Stethoscope className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold">Modern Equipment</h3>
                <p className="text-sm text-muted-foreground">
                  State-of-the-art diagnostic and treatment equipment.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 py-8 mt-12">
        <div className="container text-center text-muted-foreground">
          <p>© 2024 Homeopathy Clinic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Clinics;
