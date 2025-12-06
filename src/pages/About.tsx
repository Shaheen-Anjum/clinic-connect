import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Award, BookOpen, Heart, Stethoscope, GraduationCap, Users } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4 animate-fade-in">
          <h1 className="font-display text-4xl sm:text-5xl font-bold">
            About <span className="text-primary">Your Doctor</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dedicated to providing compassionate homeopathic care with years of expertise in natural healing.
          </p>
        </section>

        {/* Doctor Profile */}
        <section className="grid gap-8 lg:grid-cols-2 items-center animate-fade-in stagger-1">
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-hero flex items-center justify-center">
              <Stethoscope className="h-32 w-32 text-primary-foreground/80" />
            </div>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-accent/20 blur-2xl" />
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground">Dr. [Doctor Name]</h2>
              <p className="text-lg text-primary font-medium">BHMS, MD (Homeopathy)</p>
            </div>
            
            <p className="text-muted-foreground leading-relaxed">
              With over 15 years of experience in homeopathic medicine, our doctor has helped thousands 
              of patients find relief through natural, holistic treatments. Specializing in chronic 
              conditions, pediatric care, and women's health, the practice focuses on treating the 
              whole person rather than just symptoms.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">15+ Years</p>
                  <p className="text-xs text-muted-foreground">Experience</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">10,000+</p>
                  <p className="text-xs text-muted-foreground">Patients Treated</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Qualifications & Specializations */}
        <section className="space-y-8 animate-fade-in stagger-2">
          <h2 className="font-display text-2xl font-bold text-center">Expertise & Specializations</h2>
          
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-gradient-card border shadow-card">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Award className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold">Chronic Diseases</h3>
                <p className="text-sm text-muted-foreground">
                  Specialized treatment for allergies, skin conditions, digestive disorders, and autoimmune conditions.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-card border shadow-card">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Heart className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold">Women's Health</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive care for hormonal imbalances, PCOS, menstrual disorders, and pregnancy support.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-card border shadow-card">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <BookOpen className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold">Pediatric Care</h3>
                <p className="text-sm text-muted-foreground">
                  Gentle, safe treatments for children including immunity boosting and developmental support.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Philosophy */}
        <section className="rounded-2xl bg-primary/5 p-8 text-center space-y-4 animate-fade-in stagger-3">
          <h2 className="font-display text-2xl font-bold">Our Healing Philosophy</h2>
          <blockquote className="text-lg text-muted-foreground italic max-w-3xl mx-auto">
            "Homeopathy treats the individual, not just the disease. By understanding each patient's 
            unique constitution and symptoms, we unlock the body's innate ability to heal itself 
            naturally and permanently."
          </blockquote>
          <p className="text-sm font-medium text-primary">— Dr. [Doctor Name]</p>
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

export default About;
