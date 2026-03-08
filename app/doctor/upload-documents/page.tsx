"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface User {
  id: string
  name: string
  email: string
  role: string
  verified?: boolean
}

export default function UploadDocumentsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [uploadedDocs, setUploadedDocs] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null
    if (raw) {
      const userData = JSON.parse(raw)
      setUser(userData)
      if (userData.role?.toLowerCase() !== "doctor") {
        router.push("/")
      }
    } else {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    if (user) {
      fetchDocuments()
    }
  }, [user])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:4000/api/admin/users/${user?.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUploadedDocs(data.user?.verificationDocuments || "")
      }
    } catch (err) {
      console.error("Error fetching documents:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
      setError("")
      setMessage("")
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one file to upload")
      return
    }

    try {
      setUploading(true)
      setError("")
      setMessage("")

      const formData = new FormData()
      selectedFiles.forEach((file) => {
        formData.append("documents", file)
      })

      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:4000/api/doctors/upload-documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload documents")
      }

      setMessage("Documents uploaded successfully! Admin will review them shortly.")
      setSelectedFiles([])
      setUploadedDocs(data.verificationDocuments || "")

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch (err: any) {
      setError(err.message || "Error uploading documents")
      console.error("Upload error:", err)
    } finally {
      setUploading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const isVerified = user.verified === true
  const verificationStatus = isVerified ? "Verified ✅" : "Pending Verification ⏳"
  const statusColor = isVerified ? "green" : "yellow"
  const statusBgColor = isVerified ? "bg-green-50" : "bg-yellow-50"
  const statusBorderColor = isVerified ? "border-green-200" : "border-yellow-200"
  const statusTextColor = isVerified ? "text-green-700" : "text-yellow-700"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-medium mb-4 inline-flex items-center gap-2">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Verification Documents</h1>
          <p className="text-gray-600">Upload your medical credentials and documents for verification</p>
        </div>

        {/* Status Card */}
        <div className={`${statusBgColor} border-2 ${statusBorderColor} rounded-2xl p-8 mb-8`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${statusTextColor} mb-2`}>Verification Status</h2>
              <p className="text-gray-700">
                {isVerified
                  ? "Your account has been verified by the admin. You can now access your dashboard."
                  : "Your account is pending verification. Please upload your documents below."}
              </p>
            </div>
            <div className="text-5xl">
              {isVerified ? "✅" : "⏳"}
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            👤 Your Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Full Name</label>
              <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-lg">Dr {user.name || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Email Address</label>
              <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-lg">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Account Type</label>
              <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-lg capitalize">{user.role}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Status</label>
              <p className={`text-lg font-semibold p-3 rounded-lg ${isVerified ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                {verificationStatus}
              </p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            📄 Upload Documents
          </h2>

          {!isVerified && (
            <>
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 mb-6">
                <p className="text-gray-700 mb-3">
                  Please upload your medical credentials and verification documents. Accepted formats:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Medical License/Certificate (PDF, JPG, PNG)</li>
                  <li>Educational Qualifications (PDF, JPG, PNG)</li>
                  <li>Professional ID/Passport (PDF, JPG, PNG)</li>
                </ul>
              </div>

              {/* File Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Files</label>
                <div className="border-2 border-dashed border-indigo-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="fileInput"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <label htmlFor="fileInput" className="cursor-pointer">
                    <div className="text-4xl mb-3">📁</div>
                    <p className="text-gray-700 font-medium mb-1">Click to select files</p>
                    <p className="text-gray-500 text-sm">or drag and drop</p>
                  </label>
                </div>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-700 mb-3">Selected Files ({selectedFiles.length}):</p>
                    <ul className="space-y-2">
                      {selectedFiles.map((file, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-700">
                          <span className="text-blue-500">✓</span>
                          {file.name}
                          <span className="text-gray-500 text-sm">({(file.size / 1024).toFixed(2)} KB)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={uploading || selectedFiles.length === 0}
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    📤 Upload Documents
                  </>
                )}
              </button>
            </>
          )}

          {isVerified && (
            <div className="bg-green-50 p-6 rounded-xl border border-green-200 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-green-700 mb-2">Account Verified</h3>
              <p className="text-gray-700 mb-6">
                Your account has been verified. You can now access all features of your doctor dashboard.
              </p>
              <Link
                href="/doctor/dashboard"
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <div className="text-2xl">❌</div>
            <div>
              <p className="font-semibold text-red-700">Error</p>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <div className="text-2xl">✅</div>
            <div>
              <p className="font-semibold text-green-700">Success</p>
              <p className="text-green-600">{message}</p>
            </div>
          </div>
        )}

        {/* Already Uploaded Documents */}
        {uploadedDocs && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              📋 Uploaded Documents
            </h2>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Status:</span> Documents received by admin
              </p>
              <p className="text-gray-600 text-sm">
                Your uploaded documents are being reviewed by the admin team. You will be notified once the verification is complete.
              </p>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-indigo-50 rounded-2xl p-8 border border-indigo-200 mt-8">
          <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
            ℹ️ Verification Process
          </h2>
          <ol className="space-y-3 text-indigo-900">
            <li className="flex gap-3">
              <span className="font-bold text-indigo-600">1.</span>
              <span>Upload your medical credentials and documents</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-indigo-600">2.</span>
              <span>Admin reviews your documents and information</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-indigo-600">3.</span>
              <span>Upon approval, your account will be verified</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-indigo-600">4.</span>
              <span>You can then access your doctor dashboard</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
