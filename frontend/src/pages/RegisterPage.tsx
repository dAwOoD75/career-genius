import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Zap, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterData } from '@/types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterData & { confirm_password: string }>();

  const onSubmit = async (data: RegisterData & { confirm_password: string }) => {
    if (data.password !== data.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await registerUser({ email: data.email, username: data.username, full_name: data.full_name, password: data.password });
      toast.success('Account created! Welcome to Career Genius.');
      navigate('/dashboard');
    } catch (err) {
      const error = err as AxiosError<{ detail: string }>;
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <span className="font-bold text-white text-xl">Career Genius</span>
        </div>

        <div className="card">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
            <p className="text-slate-400 text-sm">Start your career journey today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="John Doe"
                {...register('full_name')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Username</label>
                <input
                  type="text"
                  className={`input-field ${errors.username ? 'border-red-500' : ''}`}
                  placeholder="johndoe"
                  {...register('username', {
                    required: 'Required',
                    minLength: { value: 3, message: 'Min 3 chars' },
                    pattern: { value: /^[a-zA-Z0-9_-]+$/, message: 'No spaces allowed' },
                  })}
                />
                {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="you@example.com"
                  {...register('email', { required: 'Required' })}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`input-field pr-11 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Min. 8 characters"
                  {...register('password', {
                    required: 'Required',
                    minLength: { value: 8, message: 'Min 8 characters' },
                    pattern: { value: /(?=.*[A-Z])(?=.*[0-9])/, message: 'Must include uppercase & number' },
                  })}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                className={`input-field ${errors.confirm_password ? 'border-red-500' : ''}`}
                placeholder="Repeat password"
                {...register('confirm_password', { required: 'Required' })}
              />
              {errors.confirm_password && <p className="text-red-400 text-xs mt-1">{errors.confirm_password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
            >
              {isLoading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><UserPlus size={18} /> Create Account</>
              }
            </button>
          </form>

          <p className="text-center text-slate-400 mt-5 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
