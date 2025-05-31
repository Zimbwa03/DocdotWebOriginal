import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Loader2, Eye, EyeOff, Stethoscope } from 'lucide-react';
import { FaGoogle, FaApple } from 'react-icons/fa';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { signIn, signUp, signInWithOAuth } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (password !== confirmPassword) {
        setLoading(false);
        return;
      }
      if (password.length < 8) {
        setLoading(false);
        return;
      }
      if (!agreeToTerms) {
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (!error) {
          setLocation('/home');
        }
      } else {
        const { error } = await signUp(email, password);
        // Don't redirect on signup, user needs to verify email first
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    await signInWithOAuth(provider);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-docdot-bg">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-docdot-blue rounded-full flex items-center justify-center mb-6">
            <Stethoscope className="text-white text-2xl" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-docdot-heading mb-2">Docdot</h1>
          <p className="text-gray-600 text-sm">Your Medical Education Platform</p>
        </div>

        {/* Auth Tabs */}
        <Card className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
                isLogin
                  ? 'text-docdot-blue border-b-2 border-docdot-blue bg-docdot-blue-light bg-opacity-30'
                  : 'text-gray-500 border-b-2 border-transparent hover:text-docdot-blue'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
                !isLogin
                  ? 'text-docdot-blue border-b-2 border-docdot-blue bg-docdot-blue-light bg-opacity-30'
                  : 'text-gray-500 border-b-2 border-transparent hover:text-docdot-blue'
              }`}
            >
              Sign Up
            </button>
          </div>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-docdot-heading mb-2">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-docdot-blue focus:border-docdot-blue transition-colors duration-200 text-docdot-text"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Field */}
              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-docdot-heading mb-2">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-docdot-blue focus:border-docdot-blue transition-colors duration-200 text-docdot-text pr-12"
                    placeholder={isLogin ? "Enter your password" : "Create a password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="text-gray-400 hover:text-docdot-blue cursor-pointer" size={20} />
                    ) : (
                      <Eye className="text-gray-400 hover:text-docdot-blue cursor-pointer" size={20} />
                    )}
                  </button>
                </div>
                {!isLogin && (
                  <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters with letters and numbers</p>
                )}
              </div>

              {/* Confirm Password Field (Sign Up Only) */}
              {!isLogin && (
                <div>
                  <Label htmlFor="confirmPassword" className="block text-sm font-medium text-docdot-heading mb-2">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-docdot-blue focus:border-docdot-blue transition-colors duration-200 text-docdot-text pr-12"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="text-gray-400 hover:text-docdot-blue cursor-pointer" size={20} />
                      ) : (
                        <Eye className="text-gray-400 hover:text-docdot-blue cursor-pointer" size={20} />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Remember Me / Terms */}
              {isLogin ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-sm text-docdot-text">
                      Remember me
                    </Label>
                  </div>
                  <a href="#" className="text-sm text-docdot-blue hover:underline">
                    Forgot password?
                  </a>
                </div>
              ) : (
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    required
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm text-docdot-text">
                    I agree to the{' '}
                    <a href="#" className="text-docdot-blue hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-docdot-blue hover:underline">
                      Privacy Policy
                    </a>
                  </Label>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-docdot-blue text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-docdot-blue focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating Account...'}
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>

            {/* Social Authentication */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or {isLogin ? 'continue' : 'sign up'} with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthSignIn('google')}
                  className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  <FaGoogle className="text-red-500 text-lg" />
                  <span className="ml-2">Google</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthSignIn('apple')}
                  className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  <FaApple className="text-gray-900 text-lg" />
                  <span className="ml-2">Apple</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2024 Docdot. Secure medical education platform powered by Supabase.
          </p>
        </div>
      </div>
    </div>
  );
}
