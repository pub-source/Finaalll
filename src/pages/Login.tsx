import { useState } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { SignUpForm } from '@/components/SignUpForm';
import heroImage from '@/assets/background.jpg';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10">
        {isSignUp ? (
          <SignUpForm onSwitchToLogin={() => setIsSignUp(false)} />
        ) : (
          <LoginForm onSwitchToSignUp={() => setIsSignUp(true)} />
        )}
      </div>
    </div>
  );
}
