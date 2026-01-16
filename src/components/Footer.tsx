import { Link } from 'react-router-dom';
import { Leaf, Phone, Mail, MapPin, Heart, Clock, ArrowUpRight } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Our Clinics', href: '/clinics' },
    { name: 'Contact', href: '/contact' },
    { name: 'Book Appointment', href: '/book' },
  ];

  return (
    <footer className="relative mt-16 overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      
      {/* Main footer content */}
      <div className="bg-gradient-to-b from-card via-card/95 to-primary/5">
        <div className="w-[85%] mx-auto py-12 sm:py-16 px-4">
          <div className="grid gap-10 sm:gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Brand Section */}
            <div className="sm:col-span-2 lg:col-span-1 space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
                  <Leaf className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="font-display text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  HomeoClinic
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Dedicated to providing natural, holistic healthcare through the science of homeopathy. 
                Your wellness journey begins here.
              </p>
              
              {/* Social/Contact Icons */}
              <div className="flex gap-2 pt-1">
                <a 
                  href="tel:+91XXXXXXXXXX" 
                  className="group flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
                  aria-label="Call us"
                >
                  <Phone className="h-4 w-4 transition-transform group-hover:scale-110" />
                </a>
                <a 
                  href="mailto:clinic@example.com" 
                  className="group flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
                  aria-label="Email us"
                >
                  <Mail className="h-4 w-4 transition-transform group-hover:scale-110" />
                </a>
                <a 
                  href="/clinics" 
                  className="group flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
                  aria-label="Find us"
                >
                  <MapPin className="h-4 w-4 transition-transform group-hover:scale-110" />
                </a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="space-y-5">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-primary flex items-center gap-2">
                <div className="h-1 w-6 rounded-full bg-primary/60" />
                Quick Links
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href} 
                      className="group text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {link.name}
                      <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Clinic Hours */}
            <div className="space-y-5">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-primary flex items-center gap-2">
                <div className="h-1 w-6 rounded-full bg-primary/60" />
                Clinic Hours
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3 p-3 rounded-xl bg-morning-light/50">
                  <Clock className="h-4 w-4 text-morning flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-muted-foreground">Morning</span>
                    <p className="font-medium text-foreground">10:00 AM - 1:00 PM</p>
                  </div>
                </li>
                <li className="flex items-center gap-3 p-3 rounded-xl bg-evening-light/50">
                  <Clock className="h-4 w-4 text-evening flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-muted-foreground">Evening</span>
                    <p className="font-medium text-foreground">5:00 PM - 8:00 PM</p>
                  </div>
                </li>
                <li className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-muted-foreground">Sunday</span>
                    <p className="font-medium text-muted-foreground">Closed</p>
                  </div>
                </li>
              </ul>
            </div>
            
            {/* Newsletter / CTA */}
            <div className="space-y-5">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-primary flex items-center gap-2">
                <div className="h-1 w-6 rounded-full bg-primary/60" />
                Get Started
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Experience the healing power of homeopathy. Book your consultation today.
              </p>
              <Link
                to="/book"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02]"
              >
                Book Appointment
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-border/30">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                © {currentYear} HomeoClinic. All rights reserved.
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                Made with 
                <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 animate-pulse" /> 
                for better health
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative bottom gradient */}
      <div className="h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
    </footer>
  );
}
