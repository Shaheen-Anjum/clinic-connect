import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Clock, MessageCircle } from 'lucide-react';

const Contact = () => {
  const phoneNumber = "+91 XXXXX XXXXX"; // Replace with actual number
  const email = "clinic@homeoclinic.com"; // Replace with actual email
  const whatsappNumber = "91XXXXXXXXXX"; // Replace with actual WhatsApp number

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4 animate-fade-in">
          <h1 className="font-display text-4xl sm:text-5xl font-bold">
            <span className="text-primary">Contact</span> Us
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions or need assistance? We're here to help you on your journey to better health.
          </p>
        </section>

        {/* Contact Cards */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in stagger-1">
          <Card className="bg-gradient-card border shadow-card hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-3">
                <Phone className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="font-display text-lg">Call Us</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <p className="text-muted-foreground text-sm">For appointments and inquiries</p>
              <a href={`tel:${phoneNumber.replace(/\s/g, '')}`}>
                <Button variant="outline" className="w-full">
                  {phoneNumber}
                </Button>
              </a>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border shadow-card hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 mb-3">
                <MessageCircle className="h-7 w-7 text-success" />
              </div>
              <CardTitle className="font-display text-lg">WhatsApp</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <p className="text-muted-foreground text-sm">Quick responses via WhatsApp</p>
              <a 
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-success hover:bg-success/90 text-success-foreground">
                  Chat on WhatsApp
                </Button>
              </a>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border shadow-card hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 mb-3">
                <Mail className="h-7 w-7 text-accent" />
              </div>
              <CardTitle className="font-display text-lg">Email Us</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <p className="text-muted-foreground text-sm">For detailed queries and reports</p>
              <a href={`mailto:${email}`}>
                <Button variant="outline" className="w-full">
                  {email}
                </Button>
              </a>
            </CardContent>
          </Card>
        </section>

        {/* Consultation Hours */}
        <section className="animate-fade-in stagger-2">
          <Card className="bg-gradient-card border shadow-card">
            <CardHeader className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-3">
                <Clock className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="font-display text-2xl">Consultation Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 max-w-2xl mx-auto">
                <div className="rounded-xl bg-morning-light p-6 text-center border border-morning/20">
                  <h3 className="font-display text-lg font-semibold text-morning mb-2">Morning Session</h3>
                  <p className="text-2xl font-bold text-foreground">10:00 AM - 1:00 PM</p>
                  <p className="text-sm text-muted-foreground mt-2">Clinic A (Morning Location)</p>
                  <p className="text-xs text-muted-foreground mt-1">Booking opens at 9:00 AM</p>
                </div>
                <div className="rounded-xl bg-evening-light p-6 text-center border border-evening/20">
                  <h3 className="font-display text-lg font-semibold text-evening mb-2">Evening Session</h3>
                  <p className="text-2xl font-bold text-foreground">5:00 PM - 8:00 PM</p>
                  <p className="text-sm text-muted-foreground mt-2">Clinic B (Evening Location)</p>
                  <p className="text-xs text-muted-foreground mt-1">Booking opens at 6:00 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Note */}
        <section className="text-center animate-fade-in stagger-3">
          <div className="inline-block rounded-xl bg-muted/50 px-6 py-4">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> For emergencies, please call our direct number. 
              Online booking is available during specified hours only.
            </p>
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

export default Contact;
