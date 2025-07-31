import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Lock, Zap, UserPlus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';
import '../../App.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { signup, error, clearError } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};

    if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear validation errors for the field being edited
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
    
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const { confirmPassword, ...signupData } = formData;
    const result = await signup(signupData);
    
    if (result.success) {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-black via-cyber-dark to-cyber-darker flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-cyber-neon-purple opacity-5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-cyber-neon-green opacity-5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="cyber-border-pink bg-cyber-dark/90 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-gradient-to-r from-cyber-neon-pink to-cyber-neon-purple rounded-full flex items-center justify-center"
            >
              <UserPlus className="w-8 h-8 text-cyber-black" />
            </motion.div>
            
            <div>
              <CardTitle className="text-3xl font-bold text-white neon-glow-blue">
                Join RiiBah
              </CardTitle>
              <CardDescription className="text-cyber-light-gray mt-2">
                Create your cyberpunk identity
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 bg-cyber-neon-orange/20 border border-cyber-neon-orange rounded-lg text-cyber-neon-orange text-sm"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyber-neon-pink" />
                  <Input
                    type="text"
                    name="username"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                    className="pl-12 bg-cyber-darker border-cyber-gray focus:border-cyber-neon-pink focus:ring-cyber-neon-pink text-white placeholder-cyber-light-gray"
                    required
                  />
                  {validationErrors.username && (
                    <p className="text-cyber-neon-orange text-xs mt-1">{validationErrors.username}</p>
                  )}
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyber-neon-pink" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-12 bg-cyber-darker border-cyber-gray focus:border-cyber-neon-pink focus:ring-cyber-neon-pink text-white placeholder-cyber-light-gray"
                    required
                  />
                  {validationErrors.email && (
                    <p className="text-cyber-neon-orange text-xs mt-1">{validationErrors.email}</p>
                  )}
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyber-neon-pink" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-12 pr-12 bg-cyber-darker border-cyber-gray focus:border-cyber-neon-pink focus:ring-cyber-neon-pink text-white placeholder-cyber-light-gray"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyber-light-gray hover:text-cyber-neon-pink transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {validationErrors.password && (
                    <p className="text-cyber-neon-orange text-xs mt-1">{validationErrors.password}</p>
                  )}
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyber-neon-pink" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-12 pr-12 bg-cyber-darker border-cyber-gray focus:border-cyber-neon-pink focus:ring-cyber-neon-pink text-white placeholder-cyber-light-gray"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyber-light-gray hover:text-cyber-neon-pink transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {validationErrors.confirmPassword && (
                    <p className="text-cyber-neon-orange text-xs mt-1">{validationErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyber-neon-pink to-cyber-neon-purple hover:from-cyber-neon-purple hover:to-cyber-neon-pink text-cyber-black font-semibold py-3 cyber-hover"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-cyber-black border-t-transparent rounded-full"
                  />
                ) : (
                  'Initialize Profile'
                )}
              </Button>

              <div className="text-center">
                <p className="text-cyber-light-gray">
                  Already in the system?{' '}
                  <Link
                    to="/login"
                    className="text-cyber-neon-cyan hover:text-cyber-neon-blue transition-colors font-medium neon-glow-cyan"
                  >
                    Access RiiBah
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Decorative Elements */}
        <motion.div
          animate={{ 
            boxShadow: [
              '0 0 20px #ff00ff',
              '0 0 40px #8a2be2',
              '0 0 20px #ff00ff'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -top-2 -left-2 w-4 h-4 bg-cyber-neon-pink rounded-full opacity-60"
        />
        <motion.div
          animate={{ 
            boxShadow: [
              '0 0 20px #8a2be2',
              '0 0 40px #ff00ff',
              '0 0 20px #8a2be2'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
          className="absolute -bottom-2 -right-2 w-4 h-4 bg-cyber-neon-purple rounded-full opacity-60"
        />
      </motion.div>
    </div>
  );
};

export default Signup;

