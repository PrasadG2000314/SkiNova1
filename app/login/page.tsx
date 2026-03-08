"use client"
import AuthForm from '../../components/AuthForm'

export default function LoginPage() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: 'url(/images/backgrounds/auth-bg.svg)' }}
    >
      <AuthForm mode="login" compact />
    </div>
  )
}
