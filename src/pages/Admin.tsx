import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AvailabilityToggle } from '@/components/admin/AvailabilityToggle';
import { QueueManagement } from '@/components/admin/QueueManagement';
import { SettingsPanel } from '@/components/admin/SettingsPanel';
import { DoctorDashboard } from '@/components/admin/DoctorDashboard';
import { StaffManagement } from '@/components/admin/StaffManagement';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Home, LogOut, Users, Settings, LayoutDashboard, UserCog } from 'lucide-react';
import { format } from 'date-fns';

const Admin = () => {
  const navigate = useNavigate();
  const { user, role, isLoading, signOut, isDoctor, isStaff } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || !isStaff)) {
      navigate('/auth');
    }
  }, [user, isStaff, isLoading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !isStaff) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-hero">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg font-semibold leading-tight">Admin Dashboard</h1>
                <Badge variant={role === 'doctor' ? 'default' : 'secondary'} className="capitalize">
                  {role}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Patient View</span>
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Availability Toggle */}
        <div className="animate-fade-in">
          <AvailabilityToggle />
        </div>

        {/* Tabs */}
        <Tabs defaultValue={isDoctor ? "dashboard" : "queues"} className="animate-fade-in stagger-1">
          <TabsList className={`grid w-full ${isDoctor ? 'grid-cols-4 lg:w-[600px]' : 'grid-cols-2 lg:w-[400px]'}`}>
            {isDoctor && (
              <TabsTrigger value="dashboard" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="queues" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Queues</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            {isDoctor && (
              <TabsTrigger value="staff" className="gap-2">
                <UserCog className="h-4 w-4" />
                <span className="hidden sm:inline">Staff</span>
              </TabsTrigger>
            )}
          </TabsList>

          {isDoctor && (
            <TabsContent value="dashboard" className="mt-6">
              <DoctorDashboard />
            </TabsContent>
          )}

          <TabsContent value="queues" className="mt-6 space-y-6">
            <div className="grid gap-6 xl:grid-cols-2">
              <QueueManagement slotType="morning" />
              <QueueManagement slotType="evening" />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <SettingsPanel />
          </TabsContent>

          {isDoctor && (
            <TabsContent value="staff" className="mt-6">
              <StaffManagement />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
