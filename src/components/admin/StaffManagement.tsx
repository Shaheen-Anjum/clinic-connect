import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { UserPlus, Shield, Trash2 } from 'lucide-react';
import { z } from 'zod';

interface StaffMember {
  id: string;
  user_id: string;
  role: string;
  email: string;
  full_name: string;
  created_at: string;
}

const inviteSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  fullName: z.string().min(1, { message: "Name is required" }),
  role: z.enum(['doctor', 'receptionist']),
});

export function StaffManagement() {
  const { isDoctor, user } = useAuth();
  const { toast } = useToast();
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'receptionist' as 'doctor' | 'receptionist',
  });

  useEffect(() => {
    fetchStaffMembers();
  }, []);

  const fetchStaffMembers = async () => {
    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('*')
      .in('role', ['doctor', 'receptionist']);

    if (error) {
      console.error('Error fetching staff:', error);
      setIsLoading(false);
      return;
    }

    // Fetch profile info for each staff member
    const staffWithProfiles = await Promise.all(
      (roles || []).map(async (role) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', role.user_id)
          .single();

        // Get email from auth.users is not possible directly, so we'll use the profile
        return {
          id: role.id,
          user_id: role.user_id,
          role: role.role,
          email: '', // We can't get email directly
          full_name: profile?.full_name || 'Unknown',
          created_at: role.created_at,
        };
      })
    );

    setStaffMembers(staffWithProfiles);
    setIsLoading(false);
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = inviteSchema.safeParse(formData);
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      // Create the user with signUp
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Assign role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: formData.role,
          });

        if (roleError) throw roleError;

        toast({
          title: "Staff Member Created",
          description: `${formData.fullName} has been added as ${formData.role}.`,
        });

        setFormData({ email: '', password: '', fullName: '', role: 'receptionist' });
        fetchStaffMembers();
      }
    } catch (error: any) {
      toast({
        title: "Error Creating Staff",
        description: error.message,
        variant: "destructive",
      });
    }

    setIsCreating(false);
  };

  const handleRemoveStaff = async (roleId: string, userId: string) => {
    if (userId === user?.id) {
      toast({
        title: "Cannot Remove",
        description: "You cannot remove yourself.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', roleId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove staff member.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Staff Removed",
        description: "Staff member has been removed.",
      });
      fetchStaffMembers();
    }
  };

  if (!isDoctor) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Only doctors can manage staff members.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Staff Form */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Staff Member
          </CardTitle>
          <CardDescription>
            Create a new doctor or receptionist account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateStaff} className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="staff-name">Full Name</Label>
              <Input
                id="staff-name"
                placeholder="Enter name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-email">Email</Label>
              <Input
                id="staff-email"
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-password">Password</Label>
              <Input
                id="staff-password"
                type="password"
                placeholder="Create password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'doctor' | 'receptionist') => 
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger id="staff-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Add Staff'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Staff List */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Current Staff</CardTitle>
          <CardDescription>
            Manage doctors and receptionists
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : staffMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No staff members found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffMembers.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">{staff.full_name}</TableCell>
                    <TableCell>
                      <Badge variant={staff.role === 'doctor' ? 'default' : 'secondary'}>
                        {staff.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(staff.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {staff.user_id !== user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveStaff(staff.id, staff.user_id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
