"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Appointment {
  _id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  requestedDate: string;
  approvedDate?: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "completed";
  notes?: string;
  availabilitySlotId?: string;
  location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
}

export default function PastAppointments() {
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (raw) {
      const userData = JSON.parse(raw);
      setUser(userData);
      if (userData.role !== "doctor") {
        router.push("/");
      }
    }
  }, [router]);

  useEffect(() => {
    if (user?.id) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;

      const response = await fetch("http://localhost:4000/api/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const pastAppointments = appointments.filter((apt) => {
    // Include ONLY if status is completed or rejected
    if (apt.status === "completed" || apt.status === "rejected") {
      return true;
    }
    
    // Also include approved appointments with dates that have passed
    if (apt.status === "approved") {
      const appointmentDate = new Date(apt.approvedDate || apt.requestedDate);
      const now = new Date();
      return appointmentDate < now;
    }
    
    // Exclude pending appointments completely
    return false;
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-40 pb-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Past Appointments
          </h1>
          <p className="text-gray-600">View your completed and rejected appointments</p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => router.push("/doctor/appointments")}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            ✅ Approved
          </button>
          <button
            onClick={() => router.push("/doctor/appointments/pending")}
            className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            ⏳ Pending
          </button>
          <button
            className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            📋 Past
          </button>
        </div>

        {/* Past Appointments List */}
        <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-xl p-6 sm:p-8">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-600">Loading appointments...</div>
            </div>
          ) : pastAppointments.length > 0 ? (
            <>
              <div className="space-y-4">
                {pastAppointments
                  .slice((currentPage - 1) * 5, currentPage * 5)
                  .map((apt) => (
                    <div key={apt._id} className="bg-white/40 rounded-2xl p-5 border border-gray-300 hover:shadow-lg transition-all opacity-85">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-lg font-semibold text-gray-700">
                            {apt.patientName} <span className="text-xs text-gray-600">({apt.patientId})</span>
                          </p>
                          <p className="text-sm text-gray-600 mt-1">📅 {new Date(apt.approvedDate || apt.requestedDate).toLocaleString()}</p>
                          <p className="text-sm text-gray-600">📝 {apt.reason}</p>
                          {apt.location?.address && (
                            <p className="text-sm text-blue-700 mt-1 flex items-center gap-1">
                              📍 {apt.location.address}
                            </p>
                          )}
                          {apt.notes && <p className="text-sm text-gray-600 mt-2"><strong>Notes:</strong> {apt.notes}</p>}
                        </div>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            apt.status === 'completed' 
                              ? 'bg-gray-200 text-gray-700' 
                              : 'bg-red-200 text-red-700'
                          }`}>
                            {apt.status === 'completed' ? '✓ Completed' : '✗ Rejected'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Pagination */}
              {pastAppointments.length > 5 && (
                <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-white/20">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl bg-gradient-to-br from-white/40 to-white/20 text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed hover:from-white/60 hover:to-white/40 transition-all duration-300 shadow-sm hover:shadow-md border border-white/30"
                  >
                    <span className="text-lg">←</span>
                  </button>
                  
                  <div className="flex gap-2">
                    {Array.from({ length: Math.ceil(pastAppointments.length / 5) }).map((_, idx) => (
                      <button
                        key={idx + 1}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`h-9 w-9 rounded-xl font-semibold text-sm transition-all duration-300 ${
                          currentPage === idx + 1
                            ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-105"
                            : "bg-white/30 text-gray-900 hover:bg-white/50 shadow-sm hover:shadow-md border border-white/30"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(pastAppointments.length / 5)))}
                    disabled={currentPage === Math.ceil(pastAppointments.length / 5)}
                    className="p-2 rounded-xl bg-gradient-to-br from-white/40 to-white/20 text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed hover:from-white/60 hover:to-white/40 transition-all duration-300 shadow-sm hover:shadow-md border border-white/30"
                  >
                    <span className="text-lg">→</span>
                  </button>
                  
                  <span className="ml-2 text-xs text-gray-700 font-medium bg-white/30 px-3 py-1.5 rounded-lg border border-white/30">
                    {currentPage} / {Math.ceil(pastAppointments.length / 5)}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No past appointments</p>
              <p className="text-gray-500 text-sm mt-2">Your past appointments will appear here</p>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
