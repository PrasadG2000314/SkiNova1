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

export default function DoctorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvalData, setApprovalData] = useState({ approvedDate: "", notes: "" });
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (raw) {
      const userData = JSON.parse(raw);
      setUser(userData);
      if (userData.role !== "doctor") {
        router.push("/");
      } else if (userData.verified === false) {
        // Redirect unverified doctors to upload documents page
        router.push("/doctor/upload-documents");
      }
      // Load profile photo if it exists
      if (userData._id || userData.id || userData.userId) {
        const userId = userData._id || userData.id || userData.userId;
        setProfilePhoto(`http://localhost:4000/api/profile/photo/${userId}?t=${Date.now()}`);
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (user?.role === "doctor") {
      fetchAppointments();
      const interval = setInterval(fetchAppointments, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/api/appointments", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
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

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }

  const handleProfilePhotoUpload = async (file: File) => {
    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append("profilePhoto", file);

      const token = localStorage.getItem("token");
      console.log("Uploading file:", file.name, "Size:", file.size, "Type:", file.type);
      console.log("Token present:", !!token);
      
      const response = await fetch("http://localhost:4000/api/profile/upload-photo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log("Upload response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Upload error response:", errorData);
        throw new Error(errorData.error || "Failed to upload profile photo");
      }

      const data = await response.json();
      console.log("Upload success response:", data);
      
      // Update profile photo URL with cache busting timestamp
      if (user && (user._id || user.id || user.userId)) {
        const userId = user._id || user.id || user.userId;
        setProfilePhoto(`http://localhost:4000/api/profile/photo/${userId}?t=${Date.now()}`);
      }
      alert("Profile photo uploaded successfully!");
      setShowPhotoModal(false);
    } catch (err) {
      console.error("Upload error:", err);
      alert(err instanceof Error ? err.message : "Failed to upload profile photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemoveProfilePhoto = async () => {
    if (!window.confirm("Are you sure you want to remove your profile photo?")) {
      return;
    }

    try {
      setUploadingPhoto(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch("http://localhost:4000/api/profile/remove-photo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Remove photo response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Remove error response:", errorData);
        throw new Error(errorData.error || "Failed to remove profile photo");
      }

      // Clear profile photo by setting to empty string
      setProfilePhoto("");
      alert("Profile photo removed successfully!");
      setShowPhotoModal(false);
    } catch (err) {
      console.error("Remove error:", err);
      alert(err instanceof Error ? err.message : "Failed to remove profile photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const pendingAppointments = appointments.filter((apt) => {
    const appointmentDate = new Date(apt.requestedDate);
    const now = new Date();
    return apt.status === "pending" && appointmentDate > now;
  });

  const approvedAppointments = appointments.filter((apt) => {
    const appointmentDate = new Date(apt.approvedDate || apt.requestedDate);
    const now = new Date();
    return apt.status === "approved" && appointmentDate > now;
  });

  const pastAppointments = appointments.filter((apt) => {
    const appointmentDate = new Date(apt.approvedDate || apt.requestedDate);
    const now = new Date();
    return (apt.status === "approved" || apt.status === "pending") && appointmentDate <= now;
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-emerald-50 to-teal-100">
        <div className="animate-pulse text-gray-600 text-sm">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-emerald-50 to-teal-100 pt-20 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Modern Header Section - Clean Layout */}
        <div className="relative p-8 sm:p-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
          {/* Left side - Profile and text */}
          <div className="flex items-center gap-6 flex-1">
            {/* Profile Photo */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-white/30 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
              
              <div
                onClick={() => setShowPhotoModal(true)}
                className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center cursor-pointer overflow-hidden group/photo shadow-2xl hover:shadow-3xl transition-all duration-300 border-4 border-white/40 group-hover:border-white/60"
              >
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="w-full h-full object-cover group-hover/photo:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-6xl sm:text-7xl group-hover/photo:scale-125 transition-transform duration-300">👨‍⚕️</span>
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-full">
                  <span className="text-white text-sm font-bold">Edit Photo</span>
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="text-gray-900">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 leading-tight text-gray-900">
                Welcome back,<br />
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Dr {user.name}</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-700 max-w-lg leading-relaxed">
                Manage your patients, review AI-generated skin assessments, and track clinical insights from a single, smart dashboard.
              </p>
            </div>
          </div>

          {/* Right side - Status and action */}
          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-400/30 backdrop-blur-md rounded-2xl border border-blue-400/60 hover:border-blue-400/80 transition-all">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
              <div>
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">System Status</p>
                <p className="text-sm font-bold text-blue-900">Active</p>
              </div>
            </div>
            
            <button
              onClick={() => router.push("/doctor/availability")}
              className="px-6 py-3 bg-sky-400/30 backdrop-blur-md text-sky-700 rounded-2xl font-semibold hover:bg-sky-400/50 transition-all duration-300 border border-sky-400/60 hover:border-sky-400/80 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              📅 Manage Availability
            </button>
          </div>
        </div>


        {/* Stats cards - Professional Modern Design with Transparency */}
        <div className="grid gap-6 sm:grid-cols-3">
          {/* Pending Appointments Card */}
          <div className="group relative rounded-2xl overflow-hidden bg-white/10 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 hover:border-white/40">
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
            
            <div className="p-7 sm:p-8">
              {/* Header with icon */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:border-white/50 transition-colors">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Pending</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-500/40">
                    <span className="text-xs font-semibold text-amber-700">Action Required</span>
                  </div>
                </div>
              </div>
              
              {/* Number display */}
              <div className="mb-4">
                <div className="text-4xl sm:text-5xl font-bold text-gray-900">{pendingAppointments.length}</div>
                <p className="text-sm text-gray-700 mt-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Awaiting your approval
                </p>
              </div>
              
              {/* Footer progress */}
              <div className="pt-4 border-t border-white/20">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">Response needed</span>
                  <span className="font-semibold text-amber-600">Priority</span>
                </div>
              </div>
            </div>
          </div>

          {/* Approved Appointments Card */}
          <div className="group relative rounded-2xl overflow-hidden bg-white/10 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 hover:border-white/40">
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            
            <div className="p-7 sm:p-8">
              {/* Header with icon */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:border-white/50 transition-colors">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Approved</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/40">
                    <span className="text-xs font-semibold text-emerald-700">Confirmed</span>
                  </div>
                </div>
              </div>
              
              {/* Number display */}
              <div className="mb-4">
                <div className="text-4xl sm:text-5xl font-bold text-gray-900">{approvedAppointments.length}</div>
                <p className="text-sm text-gray-700 mt-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Confirmed with patients
                </p>
              </div>
              
              {/* Footer progress */}
              <div className="pt-4 border-t border-white/20">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">Active appointments</span>
                  <span className="font-semibold text-emerald-600">On Track</span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Appointments Card */}
          <div className="group relative rounded-2xl overflow-hidden bg-white/10 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 hover:border-white/40">
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            
            <div className="p-7 sm:p-8">
              {/* Header with icon */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:border-white/50 transition-colors">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Total</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-500/40">
                    <span className="text-xs font-semibold text-blue-700">Overview</span>
                  </div>
                </div>
              </div>
              
              {/* Number display */}
              <div className="mb-4">
                <div className="text-4xl sm:text-5xl font-bold text-gray-900">{appointments.length}</div>
                <p className="text-sm text-gray-700 mt-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Overall management
                </p>
              </div>
              
              {/* Footer progress */}
              <div className="pt-4 border-t border-white/20">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">Managed patients</span>
                  <span className="font-semibold text-blue-600">Complete</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main panels */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Recent cases */}
          <div className="lg:col-span-2 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Your Patients
              </h2>
              <span 
                onClick={() => router.push("/doctor/view-patient-reports")}
                className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 font-semibold">
                View all
              </span>
            </div>
            <div className="space-y-4">
              {approvedAppointments.length > 0 ? (
                <>
                  {approvedAppointments
                    .slice((currentPage - 1) * 3, currentPage * 3)
                    .map((apt) => (
                      <div
                        key={apt._id}
                        className="flex items-center justify-between rounded-2xl bg-white/40 px-4 py-3 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{apt.patientName}</p>
                          <p className="text-xs text-gray-600">{apt.reason}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <button
                            onClick={() => router.push(`/doctor/view-patient-reports?patientId=${apt.patientId}&appointmentId=${apt._id}`)}
                            className="w-9 h-9 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow hover:shadow-md transition-all flex items-center justify-center text-lg"
                            title="View Reports"
                          >
                            📄
                          </button>
                          <button
                            onClick={() => router.push("/chat")}
                            className="w-9 h-9 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow hover:shadow-md transition-all flex items-center justify-center text-lg"
                            title="Chat"
                          >
                            💬
                          </button>
                          <span
                            className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold text-emerald-600 bg-emerald-100"
                          >
                            ✓ Approved
                          </span>
                        </div>
                      </div>
                    ))}
                  {/* Modern Pagination Controls */}
                  <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-white/20">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl bg-gradient-to-br from-white/40 to-white/20 text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed hover:from-white/60 hover:to-white/40 transition-all duration-300 shadow-sm hover:shadow-md border border-white/30"
                    >
                      <span className="text-lg">←</span>
                    </button>
                    
                    <div className="flex gap-2">
                      {Array.from({ length: Math.ceil(approvedAppointments.length / 3) }).map((_, idx) => (
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
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(approvedAppointments.length / 3)))}
                      disabled={currentPage === Math.ceil(approvedAppointments.length / 3)}
                      className="p-2 rounded-xl bg-gradient-to-br from-white/40 to-white/20 text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed hover:from-white/60 hover:to-white/40 transition-all duration-300 shadow-sm hover:shadow-md border border-white/30"
                    >
                      <span className="text-lg">→</span>
                    </button>
                    
                    <span className="ml-2 text-xs text-gray-700 font-medium bg-white/30 px-3 py-1.5 rounded-lg border border-white/30">
                      {currentPage} / {Math.ceil(approvedAppointments.length / 3)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-600">No approved patients yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Quick actions */}
          <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-xl p-6 sm:p-7 space-y-5">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full rounded-2xl bg-emerald-600 text-white text-sm font-semibold px-4 py-2.5 shadow hover:bg-emerald-700 transition-all">
                Review AI assessments
              </button>
              <button 
                onClick={() => router.push("/doctor/appointments")}
                className="w-full rounded-2xl bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 shadow hover:bg-blue-700 transition-all">
                View All Appointments
              </button>
              <button className="w-full rounded-2xl bg-purple-600 text-white text-sm font-semibold px-4 py-2.5 shadow hover:bg-purple-700 transition-all">
                View patient history
              </button>
            </div>
            <div className="mt-4 rounded-2xl bg-white/50 px-4 py-3 text-xs text-gray-700">
              <p className="font-semibold mb-1">Tip for today</p>
              <p>
                Prioritize cases with rapidly changing lesions or AI‑flagged high‑risk patterns for earlier in‑person review.
              </p>
            </div>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="space-y-8">
          {/* Pending Appointments */}
          {pendingAppointments.length > 0 && (
            <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-xl p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                ⏳ Pending Appointments ({pendingAppointments.length})
              </h2>
              <div className="space-y-4">
                {pendingAppointments.map((apt) => (
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
            </div>
          )}

          {appointments.length === 0 && (
            <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-xl p-12 text-center">
              <p className="text-gray-700 text-lg">No appointments yet</p>
              <p className="text-gray-600 text-sm mt-2">Appointments will appear here when patients request them</p>
            </div>
          )}
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
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Photo Upload Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
            {/* Header with gradient */}
            <div className="px-6 py-6 bg-gradient-to-r from-emerald-600 via-sky-600 to-cyan-600 relative overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
              
              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-white">Upload Profile Photo</h2>
                <p className="text-white/80 text-sm mt-1">Make a great first impression</p>
              </div>
            </div>

            <div className="px-6 py-8 space-y-6">
              {/* Photo preview with creative border */}
              <div className="flex justify-center">
                <div className="relative group/preview">
                  {/* Animated border glow */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-sky-400 rounded-full blur opacity-50 group-hover/preview:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                  
                  {/* Main preview circle */}
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                    {profilePhoto ? (
                      <img
                        src={profilePhoto}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl sm:text-6xl">👨‍⚕️</span>
                    )}
                  </div>
                </div>
              </div>

              {/* File upload section with enhanced styling */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold">📁</span>
                  Choose Photo
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          alert("File size must be less than 5MB");
                          return;
                        }
                        handleProfilePhotoUpload(file);
                      }
                    }}
                    className="w-full px-4 py-3 border-2 border-dashed border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer hover:border-emerald-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
                    disabled={uploadingPhoto}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2">JPG, PNG, GIF, WEBP • Max 5MB</p>
              </div>

              {/* Upload progress indicator */}
              {uploadingPhoto && (
                <div className="flex flex-col items-center justify-center space-y-3 py-4">
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 text-emerald-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">Uploading your photo...</span>
                </div>
              )}
            </div>

            {/* Footer with action buttons */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-3xl flex justify-between items-center border-t border-gray-100">
              {profilePhoto && (
                <button
                  onClick={handleRemoveProfilePhoto}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={uploadingPhoto}
                >
                  <span>🗑️</span>
                  Remove
                </button>
              )}
              <div className="flex-1"></div>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-sky-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={uploadingPhoto}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
