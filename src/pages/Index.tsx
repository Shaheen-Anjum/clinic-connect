import { Header } from '@/components/Header';
import { StatusBanner } from '@/components/StatusBanner';
import { BookingCard } from '@/components/BookingCard';
import { Stethoscope, Leaf, Heart } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Leaf className="h-4 w-4" />
            Natural Healing, Modern Care
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-balance">
            Book Your <span className="text-primary">Homeopathic</span> Consultation
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience personalized holistic healthcare. Book your appointment online and receive 
            your queue number instantly.
          </p>
        </section>

        {/* Status Banner */}
        <StatusBanner />

        {/* Booking Cards */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="animate-fade-in stagger-1">
            <BookingCard slotType="morning" />
          </div>
          <div className="animate-fade-in stagger-2">
            <BookingCard slotType="evening" />
          </div>
        </section>

        {/* Info Section */}
        <section className="rounded-2xl bg-gradient-card border p-8 animate-fade-in stagger-3">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Stethoscope className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold">Expert Care</h3>
              <p className="text-sm text-muted-foreground">
                Experienced homeopathic physician dedicated to your holistic well-being
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold">Personalized Treatment</h3>
              <p className="text-sm text-muted-foreground">
                Individual attention with treatments tailored to your unique constitution
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Leaf className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold">Natural Remedies</h3>
              <p className="text-sm text-muted-foreground">
                Safe, gentle medicines that work with your body's natural healing process
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} HomeoClinic. All rights reserved.</p>
          <p className="mt-2">Providing quality homeopathic care with love and compassion.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
