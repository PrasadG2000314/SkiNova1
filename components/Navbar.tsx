"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [token, setToken] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedContactMsg, setSelectedContactMsg] = useState<any>(null);
  const [showContactReview, setShowContactReview] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (raw) setUser(JSON.parse(raw));
    if (storedToken) setToken(storedToken);
  }, []);

  // Fetch unread contact messages for admin
  useEffect(() => {
    if (user?.role !== "admin" || !token) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/contact/stats/overview', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadMessages(data.data?.unread || 0);
        }
      } catch (err) {
        console.error('Failed to fetch unread messages:', err);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [user?.role, token]);

  // Fetch notifications for admin (activities + contact messages)
  useEffect(() => {
    if (user?.role !== "admin" || !token) return;

    const fetchNotifications = async () => {
      try {
        // Fetch contact messages (prioritized)
        const contactRes = await fetch('http://localhost:4000/api/contact', {
          headers: { Authorization: `Bearer ${token}` },
        });

        let combinedNotifications: any[] = [];

        if (contactRes.ok) {
          const contactData = await contactRes.json();
          const contacts = (contactData.data || []).map((c: any) => ({
            ...c,
            type: 'contact',
            notificationTitle: `New contact from ${c.name}`,
            notificationDesc: c.email,
            createdAt: c.createdAt,
          }));
          combinedNotifications.push(...contacts);
        }

        // Then fetch activities
        const activitiesRes = await fetch('http://localhost:4000/api/activities', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (activitiesRes.ok) {
          const activitiesData = await activitiesRes.json();
          const activities = (activitiesData.activities || []).map((a: any) => ({
            ...a,
            type: 'activity',
            notificationTitle: a.actionTitle,
            notificationDesc: a.userName || a.userEmail,
          }));
          combinedNotifications.push(...activities);
        }

        // Sort by createdAt and get the 5 most recent
        combinedNotifications.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });

        setNotifications(combinedNotifications.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [user?.role, token]);

  function goToDashboard(e: any) {
    e.preventDefault();
    const role = user?.role;
    if (role === "admin") router.push("/admin/dashboard");
    else if (role === "doctor") router.push("/doctor/dashboard");
    else router.push("/patient/dashboard");
    setIsOpen(false);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
    setIsOpen(false);
  }

  function openContactReview(contact: any) {
    setSelectedContactMsg(contact);
    setShowContactReview(true);
    setShowNotifications(false);
  }

  async function handleMarkAsRead(contactId: string) {
    try {
      const res = await fetch(`http://localhost:4000/api/contact/${contactId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "read" }),
      });

      if (res.ok) {
        setSelectedContactMsg(null);
        setShowContactReview(false);
      }
    } catch (err) {
      console.error("Error marking message as read:", err);
    }
  }

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[role="notification-button"]') && !target.closest('[role="notification-dropdown"]')) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNotifications]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-xl border-b border-white/20 shadow-lg">
      <div className="bg-gradient-to-r from-white/40 to-white/30">
        <nav className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-2">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 group"
            >
              <img 
                src="/images/SKÍNOVA_Logo_Variation_4-removebg-preview (1).png" 
                alt="SkinNova Logo"
                className="h-10 sm:h-12 md:h-14 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-white/50 font-medium transition-all duration-300"
              >
                Home
              </Link>
              <Link
                href="/aboutus"
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-white/50 font-medium transition-all duration-300"
              >
                About Us
              </Link>
              <Link
                href="/contactus"
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-white/50 font-medium transition-all duration-300"
              >
                Contact Us
              </Link>
            </div>

            {/* Right side actions */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  {user?.role === "admin" && (
                    <div className="flex items-center gap-2">
                      <div className="relative" role="notification-button">
                        <button
                          onClick={() => setShowNotifications(!showNotifications)}
                          className="relative p-2 rounded-lg bg-white/40 hover:bg-white/60 transition-all"
                        >
                          <Bell className="w-5 h-5 text-gray-700" />
                          {notifications.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                              {notifications.length > 9 ? '9+' : notifications.length}
                            </span>
                          )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                          <div role="notification-dropdown" className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                          <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-800">Recent Activity</h3>
                            <button
                              onClick={() => {
                                router.push("/admin/contact-messages");
                                setShowNotifications(false);
                              }}
                              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full font-medium transition-colors"
                            >
                              📧 Messages
                            </button>
                          </div>
                          {notifications.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                              {notifications.map((notif: any) => (
                                <div
                                  key={notif._id}
                                  onClick={() => notif.type === 'contact' && openContactReview(notif)}
                                  className={`px-4 py-3 transition-colors border-l-4 ${
                                    notif.type === 'contact' 
                                      ? 'border-blue-500 bg-blue-50 hover:bg-blue-100 cursor-pointer' 
                                      : 'border-transparent hover:bg-gray-50 cursor-default'
                                  }`}
                                >
                                  {notif.type === 'contact' ? (
                                    <>
                                      <p className="text-sm font-semibold text-gray-900">
                                        📧 {notif.name}
                                      </p>
                                      <p className="text-xs text-gray-700 mt-1">
                                        <strong>Email:</strong> {notif.email}
                                      </p>
                                      {notif.phone && (
                                        <p className="text-xs text-gray-700">
                                          <strong>Phone:</strong> {notif.phone}
                                        </p>
                                      )}
                                      <p className="text-xs text-gray-700 mt-1">
                                        <strong>Subject:</strong> {notif.subject}
                                      </p>
                                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                        {notif.message}
                                      </p>
                                      <p className="text-xs text-gray-400 mt-2">
                                        {new Date(notif.createdAt).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      <p className="text-sm font-medium text-gray-800">
                                        {notif.actionTitle}
                                      </p>
                                      <p className="text-xs text-gray-600 mt-1">
                                        {notif.userName || notif.userEmail}
                                      </p>
                                      <p className="text-xs text-gray-400 mt-1">
                                        {new Date(notif.createdAt).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </p>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="px-4 py-6 text-center text-gray-500 text-sm">
                              No notifications yet
                            </div>
                          )}
                          <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
                            <button
                              onClick={() => {
                                router.push("/admin/dashboard?tab=activity");
                                setShowNotifications(false);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              View All Activity →
                            </button>
                          </div>
                        </div>
                      )}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={goToDashboard}
                    className="relative px-4 py-2 rounded-lg bg-white/40 text-gray-900 font-medium hover:bg-white/60 transition-all flex items-center gap-2"
                  >
                    Dashboard
                    {user?.role === "admin" && unreadMessages > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                        {unreadMessages > 99 ? '99+' : unreadMessages}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:shadow-lg transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-lg text-gray-700 hover:bg-white/50 font-medium transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:shadow-lg transition-all"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/50 transition-all"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden mt-4 space-y-2 pb-4">
              <Link
                href="/"
                className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-white/50 font-medium transition-all"
              >
                Home
              </Link>
              <Link
                href="/aboutus"
                className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-white/50 font-medium transition-all"
              >
                About Us
              </Link>
              <Link
                href="/contactus"
                className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-white/50 font-medium transition-all"
              >
                Contact Us
              </Link>
              
              <div className="border-t border-white/20 pt-2 mt-2 space-y-2">
                {user ? (
                  <>
                    {user?.role === "admin" && (
                      <button
                        onClick={() => {
                          router.push("/admin/contact-messages");
                          setIsOpen(false);
                        }}
                        className="w-full px-4 py-2 rounded-lg bg-white/40 text-gray-900 font-medium hover:bg-white/60 transition-all text-left"
                      >
                        📧 Contact Messages
                      </button>
                    )}
                    <button
                      onClick={goToDashboard}
                      className="w-full px-4 py-2 rounded-lg bg-white/40 text-gray-900 font-medium hover:bg-white/60 transition-all text-left relative"
                    >
                      <div className="flex items-center justify-between">
                        <span>Dashboard</span>
                        {user?.role === "admin" && unreadMessages > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 animate-pulse">
                            {unreadMessages}
                          </span>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:shadow-lg transition-all text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-white/50 font-medium transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="block px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:shadow-lg transition-all"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Contact Message Review Modal */}
      {showContactReview && selectedContactMsg && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">New Contact Message</h2>
                <p className="text-blue-100 text-sm mt-1">Review & Respond</p>
              </div>
              <button
                onClick={() => {
                  setShowContactReview(false);
                  setSelectedContactMsg(null);
                }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Sender Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Sender Information</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Name</p>
                    <p className="text-sm text-gray-900">{selectedContactMsg.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Email</p>
                    <p className="text-sm text-gray-900 break-all">
                      <a href={`mailto:${selectedContactMsg.email}`} className="text-blue-600 hover:underline">
                        {selectedContactMsg.email}
                      </a>
                    </p>
                  </div>
                  {selectedContactMsg.phone && (
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Phone</p>
                      <p className="text-sm text-gray-900">
                        <a href={`tel:${selectedContactMsg.phone}`} className="text-blue-600 hover:underline">
                          {selectedContactMsg.phone}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Subject</h3>
                <p className="text-sm text-gray-700 font-medium">{selectedContactMsg.subject}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Message</h3>
                <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedContactMsg.message}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600">Status:</p>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    selectedContactMsg.status === "unread"
                      ? "bg-red-100 text-red-700"
                      : selectedContactMsg.status === "replied"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {selectedContactMsg.status.charAt(0).toUpperCase() + selectedContactMsg.status.slice(1)}
                </span>
              </div>

              {/* Timestamp */}
              <p className="text-xs text-gray-500">
                Received: {new Date(selectedContactMsg.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 p-4 flex gap-2">
              <button
                onClick={() => {
                  router.push("/admin/contact-messages");
                  setShowContactReview(false);
                }}
                className="flex-1 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all font-medium text-sm border border-gray-300 hover:border-gray-400"
              >
                Manage All Messages
              </button>
              {selectedContactMsg.status === "unread" && (
                <button
                  onClick={() => handleMarkAsRead(selectedContactMsg._id)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all font-medium text-sm"
                >
                  Mark as Read
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
