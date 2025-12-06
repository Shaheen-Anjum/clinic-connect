import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Sun, Moon, Navigation } from 'lucide-react';
import { useBooking } from '@/context/BookingContext';

const Clinics = () => {
  const { settings } = useBooking();

  const openInMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

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
                {settings.morningClinic.name || "Clinic A"}
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
                    {settings.morningClinic.address || "Address not specified. Please check admin settings."}
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
                    {settings.morningClinic.startTime} - {settings.morningClinic.endTime}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Booking opens at {settings.morningClinic.bookingOpenTime}
                  </p>
                </div>
              </div>

              <Button 
                variant="morning" 
                className="w-full gap-2"
                onClick={() => openInMaps(settings.morningClinic.address || "Clinic A")}
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
                {settings.eveningClinic.name || "Clinic B"}
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
                    {settings.eveningClinic.address || "Address not specified. Please check admin settings."}
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
                    {settings.eveningClinic.startTime} - {settings.eveningClinic.endTime}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Booking opens at {settings.eveningClinic.bookingOpenTime}
                  </p>
                </div>
              </div>

              <Button 
                variant="evening" 
                className="w-full gap-2"
                onClick={() => openInMaps(settings.eveningClinic.address || "Clinic B")}
              >
                <Navigation className="h-4 w-4" />
                Get Directions
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Facilities */}
        <section className="rounded-2xl bg-gradient-card border p-8 animate-fade-in stagger-2">
          <h2 className="font-display text-2xl font-bold text-center mb-6">Clinic Facilities</h2>
          <div className="grid gap-4 md:grid-cols-4 text-center">
            <div className="p-4">
              <p className="text-2xl mb-2">🏥</p>
              <p className="font-medium">Clean & Hygienic</p>
              <p className="text-sm text-muted-foreground">Sanitized environment</p>
            </div>
            <div className="p-4">
              <p className="text-2xl mb-2">♿</p>
              <p className="font-medium">Accessible</p>
              <p className="text-sm text-muted-foreground">Wheelchair friendly</p>
            </div>
            <div className="p-4">
              <p className="text-2xl mb-2">🅿️</p>
              <p className="font-medium">Parking</p>
              <p className="text-sm text-muted-foreground">Available nearby</p>
            </div>
            <div className="p-4">
              <p className="text-2xl mb-2">🌡️</p>
              <p className="font-medium">Air Conditioned</p>
              <p className="text-sm text-muted-foreground">Comfortable waiting area</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} HomeoClinic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Clinics;
