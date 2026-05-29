import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Save, Shield, User, Palette } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance'>('profile');
  const [isSaving, setIsSaving] = useState(false);

  const profileForm = useForm({
    defaultValues: {
      full_name: user?.full_name || '',
      bio: user?.bio || '',
      location: user?.location || '',
      phone: user?.phone || '',
      linkedin_url: user?.linkedin_url || '',
      github_url: user?.github_url || '',
      website_url: user?.website_url || '',
    },
  });

  const securityForm = useForm<{ current_password: string; new_password: string; confirm_password: string }>();

  const saveProfile = async (data: any) => {
    setIsSaving(true);
    try {
      const updated = await authService.updateProfile(data);
      updateUser(updated);
      toast.success('Profile updated!');
    } catch {
      toast.error('Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  const changePassword = async (data: any) => {
    if (data.new_password !== data.confirm_password) return toast.error('Passwords do not match');
    setIsSaving(true);
    try {
      await authService.changePassword(data.current_password, data.new_password);
      toast.success('Password changed!');
      securityForm.reset();
    } catch {
      toast.error('Password change failed. Check your current password.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile',    label: 'Profile',    icon: User },
    { id: 'security',   label: 'Security',   icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ] as const;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title">Settings</h1>
        <p className="section-subtitle">Manage your account and preferences.</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-2xl p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
          <h2 className="text-gray-900 font-bold text-lg mb-5">Profile Information</h2>
          <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-gray-900 font-semibold">{user?.full_name || user?.username}</p>
                <p className="text-gray-400 text-sm">{user?.email}</p>
                <span className={`badge text-xs mt-1 ${user?.is_verified ? 'badge-green' : 'badge-yellow'}`}>
                  {user?.is_verified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input-field" {...profileForm.register('full_name')} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input-field" {...profileForm.register('phone')} placeholder="+1 234 567 8900" />
              </div>
              <div className="col-span-2">
                <label className="label">Bio</label>
                <textarea className="input-field resize-none" rows={3} {...profileForm.register('bio')} placeholder="Tell us about yourself..." />
              </div>
              <div>
                <label className="label">Location</label>
                <input className="input-field" {...profileForm.register('location')} placeholder="City, Country" />
              </div>
              <div>
                <label className="label">Website</label>
                <input className="input-field" {...profileForm.register('website_url')} placeholder="https://yoursite.com" />
              </div>
              <div>
                <label className="label">LinkedIn</label>
                <input className="input-field" {...profileForm.register('linkedin_url')} placeholder="linkedin.com/in/you" />
              </div>
              <div>
                <label className="label">GitHub</label>
                <input className="input-field" {...profileForm.register('github_url')} placeholder="github.com/you" />
              </div>
            </div>

            <button type="submit" disabled={isSaving} className="btn-primary flex items-center gap-2 mt-2">
              {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </form>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
          <h2 className="text-gray-900 font-bold text-lg mb-5">Change Password</h2>
          <form onSubmit={securityForm.handleSubmit(changePassword)} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input type="password" className="input-field" {...securityForm.register('current_password', { required: true })} />
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" className="input-field" {...securityForm.register('new_password', { required: true, minLength: 8 })} placeholder="Min. 8 characters" />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" className="input-field" {...securityForm.register('confirm_password', { required: true })} />
            </div>
            <button type="submit" disabled={isSaving} className="btn-primary flex items-center gap-2">
              <Shield size={16} /> Update Password
            </button>
          </form>
        </motion.div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card space-y-5">
          <h2 className="text-gray-900 font-bold text-lg">Appearance</h2>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-gray-900 font-medium">Light Theme</p>
              <p className="text-gray-400 text-sm">Career Genius uses a clean light theme</p>
            </div>
            <span className="badge-green">Active</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
