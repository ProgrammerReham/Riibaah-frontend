import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Lock, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';
import '../../App.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(formData);
    
    if (result.success) {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-black via-cyber-dark to-cyber-darker flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-neon-cyan opacity-5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-neon-pink opacity-5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="cyber-border bg-cyber-dark/90 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-gradient-to-r from-cyber-neon-cyan to-cyber-neon-pink rounded-full flex items-center justify-center"
            >
              <Zap className="w-8 h-8 text-cyber-black" />
            </motion.div>
            
            <div>
              <CardTitle className="text-3xl font-bold text-white neon-glow-blue">
                RiiBah
              </CardTitle>
              <CardDescription className="text-cyber-light-gray mt-2">
                Enter the cyberpunk chat realm
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
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyber-neon-cyan" />
                  <Input
                    type="text"
                    name="username"
                    placeholder="Username or Email"
                    value={formData.username}
                    onChange={handleChange}
                    className="pl-12 bg-cyber-darker border-cyber-gray focus:border-cyber-neon-cyan focus:ring-cyber-neon-cyan text-white placeholder-cyber-light-gray"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyber-neon-cyan" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-12 pr-12 bg-cyber-darker border-cyber-gray focus:border-cyber-neon-cyan focus:ring-cyber-neon-cyan text-white placeholder-cyber-light-gray"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyber-light-gray hover:text-cyber-neon-cyan transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyber-neon-cyan to-cyber-neon-blue hover:from-cyber-neon-blue hover:to-cyber-neon-cyan text-cyber-black font-semibold py-3 cyber-hover"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-cyber-black border-t-transparent rounded-full"
                  />
                ) : (
                  'Enter the Matrix'
                )}
              </Button>

              <div className="text-center">
                <p className="text-cyber-light-gray">
                  New to the cyberpunk realm?{' '}
                  <Link
                    to="/signup"
                    className="text-cyber-neon-pink hover:text-cyber-neon-purple transition-colors font-medium neon-glow-pink"
                  >
                    Join RiiBah
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
              '0 0 20px #00ffff',
              '0 0 40px #ff00ff',
              '0 0 20px #00ffff'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -top-2 -left-2 w-4 h-4 bg-cyber-neon-cyan rounded-full opacity-60"
        />
        <motion.div
          animate={{ 
            boxShadow: [
              '0 0 20px #ff00ff',
              '0 0 40px #00ffff',
              '0 0 20px #ff00ff'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
          className="absolute -bottom-2 -right-2 w-4 h-4 bg-cyber-neon-pink rounded-full opacity-60"
        />
      </motion.div>
    </div>
  );
};

export default Login;

