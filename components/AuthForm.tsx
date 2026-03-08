"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  mode: 'login' | 'signup'
  compact?: boolean
}

export default function AuthForm({ mode, compact = false }: Props) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'patient' | 'doctor'>('patient')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(false)
  const [userCount, setUserCount] = useState(0)

  useEffect(() => {
    // Fetch user stats for signup page
    if (mode === 'signup') {
      fetchUserStats()
    }
  }, [mode])

  const fetchUserStats = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/admin/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUserCount(data.users?.length || 0)
      }
    } catch (err) {
      console.error('Failed to fetch user count:', err)
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login'
      const body = mode === 'signup' ? { name, email, password, role } : { email, password }

      console.log(`Calling ${endpoint} with body:`, body)

      const res = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      console.log(`Response status: ${res.status}`, data)

      if (!res.ok) {
        throw new Error(data.error || 'Auth failed')
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      if (mode === 'login') {
        if (remember) localStorage.setItem('remember', '1')
        else localStorage.removeItem('remember')
      }
      console.log('User stored:', data.user)

      // Redirect to role-specific dashboard
      const userRole = data.user?.role
      console.log('User role:', userRole)
      if (userRole === 'admin') {
        router.push('/admin/dashboard')
      } else if (userRole === 'doctor') {
        router.push('/doctor/dashboard')
      } else {
        router.push('/patient/dashboard')
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-4 ${compact ? 'bg-transparent' : 'bg-gradient-to-br from-slate-50 via-white to-slate-50'}`}>
      <div className={`${compact ? 'max-w-5xl' : 'max-w-7xl'} w-full grid grid-cols-1 md:grid-cols-2 gap-0 ${compact ? 'bg-white/95 backdrop-blur-sm' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl`}>
        
        {/* Left: Form Section */}
        <div className={`${compact ? 'p-6' : 'p-8 md:p-12'} flex flex-col justify-center order-2 md:order-1`}>
          <h2 className="text-3xl font-bold mb-2 text-gray-900">{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p className="text-gray-600 mb-6 text-sm">{mode === 'login' ? 'Sign in to access your dashboard' : 'Join skinova and start managing your health'}</p>

          {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-medium flex items-start gap-2">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
            {error}
          </div>}

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                {/* Full Name */}
                <div className="group">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input 
                    id="name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all duration-200" 
                    placeholder="Jane Doe" 
                  />
                </div>

                {/* Email Address */}
                <div className="group">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all duration-200" 
                    placeholder="you@example.com" 
                  />
                </div>

                {/* Password */}
                <div className="group">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all duration-200" 
                    placeholder="••••••••" 
                  />
                </div>

                {/* Account Type */}
                <div className="group">
                  <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">Account Type</label>
                  <select
                    id="role" 
                    value={role} 
                    onChange={e => setRole(e.target.value as 'patient' | 'doctor')} 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all duration-200 text-gray-700"
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </div>
              </>
            )}

            {mode === 'login' && (
              <>
                <div className="group">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    autoFocus={mode === 'login'} 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all duration-200" 
                    placeholder="you@example.com" 
                  />
                </div>

                <div className="group">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all duration-200" 
                    placeholder="••••••••" 
                  />
                </div>
              </>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing...
                </span>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>

            <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-3">
              {mode === 'login' && (
                <a href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">Forgot password?</a>
              )}

              {mode === 'login' && (
                <label className="flex items-center text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={remember} 
                    onChange={e => setRemember(e.target.checked)} 
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-2 focus:ring-indigo-500" 
                  />
                  <span className="ml-2.5">Remember me for 30 days</span>
                </label>
              )}
            </div>

            {mode === 'login' && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-center text-sm text-gray-600 mb-4 font-medium">Or continue with</p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button" 
                    onClick={() => alert('Google OAuth coming soon!')} 
                    className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M21.35 11.1H12v2.8h5.35c-.23 1.4-1.07 2.59-2.28 3.38v2.83h3.69C20.54 19.05 22 15.47 22 12c0-.57-.05-1.13-.15-1.65z" fill="#4285F4"/><path d="M12 22c2.7 0 4.97-.9 6.63-2.45l-3.69-2.83C14.3 17.26 13.19 17.7 12 17.7c-2.9 0-5.36-1.95-6.24-4.58H2.01v2.88C3.66 19.86 7.54 22 12 22z" fill="#34A853"/><path d="M5.76 13.12c-.2-.56-.32-1.16-.32-1.78s.12-1.22.32-1.78V6.68H2.01C1.32 8.08 1 9.53 1 11c0 1.47.32 2.92 1.01 4.32l3.75-2.2z" fill="#FBBC05"/><path d="M12 4.2c1.47 0 2.79.5 3.83 1.49l2.87-2.87C16.96 1.15 14.7 0 12 0 7.54 0 3.66 2.14 2.01 5.32l3.75 2.88C6.64 6.15 9.1 4.2 12 4.2z" fill="#EA4335"/></svg>
                    Google
                  </button>
                  <button 
                    type="button" 
                    onClick={() => alert('GitHub OAuth coming soon!')} 
                    className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.73.5.75 5.48.75 11.75c0 5 3.25 9.25 7.75 10.75.57.1.78-.25.78-.56v-2c-3.16.69-3.83-1.42-3.83-1.42-.52-1.32-1.26-1.67-1.26-1.67-1.03-.7.08-.68.08-.68 1.14.08 1.74 1.17 1.74 1.17 1.01 1.74 2.65 1.24 3.3.95.1-.74.4-1.24.73-1.52-2.52-.29-5.18-1.26-5.18-5.6 0-1.24.44-2.24 1.16-3.04-.12-.29-.5-1.46.1-3.04 0 0 .94-.3 3.08 1.16.9-.25 1.86-.38 2.82-.38.96 0 1.92.13 2.82.38 2.14-1.46 3.08-1.16 3.08-1.16.6 1.58.22 2.75.1 3.04.72.8 1.16 1.8 1.16 3.04 0 4.36-2.66 5.31-5.2 5.6.41.36.78 1.06.78 2.14v3.17c0 .31.2.67.78.56 4.5-1.5 7.75-5.75 7.75-10.75C22.25 5.48 18.27.5 12 .5z"/></svg>
                    GitHub
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            {mode === 'login' ? (
              <p>Don't have an account? <a href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">Sign up</a></p>
            ) : (
              <p>Already have an account? <a href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">Sign in</a></p>
            )}
          </div>
        </div>

        {/* Right: Onboarding / Benefits Section */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white relative overflow-hidden order-1 md:order-2">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
          
          <div className="relative z-10">
            <div className="inline-block mb-6 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
              <p className="text-sm font-bold tracking-wide">🏥 skinova Platform</p>
            </div>
            <h3 className="text-4xl font-bold mb-6 leading-tight">
              {mode === 'login' ? 'Your Health Journey Continues' : 'Welcome to Healthcare Excellence'}
            </h3>
            <p className="text-lg opacity-90 mb-8 leading-relaxed">
              {mode === 'login' 
                ? 'Access your personalized dashboard with real-time health insights and doctor consultations.' 
                : 'Join thousands of patients and doctors already managing healthcare with skinova.'}
            </p>
          </div>

          {/* Features/Benefits */}
          <div className="relative z-10 w-full space-y-4">
            {mode === 'signup' ? (
              <>
                <div className="flex items-start gap-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm hover:bg-white/15 transition-all">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M13 7H7v6h6V7z"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-1">Easy Registration</h4>
                    <p className="text-sm opacity-80">Complete your profile in just 2 minutes</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm hover:bg-white/15 transition-all">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-1">Secure & Private</h4>
                    <p className="text-sm opacity-80">Your health data is encrypted and protected</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm hover:bg-white/15 transition-all">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.5 1.5H5.75A2.25 2.25 0 003.5 3.75v12.5A2.25 2.25 0 005.75 18.5h8.5a2.25 2.25 0 002.25-2.25V9" strokeWidth="1.5"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-1">Expert Consultations</h4>
                    <p className="text-sm opacity-80">Connect with licensed dermatologists anytime</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm hover:bg-white/15 transition-all border-2 border-white/30">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v-1h8v1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-1">Join {userCount}+ Users</h4>
                    <p className="text-sm opacity-80">Be part of our growing healthcare community</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm hover:bg-white/15 transition-all">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-1">Real-time Dashboard</h4>
                    <p className="text-sm opacity-80">Monitor your health metrics instantly</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm hover:bg-white/15 transition-all">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-1">Advanced Analytics</h4>
                    <p className="text-sm opacity-80">Track your progress with detailed insights</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm hover:bg-white/15 transition-all">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-1">24/7 Support</h4>
                    <p className="text-sm opacity-80">Our team is always here to help you</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bottom CTA or info */}
          <div className="relative z-10 mt-8 pt-6 border-t border-white/20">
            <p className="text-sm opacity-80 mb-3">
              {mode === 'login' ? 'Don\'t have an account? ' : 'Already have an account? '}
            </p>
            <a 
              href={mode === 'login' ? '/signup' : '/login'}
              className="inline-block px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg backdrop-blur-sm transition-all hover:scale-105"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
