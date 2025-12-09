import { Header } from '@/components/Header';
import { BookingCard } from '@/components/BookingCard';
import { Stethoscope, Leaf, Heart, Shield, Users, Sparkles, Clock, Award, TrendingUp, CheckCircle2, Quote, Star, MapPin, Phone, Mail } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 sm:py-8 space-y-8 sm:space-y-12 px-4 sm:px-6">
        {/* Hero Section */}
        <section className="text-center space-y-4 sm:space-y-6 animate-fade-in relative px-4">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent rounded-3xl blur-3xl" />
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-primary border border-primary/20 shadow-sm">
            <Leaf className="h-3 w-3 sm:h-4 sm:w-4" />
            Natural Healing, Modern Care
          </div>
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold text-balance bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text px-4">
            Book Your <span className="text-primary">Homeopathic</span> Consultation
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
            Experience personalized holistic healthcare. Book your appointment online and receive 
            your queue number instantly.
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 pt-2 sm:pt-4 px-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-muted-foreground">Online Booking</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span className="text-muted-foreground">Instant Queue</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Award className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span className="text-muted-foreground">Expert Care</span>
            </div>
          </div>
        </section>

        {/* Booking Cards */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="animate-fade-in stagger-1 transform transition-all duration-300 hover:scale-[1.02]">
            <BookingCard slotType="morning" />
          </div>
          <div className="animate-fade-in stagger-2 transform transition-all duration-300 hover:scale-[1.02]">
            <BookingCard slotType="evening" />
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 animate-fade-in stagger-3">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">15+</div>
            <p className="text-xs sm:text-sm text-muted-foreground">years of experience</p>
          </div>
          <div className="h-12 w-px bg-border hidden sm:block"></div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">5000+</div>
            <p className="text-xs sm:text-sm text-muted-foreground">patients served</p>
          </div>
        </section>

        {/* Why Choose Homeopathy Section */}
        <section className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-card via-card to-primary/5 border border-primary/10 p-6 sm:p-8 lg:p-12 animate-fade-in stagger-4 shadow-lg overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-primary/5 rounded-full blur-3xl -z-0"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-primary/5 rounded-full blur-3xl -z-0"></div>
          <div className="relative z-10">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                Why Choose <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Homeopathy</span>?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-4">
                Discover the time-tested benefits of homeopathic medicine for comprehensive wellness
              </p>
            </div>
            <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-3 sm:space-y-4 p-5 sm:p-6 lg:p-7 rounded-xl sm:rounded-2xl bg-background/60 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl group">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300">
                  <Leaf className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold">Holistic Approach</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Treats the whole person - mind, body, and spirit - not just symptoms, addressing root causes for lasting wellness.
                </p>
              </div>
              <div className="space-y-3 sm:space-y-4 p-5 sm:p-6 lg:p-7 rounded-xl sm:rounded-2xl bg-background/60 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl group">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300">
                  <Shield className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold">Safe & Gentle</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Natural remedies with no side effects, suitable for all ages from infants to elderly, and safe during pregnancy.
                </p>
              </div>
              <div className="space-y-3 sm:space-y-4 p-5 sm:p-6 lg:p-7 rounded-xl sm:rounded-2xl bg-background/60 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl group">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300">
                  <Heart className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold">Individualized Care</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Each treatment plan is customized to your unique symptoms, personality, and health history for optimal results.
                </p>
              </div>
              <div className="space-y-3 sm:space-y-4 p-5 sm:p-6 lg:p-7 rounded-xl sm:rounded-2xl bg-background/60 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl group">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300">
                  <Stethoscope className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold">Treats Chronic Conditions</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Effective for long-standing ailments like allergies, migraines, arthritis, and digestive disorders where conventional medicine has limitations.
                </p>
              </div>
              <div className="space-y-3 sm:space-y-4 p-5 sm:p-6 lg:p-7 rounded-xl sm:rounded-2xl bg-background/60 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl group">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300">
                  <Users className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold">Boosts Immunity</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Strengthens your body's natural defense mechanisms, reducing susceptibility to infections and promoting overall vitality.
                </p>
              </div>
              <div className="space-y-3 sm:space-y-4 p-5 sm:p-6 lg:p-7 rounded-xl sm:rounded-2xl bg-background/60 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl group">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300">
                  <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold">Cost-Effective</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Affordable treatment with long-lasting benefits, reducing the need for repeated medications and hospital visits.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Homeopathy Principles */}
        <section className="rounded-2xl sm:rounded-3xl border border-primary/10 bg-gradient-to-br from-card to-primary/5 p-6 sm:p-8 lg:p-12 animate-fade-in stagger-5">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              Core <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Principles</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-4">
              Founded on scientific principles that have stood the test of time
            </p>
          </div>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
            <div className="flex gap-3 sm:gap-4 p-5 sm:p-6 lg:p-7 rounded-xl sm:rounded-2xl bg-background/60 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl group">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300">
                  <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="font-display text-base sm:text-lg font-bold">Like Cures Like</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  A substance that causes symptoms in a healthy person can cure similar symptoms in a sick person when given in minute doses.
                </p>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4 p-5 sm:p-6 lg:p-7 rounded-xl sm:rounded-2xl bg-background/60 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl group">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300">
                  <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="font-display text-base sm:text-lg font-bold">Minimum Dose</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Highly diluted remedies are more effective and safe, stimulating the body's healing response without toxic effects.
                </p>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4 p-5 sm:p-6 lg:p-7 rounded-xl sm:rounded-2xl bg-background/60 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl group">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300">
                  <Heart className="h-6 w-6 sm:h-7 sm:w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="font-display text-base sm:text-lg font-bold">Individualization</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Every patient is unique. Treatment considers your physical symptoms, emotional state, and life circumstances.
                </p>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4 p-5 sm:p-6 lg:p-7 rounded-xl sm:rounded-2xl bg-background/60 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl group">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300">
                  <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="font-display text-base sm:text-lg font-bold">Vital Force</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Disease results from disturbance of the body's vital force. Homeopathy strengthens this innate healing energy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Conditions We Treat */}
        <section className="rounded-2xl sm:rounded-3xl border border-primary/10 bg-gradient-to-b from-card to-primary/5 p-6 sm:p-8 lg:p-12 animate-fade-in stagger-6 shadow-lg">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              Conditions We <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Treat</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-4">
              Comprehensive homeopathic solutions for a wide range of health concerns
            </p>
          </div>
          <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-2 lg:grid-cols-4">
            <div className="group rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 lg:p-6 text-center border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl">
              <p className="font-bold text-sm sm:text-base mb-1 sm:mb-2">Respiratory Issues</p>
              <p className="text-xs text-muted-foreground">Asthma, allergies, sinusitis, bronchitis</p>
            </div>
            <div className="group rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 lg:p-6 text-center border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl">
              <p className="font-bold text-sm sm:text-base mb-1 sm:mb-2">Skin Disorders</p>
              <p className="text-xs text-muted-foreground">Eczema, psoriasis, acne, urticaria</p>
            </div>
            <div className="group rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 lg:p-6 text-center border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl">
              <p className="font-bold text-sm sm:text-base mb-1 sm:mb-2">Digestive Problems</p>
              <p className="text-xs text-muted-foreground">IBS, acidity, constipation, colitis</p>
            </div>
            <div className="group rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 lg:p-6 text-center border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl">
              <p className="font-bold text-sm sm:text-base mb-1 sm:mb-2">Joint & Muscle Pain</p>
              <p className="text-xs text-muted-foreground">Arthritis, back pain, gout, sciatica</p>
            </div>
            <div className="group rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 lg:p-6 text-center border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl">
              <p className="font-bold text-sm sm:text-base mb-1 sm:mb-2">Women's Health</p>
              <p className="text-xs text-muted-foreground">PCOD, menstrual issues, menopause</p>
            </div>
            <div className="group rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 lg:p-6 text-center border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl">
              <p className="font-bold text-sm sm:text-base mb-1 sm:mb-2">Stress & Anxiety</p>
              <p className="text-xs text-muted-foreground">Depression, insomnia, panic attacks</p>
            </div>
            <div className="group rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 lg:p-6 text-center border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl">
              <p className="font-bold text-sm sm:text-base mb-1 sm:mb-2">Lifestyle Diseases</p>
              <p className="text-xs text-muted-foreground">Thyroid, diabetes support, obesity</p>
            </div>
            <div className="group rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 lg:p-6 text-center border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl">
              <p className="font-bold text-sm sm:text-base mb-1 sm:mb-2">Children's Health</p>
              <p className="text-xs text-muted-foreground">Cold, cough, growth issues, ADHD</p>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden animate-fade-in stagger-7">
          {/* Background with gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1)_0%,transparent_40%)]" />
          
          <div className="relative z-10 p-6 sm:p-8 lg:p-12">
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-1.5 text-xs sm:text-sm font-medium text-white mb-4">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-white" />
                Patient Testimonials
              </div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-white">
                Trusted by <span className="text-white/90">Thousands</span>
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto text-sm sm:text-base">
                Real stories from real patients who found healing through homeopathy
              </p>
            </div>
            
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
              {/* Testimonial 1 */}
              <div className="relative group">
                <div className="absolute inset-0 bg-white/10 rounded-xl sm:rounded-2xl blur-xl group-hover:bg-white/20 transition-all duration-500" />
                <div className="relative bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-7 border border-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-1">
                  <Quote className="h-8 w-8 text-white/30 mb-3" />
                  <div className="flex gap-1 mb-3 sm:mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-white/90 mb-4 leading-relaxed">
                    "After years of struggling with chronic migraines, homeopathic treatment gave me my life back. The personalized care made all the difference."
                  </p>
                  <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                      P
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">Priya Sharma</p>
                      <p className="text-white/60 text-xs">Patient since 2022</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Testimonial 2 - Featured */}
              <div className="relative group md:-mt-4 md:mb-4">
                <div className="absolute inset-0 bg-white/20 rounded-xl sm:rounded-2xl blur-xl group-hover:bg-white/30 transition-all duration-500" />
                <div className="relative bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-7 shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  <Quote className="h-8 w-8 text-primary/30 mb-3" />
                  <div className="flex gap-1 mb-3 sm:mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-foreground mb-4 leading-relaxed">
                    "My daughter's recurring respiratory problems are now completely under control thanks to homeopathy. No more antibiotics and side effects!"
                  </p>
                  <div className="flex items-center gap-3 pt-3 border-t border-border">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      R
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">Rajesh Kumar</p>
                      <p className="text-muted-foreground text-xs">Patient since 2021</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Testimonial 3 */}
              <div className="relative group">
                <div className="absolute inset-0 bg-white/10 rounded-xl sm:rounded-2xl blur-xl group-hover:bg-white/20 transition-all duration-500" />
                <div className="relative bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-7 border border-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-1">
                  <Quote className="h-8 w-8 text-white/30 mb-3" />
                  <div className="flex gap-1 mb-3 sm:mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-white/90 mb-4 leading-relaxed">
                    "The doctor takes time to understand every aspect of my health. The holistic approach helped me overcome anxiety naturally."
                  </p>
                  <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                      A
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">Anjali Mehta</p>
                      <p className="text-white/60 text-xs">Patient since 2023</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-8 sm:mt-12 pt-8 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">4.9/5</div>
                <p className="text-white/60 text-xs sm:text-sm">Average Rating</p>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">500+</div>
                <p className="text-white/60 text-xs sm:text-sm">Happy Reviews</p>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">98%</div>
                <p className="text-white/60 text-xs sm:text-sm">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="rounded-2xl sm:rounded-3xl bg-gradient-card border border-primary/10 p-6 sm:p-8 lg:p-12 animate-fade-in stagger-8">
          <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3">
            <div className="text-center space-y-3 sm:space-y-4 group">
              <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300">
                <Stethoscope className="h-7 w-7 sm:h-8 sm:w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold">Expert Care</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Experienced homeopathic physician dedicated to your holistic well-being
              </p>
            </div>
            <div className="text-center space-y-3 sm:space-y-4 group">
              <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300">
                <Heart className="h-7 w-7 sm:h-8 sm:w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold">Personalized Treatment</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Individual attention with treatments tailored to your unique constitution
              </p>
            </div>
            <div className="text-center space-y-3 sm:space-y-4 group">
              <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300">
                <Leaf className="h-7 w-7 sm:h-8 sm:w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold">Natural Remedies</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Safe, gentle medicines that work with your body's natural healing process
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative mt-12 sm:mt-16 overflow-hidden">
        {/* Top wave decoration */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        <div className="bg-gradient-to-b from-card via-card to-primary/5">
          <div className="container py-10 sm:py-16 px-4">
            <div className="grid gap-8 sm:gap-12 grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
              {/* Brand Section */}
              <div className="md:col-span-1 lg:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Leaf className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-display text-xl sm:text-2xl font-bold">HomeoClinic</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                  Dedicated to providing natural, holistic healthcare through the science of homeopathy. 
                  Your wellness journey begins here.
                </p>
                <div className="flex gap-3 pt-2">
                  <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                    <Phone className="h-4 w-4" />
                  </a>
                  <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                    <Mail className="h-4 w-4" />
                  </a>
                  <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                    <MapPin className="h-4 w-4" />
                  </a>
                </div>
              </div>
              
              {/* Quick Links */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-sm uppercase tracking-wider text-primary">Quick Links</h3>
                <ul className="space-y-2">
                  <li><a href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</a></li>
                  <li><a href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</a></li>
                  <li><a href="/clinics" className="text-sm text-muted-foreground hover:text-primary transition-colors">Our Clinics</a></li>
                  <li><a href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
                </ul>
              </div>
              
              {/* Clinic Hours */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-sm uppercase tracking-wider text-primary">Clinic Hours</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex justify-between gap-4">
                    <span>Morning</span>
                    <span className="font-medium text-foreground">10:00 AM - 1:00 PM</span>
                  </li>
                  <li className="flex justify-between gap-4">
                    <span>Evening</span>
                    <span className="font-medium text-foreground">5:00 PM - 8:00 PM</span>
                  </li>
                  <li className="flex justify-between gap-4">
                    <span>Sunday</span>
                    <span className="font-medium text-muted-foreground">Closed</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Bottom Bar */}
            <div className="mt-10 sm:mt-12 pt-6 border-t border-border/50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  © {new Date().getFullYear()} HomeoClinic. All rights reserved.
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                  Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for your wellness
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;