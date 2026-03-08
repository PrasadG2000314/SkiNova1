"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Appointment {
  _id: string;
  doctorName: string;
  doctorId: string;
  patientName: string;
  patientId: string;
  requestedDate: string;
  approvedDate?: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt: string;
  notes?: string;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("approved");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/api/appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Handle both response formats
        const appointmentsList = data.appointments || data.data || [];
        setAppointments(appointmentsList);
      } else {
        console.error("Failed to fetch appointments:", response.statusText);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "approved":
        return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case "rejected":
        return "bg-red-50 border-red-200 text-red-800";
      case "completed":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "approved":
        return "✅";
      case "rejected":
        return "❌";
      case "completed":
        return "🎉";
      default:
        return "📋";
    }
  };

  const filteredAppointments = appointments.filter((apt) => apt.status === activeTab);

  const handleApprove = async () => {
    if (!selectedAppointment) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/api/appointments/${selectedAppointment._id}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notes: approvalNotes }),
        }
      );

      if (response.ok) {
        alert("Appointment approved successfully!");
        setShowApproveModal(false);
        setApprovalNotes("");
        await fetchAppointments();
      } else {
        alert("Failed to approve appointment");
      }
    } catch (err) {
      alert("Error approving appointment");
    }
  };

  const handleReject = async () => {
    if (!selectedAppointment) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/api/appointments/${selectedAppointment._id}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notes: rejectReason }),
        }
      );

      if (response.ok) {
        alert("Appointment rejected successfully!");
        setShowRejectModal(false);
        setRejectReason("");
        await fetchAppointments();
      } else {
        alert("Failed to reject appointment");
      }
    } catch (err) {
      alert("Error rejecting appointment");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-emerald-50 to-teal-100">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={user?.role === "patient" ? "/patient/dashboard" : "/doctor/dashboard"}>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">← Back</button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">📅 Appointments</h1>
            </div>
            <div className="text-sm text-gray-600">
              {user?.name} ({user?.role})
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-4 border-b border-gray-200">
            {[
              { key: "approved", label: "✅ Approved", icon: "🎯" },
              { key: "pending", label: "⏳ Pending", icon: "⌛" },
              { key: "rejected", label: "❌ Rejected", icon: "🚫" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-3 font-semibold transition-all relative ${
                  activeTab === tab.key ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-5">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">⏳</div>
              <p className="text-gray-600 mt-2">Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12 bg-white/40 rounded-3xl border border-white/50 backdrop-blur-xl">
              <p className="text-4xl mb-2">📭</p>
              <p className="text-gray-600 text-lg">No {activeTab} appointments</p>
              <p className="text-gray-500 text-sm mt-1">Check other tabs or schedule a new appointment</p>
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className={`rounded-2xl p-6 border backdrop-blur-xl transition-all hover:shadow-lg ${getStatusColor(
                  appointment.status
                )}`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left Section - Doctor/Patient Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-3xl">{getStatusIcon(appointment.status)}</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Dr. {appointment.doctorName}</h3>
                        <p className="text-sm text-gray-600">
                          {user?.role === "doctor" ? "Patient: " : ""}
                          {appointment.patientName}
                        </p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {/* Date & Time */}
                      <div className="bg-white/30 rounded-xl p-3">
                        <p className="text-xs font-semibold text-gray-700 uppercase">📅 Appointment Date</p>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          {new Date(appointment.requestedDate).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        {appointment.approvedDate && (
                          <p className="text-sm text-gray-700 mt-1">
                            ⏰{" "}
                            {new Date(appointment.approvedDate).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>

                      {/* Reason */}
                      <div className="bg-white/30 rounded-xl p-3">
                        <p className="text-xs font-semibold text-gray-700 uppercase">🏥 Reason for Visit</p>
                        <p className="text-lg font-bold text-gray-900 mt-1 capitalize">
                          {appointment.reason || "Not specified"}
                        </p>
                      </div>

                      {/* Notes */}
                      {appointment.notes && (
                        <div className="bg-white/30 rounded-xl p-3 md:col-span-2">
                          <p className="text-xs font-semibold text-gray-700 uppercase">📝 Notes</p>
                          <p className="text-gray-900 mt-1">{appointment.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="mt-4 flex items-center gap-2">
                      <span
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide ${
                          appointment.status === "pending"
                            ? "bg-yellow-200 text-yellow-900"
                            : appointment.status === "approved"
                            ? "bg-emerald-200 text-emerald-900"
                            : appointment.status === "rejected"
                            ? "bg-red-200 text-red-900"
                            : "bg-blue-200 text-blue-900"
                        }`}
                      >
                        {getStatusIcon(appointment.status)} {appointment.status}
                      </span>
                      <span className="text-xs text-gray-600">
                        Booked on {new Date(appointment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Right Section - Action Button */}
                  <div className="flex flex-col gap-2">
                    {appointment.status === "approved" && (
                      <>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm">
                          📞 Call Doctor
                        </button>
                        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors text-sm">
                          💬 Message
                        </button>
                      </>
                    )}
                    {appointment.status === "pending" && (
                      user?.role === "doctor" ? (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowApproveModal(true);
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors text-sm"
                          >
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowRejectModal(true);
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors text-sm"
                          >
                            ❌ Reject
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-700 font-semibold">⏳ Waiting for doctor's response</p>
                      )
                    )}
                    {appointment.status === "rejected" && (
                      <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors text-sm">
                        📅 Schedule Again
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="mt-12 bg-white/40 backdrop-blur-xl border-t border-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                label: "Total Appointments",
                value: appointments.length,
                icon: "📅",
                color: "from-blue-400 to-cyan-400",
              },
              {
                label: "Approved",
                value: appointments.filter((a) => a.status === "approved").length,
                icon: "✅",
                color: "from-emerald-400 to-teal-400",
              },
              {
                label: "Pending",
                value: appointments.filter((a) => a.status === "pending").length,
                icon: "⏳",
                color: "from-yellow-400 to-orange-400",
              },
              {
                label: "Rejected",
                value: appointments.filter((a) => a.status === "rejected").length,
                icon: "❌",
                color: "from-red-400 to-pink-400",
              },
            ].map((stat, idx) => (
              <div key={idx} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 text-white shadow-lg`}>
                <p className="text-sm font-semibold opacity-90">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
                <p className="text-2xl mt-1">{stat.icon}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Approve Appointment</h2>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Patient:</strong> {selectedAppointment.patientName}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Date:</strong> {new Date(selectedAppointment.requestedDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Reason:</strong> {selectedAppointment.reason}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes (Optional)</label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={3}
                placeholder="Add any notes for the patient..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setApprovalNotes("");
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold transition-colors"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reject Appointment</h2>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Patient:</strong> {selectedAppointment.patientName}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Date:</strong> {new Date(selectedAppointment.requestedDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Reason:</strong> {selectedAppointment.reason}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Rejection</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="Please explain why you are rejecting this appointment..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
