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

    // Validation with user feedback
    if (!email || !password) {
      alert('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        setLoading(false);
        return;
      }
      if (password.length < 8) {
        alert('Password must be at least 8 characters long');
        setLoading(false);
        return;
      }
      if (!agreeToTerms) {
        alert('Please agree to the Terms of Service and Privacy Policy');
        setLoading(false);
        return;
      }
    }

    try {
      console.log('Attempting authentication...', { isLogin, email });
      
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (!error) {
          console.log('Sign in successful, redirecting...');
          setLocation('/home');
        } else {
          console.error('Sign in error:', error);
        }
      } else {
        console.log('Attempting signup...');
        const { error } = await signUp(email, password);
        if (!error) {
          console.log('Signup successful - check email for verification');
          alert('Account created successfully! Please check your email for a verification link.');
        } else {
          console.error('Signup error:', error);
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    await signInWithOAuth(provider);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-6">
            <img 
              src="/attached_assets/20250526_2027_Young_Medical_Student_remix_01jw6xh6h8fe1ahpkyns3pw1dw-removebg-preview-removebg-preview_1750075531418.png" 
              alt="DocDot Medical Student Logo" 
              className="w-24 h-24 mx-auto object-contain rounded-xl shadow-sm"
            />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1C1C1C' }}>DocDot</h1>
          <p className="text-sm" style={{ color: '#2E2E2E' }}>Your Medical Education Platform</p>
        </div>

        {/* Auth Tabs */}
        <Card className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 border-b-2 ${
                isLogin
                  ? 'border-b-2 bg-opacity-30'
                  : 'text-gray-500 border-transparent hover:text-blue-600'
              }`}
              style={isLogin ? { 
                color: '#3399FF', 
                borderColor: '#3399FF', 
                backgroundColor: '#D1E8F9' 
              } : {}}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 border-b-2 ${
                !isLogin
                  ? 'border-b-2 bg-opacity-30'
                  : 'text-gray-500 border-transparent hover:text-blue-600'
              }`}
              style={!isLogin ? { 
                color: '#3399FF', 
                borderColor: '#3399FF', 
                backgroundColor: '#D1E8F9' 
              } : {}}
            >
              Sign Up
            </button>
          </div>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <Label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#1C1C1C' }}>
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 transition-colors duration-200"
                  style={{ 
                    color: '#2E2E2E',
                    borderColor: '#E5E7EB'
                  }}
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
                className="w-full text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center"
                style={{ backgroundColor: '#3399FF' }}
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

              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthSignIn('google')}
                  className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  <FaGoogle className="text-red-500 text-lg" />
                  <span className="ml-2">Continue with Google</span>
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
