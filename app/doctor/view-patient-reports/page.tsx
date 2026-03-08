"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Report {
  _id: string;
  reportName: string;
  reportType: string;
  description?: string;
  fileName?: string;
  fileUrl?: string;
  uploadedAt: string;
}

interface Patient {
  _id: string;
  name: string;
  email: string;
}

export default function DoctorViewPatientReports() {
  const [user, setUser] = useState<any>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");
  const appointmentId = searchParams.get("appointmentId");

  useEffect(() => {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (raw) {
      const userData = JSON.parse(raw);
      if (userData?.role === "doctor") {
        setUser(userData);
      } else {
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (user?.role === "doctor" && patientId) {
      fetchPatientReports();
    }
  }, [user, patientId]);

  const fetchPatientReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Build URL based on available parameters
      let url = `http://localhost:4000/api/patient-reports/${patientId}`;
      if (appointmentId) {
        url += `/${appointmentId}`;
      }
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("You don't have access to this patient's reports");
        }
        throw new Error("Failed to fetch patient reports");
      }

      const data = await response.json();
      setPatient(data.patient);
      setReports(data.reports || []);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to fetch reports");
      router.push("/doctor/dashboard");
    } finally {
      setLoading(false);
    }
  };

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }

  function handleBackToDashboard() {
    router.push("/doctor/dashboard");
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-emerald-50 to-teal-100">
        <div className="animate-pulse text-gray-600 text-sm">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-emerald-50 to-teal-100 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Dr {user.name}'s <span className="text-emerald-700">Patient Reports</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-gray-700 max-w-xl">
              View and download medical reports shared by your patient.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="inline-flex items-center rounded-full bg-sky-600/90 px-3 py-1 text-xs font-semibold text-white shadow-md">
              Role • {user.role?.toUpperCase()}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-red-500 text-white text-sm font-semibold px-4 py-2 shadow hover:bg-red-600 transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Button */}
        <button
          onClick={handleBackToDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-medium"
        >
          ← Back to Dashboard
        </button>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-sm">Loading patient reports...</p>
          </div>
        ) : patient ? (
          <>
            {/* Patient Info Section */}
            <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-xl p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                👤 Patient Information
              </h2>
              <div className="bg-white/40 rounded-2xl p-5 border border-white/50">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Name
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {patient.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Email
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {patient.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Patient Reports Section */}
            <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-xl p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                📋 Patient's Reports
              </h2>

              {reports.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-700 text-lg">
                    No reports available
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    This patient has not uploaded any reports yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div
                      key={report._id}
                      className="bg-white/40 rounded-2xl p-5 border border-white/50 hover:shadow-lg transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {report.reportName}
                          </h3>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-700">
                              <strong>Type:</strong> {report.reportType}
                            </p>
                            <p className="text-sm text-gray-700">
                              <strong>Uploaded:</strong>{" "}
                              {new Date(report.uploadedAt).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                            {report.description && (
                              <p className="text-sm text-gray-600 mt-2">
                                <strong>Description:</strong>{" "}
                                {report.description}
                              </p>
                            )}
                            {report.fileName && (
                              <p className="text-sm text-gray-600">
                                <strong>File:</strong> {report.fileName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {report.fileUrl && (
                            <a
                              href={report.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-semibold text-center"
                            >
                              📥 Download
                            </a>
                          )}
                          <button
                            onClick={() => {
                              // Optional: could add preview functionality
                              if (report.fileUrl) {
                                window.open(report.fileUrl, "_blank");
                              }
                            }}
                            disabled={!report.fileUrl}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            👁️ View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
