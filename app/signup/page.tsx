"use client"
import AuthForm from '../../components/AuthForm'

export default function SignupPage() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center py-6 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: 'url(/images/backgrounds/auth-bg.svg)' }}
    >
      <AuthForm mode="signup" compact />
    </div>
  )
}
