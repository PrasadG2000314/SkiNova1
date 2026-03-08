"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Report {
  _id: string;
  reportName: string;
  reportType: string;
  description?: string;
  fileName?: string;
  fileUrl?: string;
  uploadedAt: string;
  updatedAt: string;
}

export default function PatientReports() {
  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [formData, setFormData] = useState({
    reportName: "",
    reportType: "General Report",
    description: "",
    fileName: "",
    fileUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [accessStates, setAccessStates] = useState<Record<string, boolean>>({});
  const router = useRouter();

  useEffect(() => {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (raw) {
      setUser(JSON.parse(raw));
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (user?.role === "patient") {
      fetchReports();
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
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
      const approvedAppointments = (data.appointments || []).filter(
        (apt: any) => apt.status === "approved"
      );
      setAppointments(approvedAppointments);

      // Fetch access status for each appointment
      approvedAppointments.forEach((apt: any) => {
        fetchAccessStatus(apt._id);
      });
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  const fetchAccessStatus = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/api/report-access/${appointmentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAccessStates((prev) => ({
          ...prev,
          [appointmentId]: data.hasAccess,
        }));
      }
    } catch (err) {
      console.error("Error fetching access status:", err);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/api/reports", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }

      const data = await response.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file: File): string | null => {
    // Allowed file types
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExtensions = [".pdf", ".doc", ".docx"];

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      const fileName = file.name.toLowerCase();
      const isAllowedExt = allowedExtensions.some((ext) =>
        fileName.endsWith(ext)
      );
      if (!isAllowedExt) {
        return "Only PDF and Word documents (.pdf, .doc, .docx) are allowed";
      }
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return "File size must be less than 10MB";
    }

    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      alert(error);
      e.target.value = ""; // Reset input
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setFormData((prev) => ({
      ...prev,
      fileName: file.name,
    }));
  };

  const uploadFileToServer = async (file: File): Promise<string> => {
    const formDataFile = new FormData();
    formDataFile.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/api/reports/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataFile,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      // Construct full URL for file
      return data.fileUrl ? `http://localhost:4000${data.fileUrl}` : "";
    } catch (err) {
      console.error("Error uploading file:", err);
      throw new Error("Failed to upload file to server");
    }
  };

  const handleOpenUploadModal = () => {
    setEditingReport(null);
    setSelectedFile(null);
    setFormData({
      reportName: "",
      reportType: "General Report",
      description: "",
      fileName: "",
      fileUrl: "",
    });
    setShowUploadModal(true);
  };

  const handleOpenEditModal = (report: Report) => {
    setEditingReport(report);
    setFormData({
      reportName: report.reportName,
      reportType: report.reportType,
      description: report.description || "",
      fileName: report.fileName || "",
      fileUrl: report.fileUrl || "",
    });
    setShowUploadModal(true);
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setEditingReport(null);
    setSelectedFile(null);
    setFormData({
      reportName: "",
      reportType: "General Report",
      description: "",
      fileName: "",
      fileUrl: "",
    });
  };

  const handleSaveReport = async () => {
    if (!formData.reportName.trim()) {
      alert("Report name is required");
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      let fileUrl = formData.fileUrl;

      // Upload file if selected
      if (selectedFile && !editingReport) {
        try {
          fileUrl = await uploadFileToServer(selectedFile);
        } catch (err) {
          alert(err instanceof Error ? err.message : "Failed to upload file");
          setUploading(false);
          return;
        }
      }

      const reportData = {
        ...formData,
        fileUrl: fileUrl || "",
      };

      if (editingReport) {
        // Update existing report
        const response = await fetch(
          `http://localhost:4000/api/reports/${editingReport._id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(reportData),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update report");
        }

        alert("Report updated successfully!");
      } else {
        // Create new report
        const response = await fetch("http://localhost:4000/api/reports", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reportData),
        });

        if (!response.ok) {
          throw new Error("Failed to upload report");
        }

        alert("Report uploaded successfully!");
      }

      handleCloseModal();
      await fetchReports();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save report");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/api/reports/${reportId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete report");
      }

      alert("Report deleted successfully!");
      await fetchReports();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete report");
    }
  };

  const handleGrantAccess = async (doctorId: string, appointmentId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/api/report-access/grant", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ doctorId, appointmentId }),
      });

      if (!response.ok) {
        throw new Error("Failed to grant access");
      }

      alert("Access granted successfully!");
      setAccessStates((prev) => ({ ...prev, [appointmentId]: true }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to grant access");
    }
  };

  const handleRevokeAccess = async (
    doctorId: string,
    appointmentId: string
  ) => {
    if (!confirm("Are you sure you want to revoke access?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/api/report-access/revoke", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ doctorId, appointmentId }),
      });

      if (!response.ok) {
        throw new Error("Failed to revoke access");
      }

      alert("Access revoked successfully!");
      setAccessStates((prev) => ({ ...prev, [appointmentId]: false }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to revoke access");
    }
  };

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }

  function handleBackToDashboard() {
    router.push("/patient/dashboard");
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
              My Medical <span className="text-emerald-700">Reports</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-gray-700 max-w-xl">
              Upload, manage, and keep track of your medical reports and test results in one place.
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

        {/* Doctor Access Control Section */}
        {appointments.length > 0 && (
          <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              👨‍⚕️ Share Reports with Your Doctor
            </h2>
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div
                  key={apt._id}
                  className="bg-white/40 rounded-2xl p-5 border border-white/50 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Dr. {apt.doctorName}
                      </h3>
                      <p className="text-sm text-gray-700 mt-1">
                        📅 Appointment:{" "}
                        {new Date(apt.approvedDate).toLocaleDateString(
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
                      {apt.reason && (
                        <p className="text-sm text-gray-600 mt-1">
                          📝 Reason: {apt.reason}
                        </p>
                      )}
                      <div className="mt-3">
                        {accessStates[apt._id] ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            ✓ Access Granted
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                            ✗ No Access
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {!accessStates[apt._id] ? (
                        <button
                          onClick={() =>
                            handleGrantAccess(apt.doctorId, apt._id)
                          }
                          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
                        >
                          ✓ Grant Access
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleRevokeAccess(apt.doctorId, apt._id)
                          }
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-semibold"
                        >
                          ✕ Revoke Access
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              📤 Upload New Report
            </h2>
            <button
              onClick={handleOpenUploadModal}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              + New Report
            </button>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
            <p className="text-gray-700 text-sm">
              Click the <strong>"+ New Report"</strong> button above to upload a new medical report, test result, or any other relevant documentation.
            </p>
          </div>
        </div>

        {/* Previous Reports Section */}
        <div className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            📋 Previous Reports
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-sm">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-700 text-lg">No reports uploaded yet</p>
              <p className="text-gray-600 text-sm mt-2">
                Start by uploading your first medical report
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
                            <strong>Description:</strong> {report.description}
                          </p>
                        )}
                        {report.fileName && (
                          <p className="text-sm text-gray-600">
                            <strong>File:</strong> {report.fileName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-col items-stretch">
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
                        onClick={() => handleOpenEditModal(report)}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all text-sm font-semibold"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteReport(report._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-semibold"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload/Edit Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600">
              <h2 className="text-xl font-bold text-white">
                {editingReport ? "Edit Report" : "Upload New Report"}
              </h2>
            </div>
            <div className="px-6 py-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Report Name *
                </label>
                <input
                  type="text"
                  value={formData.reportName}
                  onChange={(e) =>
                    setFormData({ ...formData, reportName: e.target.value })
                  }
                  placeholder="e.g., Skin Cancer Screening"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Report Type
                </label>
                <select
                  value={formData.reportType}
                  onChange={(e) =>
                    setFormData({ ...formData, reportType: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="General Report">General Report</option>
                  <option value="Skin Analysis">Skin Analysis</option>
                  <option value="Lab Test">Lab Test</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Imaging">Imaging</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Add any details about this report..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Document (PDF or Word)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    disabled={editingReport !== null}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PDF, DOC, DOCX (Max 10MB)
                </p>
                {selectedFile && (
                  <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-xs text-emerald-700 font-medium">
                      ✓ {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                )}
                {editingReport && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ File upload not available when editing. To change the file, delete and re-upload the report.
                  </p>
                )}
              </div>

              {!editingReport && !selectedFile && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Or paste File URL / Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.fileUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, fileUrl: e.target.value })
                    }
                    placeholder="https://example.com/file.pdf"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Alternative: provide an external link to your file
                  </p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-2">
              <button
                onClick={handleCloseModal}
                disabled={uploading}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReport}
                disabled={uploading}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Processing..." : editingReport ? "Update Report" : "Upload Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
