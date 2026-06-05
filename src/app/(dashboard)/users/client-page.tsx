"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users as UsersIcon, Plus, Loader2, UserCheck, UserX, KeyRound, Power, Key } from "lucide-react";
import { addUser, toggleUserStatus, resetUserPassword } from "@/app/actions/users";
import type { User } from "@/db/schema";

export function UsersClient({ initialUsers, currentUserEmail }: { initialUsers: User[], currentUserEmail: string }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usersList, setUsersList] = useState(initialUsers);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff" as "owner" | "staff",
  });

  // Reset password state
  const [resetId, setResetId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const res = await addUser(formData);
    
    if (res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }
    
    // Optimistic or real refresh (real refresh handled by revalidatePath in action)
    // We'll just refresh page to get updated list
    window.location.reload();
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (confirm(`Are you sure you want to ${currentStatus ? 'disable' : 'enable'} this user?`)) {
      await toggleUserStatus(id, !currentStatus);
      setUsersList(usersList.map(u => u.id === id ? { ...u, isActive: !currentStatus } : u));
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetId || newPassword.length < 6) return;
    
    setLoading(true);
    const res = await resetUserPassword(resetId, newPassword);
    
    if (res.success) {
      alert("Password reset successfully!");
      setResetId(null);
      setNewPassword("");
    } else {
      alert("Failed to reset password");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-gray-500" strokeWidth={1.8} />
            User Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage staff accounts and access permissions
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Staff
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-brand-200 animate-slide-up">
          <CardHeader>
            <CardTitle>Add New Staff Member</CardTitle>
            <CardDescription>
              Create a staff account with billing and product search access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {error && (
                <div className="sm:col-span-2 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="staff-name">Full Name</Label>
                <Input
                  id="staff-name"
                  placeholder="Enter staff name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-email">Email Address</Label>
                <Input
                  id="staff-email"
                  type="email"
                  placeholder="staff@pharmacy.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-role">Role</Label>
                <select 
                  id="staff-role"
                  className="flex h-10 w-full rounded-[10px] border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:border-brand-400"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as "owner" | "staff" })
                  }
                >
                  <option value="staff">Staff (Limited Access)</option>
                  <option value="owner">Owner (Full Access)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-password">Password</Label>
                <Input
                  id="staff-password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  minLength={6}
                />
              </div>
              <div className="flex items-end gap-2 sm:col-span-2 mt-2">
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Create Account
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reset Password Modal */}
      {resetId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <Card className="w-full max-w-sm animate-slide-up shadow-2xl">
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>Enter a new password for this user</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input 
                    type="password" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="ghost" onClick={() => setResetId(null)}>Cancel</Button>
                  <Button type="submit" disabled={loading || newPassword.length < 6}>Reset</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-[11px] font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="text-left py-3 px-4 text-[11px] font-medium text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="text-left py-3 px-4 text-[11px] font-medium text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="text-left py-3 px-4 text-[11px] font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-[11px] font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${user.role === 'owner' ? 'bg-brand-50 border-brand-100 text-brand-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                          <span className="text-xs font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900 text-[13px]">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 text-[13px]">
                      {user.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${user.role === 'owner' ? 'bg-brand-50 text-brand-700 border-brand-100' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {user.role === 'owner' ? 'Owner' : 'Staff'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 text-brand-600 text-xs">
                          <UserCheck className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-400 text-xs">
                          <UserX className="w-3.5 h-3.5" /> Disabled
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {user.email !== currentUserEmail && (
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-7 text-[11px] px-2 gap-1"
                            onClick={() => setResetId(user.id)}
                          >
                            <Key className="w-3 h-3" /> Reset
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={`h-7 text-[11px] px-2 gap-1 ${user.isActive ? 'text-red-600 hover:text-red-700' : 'text-brand-600 hover:text-brand-700'}`}
                            onClick={() => handleToggleActive(user.id, user.isActive)}
                          >
                            <Power className="w-3 h-3" /> {user.isActive ? 'Disable' : 'Enable'}
                          </Button>
                        </div>
                      )}
                      {user.email === currentUserEmail && (
                        <span className="text-[11px] text-gray-400">Current account</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center border border-brand-100">
                <KeyRound className="w-4 h-4 text-brand-600" strokeWidth={1.8} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-[13px]">Owner</h3>
                <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">
                  Full access — Billing, Inventory, Reports, GST, Settings, User Management
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-200">
                <UserX className="w-4 h-4 text-gray-500" strokeWidth={1.8} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-[13px]">Staff</h3>
                <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">
                  Limited access — Billing and Product Search only.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
