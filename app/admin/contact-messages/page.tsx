"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, Trash2 } from "lucide-react"

interface ContactMessage {
  _id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: 'unread' | 'read' | 'replied'
  createdAt: string
}

interface Stats {
  total: number
  unread: number
  read: number
  replied: number
}

export default function ContactMessagesAdmin() {
  const router = useRouter()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) {
      router.push('/login')
      return
    }
    setToken(storedToken)
  }, [router])

  // Fetch messages and stats
  useEffect(() => {
    if (!token) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch stats
        try {
          const statsRes = await fetch('http://localhost:4000/api/contact/stats/overview', {
            headers: { Authorization: `Bearer ${token}` },
          })
          
          if (statsRes.ok) {
            const statsData = await statsRes.json()
            setStats(statsData.data)
          }
        } catch (statsErr) {
          console.warn('Stats fetch failed:', statsErr)
        }

        // Fetch messages
        const messagesRes = await fetch(`http://localhost:4000/api/contact`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        })

        if (!messagesRes.ok) {
          if (messagesRes.status === 401) {
            throw new Error('Unauthorized - Please log in again')
          } else if (messagesRes.status === 403) {
            throw new Error('Forbidden - Only admins can access this')
          } else {
            throw new Error(`Failed to fetch messages (Status: ${messagesRes.status})`)
          }
        }

        const messagesData = await messagesRes.json()
        setMessages(messagesData.data || [])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load messages'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  const handleDelete = async (messageId: string) => {
    if (!token || !confirm('Are you sure you want to delete this message?')) return

    setDeleting(messageId)
    try {
      const res = await fetch(`http://localhost:4000/api/contact/${messageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('Failed to delete message')

      setMessages(messages.filter(m => m._id !== messageId))
      if (selectedMessage?._id === messageId) {
        setSelectedMessage(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message')
    } finally {
      setDeleting(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'bg-red-100 text-red-800'
      case 'read':
        return 'bg-yellow-100 text-yellow-800'
      case 'replied':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!token) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="text-purple-600" size={32} />
            <h1 className="text-4xl font-bold text-gray-900">Contact Messages</h1>
          </div>
          <p className="text-gray-600">View and delete contact form submissions</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border-2 border-red-300 rounded-2xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-red-800 font-semibold">⚠️ Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm whitespace-nowrap"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200 text-center">
              <p className="text-gray-600 text-sm font-semibold">Total Messages</p>
              <p className="text-4xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-red-200 text-center">
              <p className="text-gray-600 text-sm font-semibold">Unread</p>
              <p className="text-4xl font-bold text-red-600">{stats.unread}</p>
            </div>
          </div>
        )}

        {/* Messages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <p className="text-gray-600 mt-4">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-200">
                <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 text-lg">No messages found</p>
              </div>
            ) : (
              messages.map(message => (
                <div
                  key={message._id}
                  onClick={() => setSelectedMessage(message)}
                  className={`bg-white rounded-2xl p-6 shadow-lg border-2 cursor-pointer transition-all hover:shadow-xl hover:border-purple-400 ${
                    selectedMessage?._id === message._id
                      ? 'border-purple-500 ring-2 ring-purple-200'
                      : 'border-gray-200'
                  } ${message.status === 'unread' ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{message.name}</h3>
                      <p className="text-gray-600 text-sm">{message.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(message.status)}`}>
                      {message.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 mb-2">{message.subject}</p>
                  <p className="text-gray-600 text-sm line-clamp-2">{message.message}</p>
                  <p className="text-gray-500 text-xs mt-3">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-1">
            {selectedMessage ? (
              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-purple-200 sticky top-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Message Details</h2>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Message Info */}
                <div className="space-y-4 mb-6 pb-6 border-b-2 border-gray-200">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">From</p>
                    <p className="text-gray-900 font-semibold">{selectedMessage.name}</p>
                    <p className="text-gray-600 text-sm">{selectedMessage.email}</p>
                    {selectedMessage.phone && (
                      <p className="text-gray-600 text-sm">{selectedMessage.phone}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Subject</p>
                    <p className="text-gray-900">{selectedMessage.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Date</p>
                    <p className="text-gray-900">
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Status</p>
                    <p className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${getStatusColor(selectedMessage.status)}`}>
                      {selectedMessage.status.toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Message */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Message</p>
                  <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{selectedMessage.message}</p>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(selectedMessage._id)}
                  disabled={deleting === selectedMessage._id}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                  {deleting === selectedMessage._id ? 'Deleting...' : 'Delete Message'}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200 text-center">
                <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">Select a message to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
