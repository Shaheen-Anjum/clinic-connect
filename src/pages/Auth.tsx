import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Mail, Lock, User, Phone, ArrowLeft, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  fullName: z.string().trim().min(1, { message: "Name is required" }).max(100),
  phone: z.string().trim().min(10, { message: "Valid phone number required" }).max(15),
});

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signIn, signUp, isLoading, role } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noDoctorsExist, setNoDoctorsExist] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });

  useEffect(() => {
    checkIfDoctorsExist();
  }, []);

  useEffect(() => {
    if (user && role) {
      if (role === 'doctor' || role === 'receptionist') {
        navigate('/admin');
      } else {
        navigate('/my-booking');
      }
    }
  }, [user, role, navigate]);

  const checkIfDoctorsExist = async () => {
    const { data } = await supabase
      .from('user_roles')
      .select('id')
      .eq('role', 'doctor')
      .limit(1);

    setNoDoctorsExist(!data || data.length === 0);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = loginSchema.safeParse(loginData);
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await signIn(loginData.email, loginData.password);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    }

    setIsSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent, asDoctor: boolean = false) => {
    e.preventDefault();
    
    const validation = signupSchema.safeParse(signupData);
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const selectedRole = asDoctor ? 'doctor' : 'patient';

    const { error } = await signUp(
      signupData.email,
      signupData.password,
      signupData.fullName,
      signupData.phone,
      selectedRole
    );

    if (error) {
      let message = error.message;
      if (message.includes('already registered')) {
        message = 'This email is already registered. Please login instead.';
      }
      toast({
        title: "Signup Failed",
        description: message,
        variant: "destructive",
      });
    } else {
      if (asDoctor) {
        toast({
          title: "Doctor Account Created!",
          description: "You can now manage the clinic.",
        });
      } else {
        toast({
          title: "Account Created!",
          description: "You can now track your bookings.",
        });
      }
    }

    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card variant="elevated" className="animate-fade-in">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-hero">
              <Stethoscope className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">Welcome to HomeoClinic</CardTitle>
              <CardDescription className="text-base">
                Sign in to manage your appointments
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-4">
                <form onSubmit={(e) => handleSignup(e, false)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={signupData.fullName}
                        onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={signupData.phone}
                        onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password (min 6 characters)"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating Account...' : 'Create Patient Account'}
                  </Button>

                  {noDoctorsExist && (
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">First-time Setup</span>
                        <Badge variant="secondary" className="text-xs">One-time only</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        No doctor account exists yet. Create the first doctor account to manage the clinic.
                      </p>
                      <Button 
                        type="button"
                        variant="outline" 
                        className="w-full" 
                        size="lg" 
                        disabled={isSubmitting}
                        onClick={(e) => handleSignup(e as any, true)}
                      >
                        {isSubmitting ? 'Creating...' : 'Create Doctor Account'}
                      </Button>
                    </div>
                  )}

                  {!noDoctorsExist && (
                    <p className="text-xs text-muted-foreground text-center">
                      Doctor/Receptionist accounts are created by existing doctors.
                    </p>
                  )}
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;