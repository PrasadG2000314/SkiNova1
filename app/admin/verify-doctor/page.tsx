'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Doctor {
  _id: string;
  name: string;
  email: string;
  role: string;
  verified: boolean;
  verificationDocuments?: string;
  profile?: any;
  createdAt: string;
}

export default function VerifyDoctorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const doctorId = searchParams.get('id');
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!doctorId) {
      setError('Doctor ID not provided');
      setLoading(false);
      return;
    }

    fetchDoctorDetails();
  }, [doctorId]);

  const fetchDoctorDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/admin/users/${doctorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch doctor details');
      }

      const data = await response.json();
      setDoctor(data.user);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch doctor details');
      setLoading(false);
    }
  };

  const handleVerifyDoctor = async () => {
    if (!doctor) return;

    setVerifying(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/admin/users/${doctor._id}/verify`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verified: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify doctor');
      }

      alert('Doctor verified successfully!');
      router.push('/admin/dashboard');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to verify doctor');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctor details...</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Doctor not found'}</p>
          <Link
            href="/admin/dashboard"
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/dashboard"
            className="text-indigo-600 hover:text-indigo-700 font-medium mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-800">Doctor Verification</h1>
          <p className="text-gray-600 mt-2">Review and verify doctor credentials</p>
        </div>

        {/* Doctor Information Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            👤 Doctor Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-xl">
              <label className="text-xs font-semibold text-gray-600 uppercase">Name</label>
              <p className="text-lg font-medium text-gray-800 mt-1">{doctor.name || 'N/A'}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <label className="text-xs font-semibold text-gray-600 uppercase">Email</label>
              <p className="text-lg font-medium text-gray-800 mt-1">{doctor.email}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <label className="text-xs font-semibold text-gray-600 uppercase">Registration Date</label>
              <p className="text-lg font-medium text-gray-800 mt-1">
                {new Date(doctor.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <label className="text-xs font-semibold text-gray-600 uppercase">Status</label>
              <p className="mt-1">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    doctor.verified
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {doctor.verified ? '✅ Verified' : '⏳ Pending Verification'}
                </span>
              </p>
            </div>
          </div>

          {/* Profile Information */}
          {doctor.profile && Object.keys(doctor.profile).length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Details</h3>
              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                {Object.entries(doctor.profile).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-start">
                    <span className="font-medium text-gray-700 capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="text-gray-600 text-right max-w-xs">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Verification Documents Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            📄 Verification Documents
          </h2>

          {doctor.verificationDocuments ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-700">
                  ✅ Doctor has submitted verification documents for review
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Uploaded Files:</h3>
                <div className="space-y-2">
                  {doctor.verificationDocuments.split(',').map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-xl">📎</span>
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium break-all text-sm">{doc.trim()}</p>
                      </div>
                      <a
                        href={`http://localhost:4000/api/doctors/documents/${doctor._id}/download/${doc.trim()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
              <div className="text-center">
                <div className="text-3xl mb-3">📋</div>
                <p className="text-gray-700 font-medium">No verification documents uploaded yet</p>
                <p className="text-sm text-gray-600 mt-2">
                  Doctor has not submitted any verification documents
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Section */}
        {!doctor.verified && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              ✔️ Verification Action
            </h2>

            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200 mb-6">
              <p className="text-gray-700">
                After reviewing the doctor's information and documents, you can approve their verification status.
                Once verified, the doctor will be able to access their dashboard and manage appointments.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleVerifyDoctor}
                disabled={verifying}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50"
              >
                {verifying ? 'Verifying...' : '✅ Verify Doctor'}
              </button>
              <Link
                href="/admin/dashboard"
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium text-center"
              >
                Cancel
              </Link>
            </div>
          </div>
        )}

        {doctor.verified && (
          <div className="bg-green-50 rounded-2xl shadow-lg p-8 border border-green-200">
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-green-700 mb-2">Doctor Verified</h3>
              <p className="text-gray-700 mb-6">
                This doctor has been verified and can access their dashboard
              </p>
              <Link
                href="/admin/dashboard"
                className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
