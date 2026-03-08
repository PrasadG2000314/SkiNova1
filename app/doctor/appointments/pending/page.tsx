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

export default function PendingAppointments() {
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvalData, setApprovalData] = useState({ approvedDate: "", notes: "" });
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
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

  const handleApprove = async () => {
    if (!selectedAppointment) {
      alert("No appointment selected");
      return;
    }

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
          body: JSON.stringify({
            notes: approvalData.notes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to approve appointment");
      }

      alert("Appointment approved! Email sent to patient.");
      setShowApproveModal(false);
      setApprovalData({ approvedDate: "", notes: "" });
      await fetchAppointments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve appointment");
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
          body: JSON.stringify({ reason: rejectReason }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject appointment");
      }

      alert("Appointment rejected! Email sent to patient.");
      setShowRejectModal(false);
      setRejectReason("");
      await fetchAppointments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reject appointment");
    }
  };

  const pendingAppointments = appointments.filter((apt) => {
    // ONLY show pending status - regardless of date
    return apt.status === "pending";
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
            Pending Appointments
          </h1>
          <p className="text-gray-600">Review and manage appointment requests from patients</p>
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
            className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            ⏳ Pending
          </button>
          <button
            onClick={() => router.push("/doctor/appointments/past")}
            className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            📋 Past
          </button>
        </div>

        {/* Pending Appointments List */}
        <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-xl p-6 sm:p-8">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-600">Loading appointments...</div>
            </div>
          ) : pendingAppointments.length > 0 ? (
            <div className="space-y-4">
              {pendingAppointments
                .slice((currentPage - 1) * 5, currentPage * 5)
                .map((apt) => (
                  <div key={apt._id} className="bg-white/40 rounded-2xl p-5 border border-white/50 hover:shadow-lg transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-gray-900">
                          {apt.patientName} <span className="text-xs text-gray-600">({apt.patientId})</span>
                        </p>
                        <p className="text-sm text-gray-700 mt-1">📅 {new Date(apt.requestedDate).toLocaleString()}</p>
                        <p className="text-sm text-gray-700">📝 {apt.reason}</p>
                        {apt.location?.address && (
                          <p className="text-sm text-blue-700 mt-1 flex items-center gap-1">
                            📍 {apt.location.address}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setShowApproveModal(true);
                          }}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setShowRejectModal(true);
                          }}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No pending appointments</p>
              <p className="text-gray-500 text-sm mt-2">All appointments have been reviewed</p>
            </div>
          )}

          {/* Pagination */}
          {pendingAppointments.length > 5 && (
            <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-white/20">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-gradient-to-br from-white/40 to-white/20 text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed hover:from-white/60 hover:to-white/40 transition-all duration-300 shadow-sm hover:shadow-md border border-white/30"
              >
                <span className="text-lg">←</span>
              </button>
              
              <div className="flex gap-2">
                {Array.from({ length: Math.ceil(pendingAppointments.length / 5) }).map((_, idx) => (
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
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(pendingAppointments.length / 5)))}
                disabled={currentPage === Math.ceil(pendingAppointments.length / 5)}
                className="p-2 rounded-xl bg-gradient-to-br from-white/40 to-white/20 text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed hover:from-white/60 hover:to-white/40 transition-all duration-300 shadow-sm hover:shadow-md border border-white/30"
              >
                <span className="text-lg">→</span>
              </button>
              
              <span className="ml-2 text-xs text-gray-700 font-medium bg-white/30 px-3 py-1.5 rounded-lg border border-white/30">
                {currentPage} / {Math.ceil(pendingAppointments.length / 5)}
              </span>
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

      {/* Approve Modal */}
      {showApproveModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Approve Appointment</h2>
            <p className="text-gray-600 mb-4">Patient: <strong>{selectedAppointment.patientName}</strong></p>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">Scheduled Date & Time</p>
              <p className="text-gray-600">{new Date(selectedAppointment.requestedDate).toLocaleString()}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={approvalData.notes}
                onChange={(e) =>
                  setApprovalData({ ...approvalData, notes: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={3}
                placeholder="Add any notes for the patient"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Reject Appointment</h2>
            <p className="text-gray-600 mb-4">Patient: <strong>{selectedAppointment.patientName}</strong></p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for Rejection
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="Please explain why you are rejecting this appointment"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
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
