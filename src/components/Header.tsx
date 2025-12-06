import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Stethoscope, Settings, Menu, User, MapPin, Phone, Home, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/about', label: 'About Doctor', icon: User },
  { href: '/clinics', label: 'Clinic Locations', icon: MapPin },
  { href: '/contact', label: 'Contact Us', icon: Phone },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-hero">
            <Stethoscope className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold leading-tight">HomeoClinic</h1>
            <p className="text-xs text-muted-foreground">Appointment Booking</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2 text-muted-foreground hover:text-foreground",
                  location.pathname === link.href && "bg-primary/10 text-primary"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}
          <div className="ml-2 h-6 w-px bg-border" />
          <Link to="/admin">
            <Button variant="outline" size="sm" className="gap-2 ml-2">
              <Settings className="h-4 w-4" />
              Admin
            </Button>
          </Link>
        </nav>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 md:hidden">
          <Link to="/admin">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-hero">
                    <Stethoscope className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold">HomeoClinic</h2>
                    <p className="text-xs text-muted-foreground">Navigation Menu</p>
                  </div>
                </div>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
                        location.pathname === link.href && "bg-primary/10 text-primary"
                      )}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
