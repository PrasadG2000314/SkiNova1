/**
 * Example Component - Using New API Structure
 * This is an example of how to update your components to use the new API client
 * 
 * Copy this pattern to your own components
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import type { Doctor } from '@/lib/types';

/**
 * Example 1: Simple Component with GET
 * Fetches and displays a list of doctors
 */
export function DoctorsList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await apiGet<Doctor[]>(API_ENDPOINTS.DOCTORS);
        
        if (response.success && response.data) {
          setDoctors(response.data);
          setError(null);
        } else {
          setError(response.error || 'Failed to fetch doctors');
        }
      } catch (err) {
        setError('An error occurred while fetching doctors');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) return <div className="spinner">Loading doctors...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (doctors.length === 0) return <div>No doctors found</div>;

  return (
    <div className="doctors-grid">
      {doctors.map((doctor) => (
        <DoctorCard key={doctor._id} doctor={doctor} />
      ))}
    </div>
  );
}

function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <div className="doctor-card">
      <h3>{doctor.name}</h3>
      <p>{doctor.specialization}</p>
      <p>Experience: {doctor.experience} years</p>
      <button>Book Appointment</button>
    </div>
  );
}

/**
 * Example 2: Component with GET and POST
 * Fetches appointments and allows creating new ones
 */
export function AppointmentManager() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch appointments
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet(API_ENDPOINTS.APPOINTMENTS);
      
      if (response.success) {
        setAppointments(response.data || []);
        setError(null);
      } else {
        setError(response.error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateAppointment = useCallback(
    async (formData: any) => {
      setLoading(true);
      try {
        const response = await apiPost(
          API_ENDPOINTS.APPOINTMENTS_CREATE,
          formData
        );

        if (response.success) {
          // Refresh list
          await fetchAppointments();
          setShowForm(false);
          alert('Appointment created successfully!');
        } else {
          setError(response.error || 'Failed to create appointment');
        }
      } finally {
        setLoading(false);
      }
    },
    [fetchAppointments]
  );

  return (
    <div className="appointment-manager">
      <h2>Appointments</h2>
      
      {error && <div className="error">{error}</div>}
      
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'New Appointment'}
      </button>

      {showForm && (
        <AppointmentForm
          onSubmit={handleCreateAppointment}
          isLoading={loading}
        />
      )}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <AppointmentList appointments={appointments} />
      )}
    </div>
  );
}

function AppointmentForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [data, setData] = useState({
    doctorId: '',
    date: '',
    time: '',
    reason: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="appointment-form">
      <input
        type="text"
        placeholder="Doctor ID"
        value={data.doctorId}
        onChange={(e) => setData({ ...data, doctorId: e.target.value })}
        required
      />
      <input
        type="date"
        value={data.date}
        onChange={(e) => setData({ ...data, date: e.target.value })}
        required
      />
      <input
        type="time"
        value={data.time}
        onChange={(e) => setData({ ...data, time: e.target.value })}
        required
      />
      <textarea
        placeholder="Reason for visit"
        value={data.reason}
        onChange={(e) => setData({ ...data, reason: e.target.value })}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Appointment'}
      </button>
    </form>
  );
}

function AppointmentList({ appointments }: { appointments: any[] }) {
  return (
    <div className="appointment-list">
      {appointments.length === 0 ? (
        <p>No appointments</p>
      ) : (
        <ul>
          {appointments.map((apt: any) => (
            <li key={apt._id}>
              <div>Date: {apt.date}</div>
              <div>Time: {apt.time}</div>
              <div>Status: {apt.status}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Example 3: Component with PUT and DELETE
 * Update and delete operations
 */
export function ProfileManager() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await apiGet(API_ENDPOINTS.PROFILE);
      if (response.success) {
        setProfile(response.data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleUpdate = useCallback(async (updatedData: any) => {
    const response = await apiPut(API_ENDPOINTS.PROFILE, updatedData);
    
    if (response.success) {
      setProfile(response.data);
      setEditing(false);
    }
  }, []);

  const handleDelete = useCallback(async () => {
    if (confirm('Are you sure you want to delete your profile?')) {
      const response = await apiDelete(API_ENDPOINTS.PROFILE);
      
      if (response.success) {
        // Redirect or clear profile
        setProfile(null);
      }
    }
  }, []);

  if (loading) return <div>Loading profile...</div>;
  if (!profile) return <div>No profile found</div>;

  return (
    <div className="profile-manager">
      {editing ? (
        <ProfileForm
          profile={profile}
          onSave={handleUpdate}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <h2>{profile.name}</h2>
          <p>Email: {profile.email}</p>
          <p>Phone: {profile.phone}</p>
          
          <button onClick={() => setEditing(true)}>Edit Profile</button>
          <button onClick={handleDelete} className="danger">
            Delete Profile
          </button>
        </>
      )}
    </div>
  );
}

function ProfileForm({
  profile,
  onSave,
  onCancel,
}: {
  profile: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [data, setData] = useState(profile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={data.name}
        onChange={(e) => setData({ ...data, name: e.target.value })}
      />
      <input
        type="email"
        value={data.email}
        onChange={(e) => setData({ ...data, email: e.target.value })}
      />
      <input
        type="tel"
        value={data.phone}
        onChange={(e) => setData({ ...data, phone: e.target.value })}
      />
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}

/**
 * Example 4: Custom Hook Pattern
 * Reusable logic for multiple components
 */
export function useBanners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await apiGet(API_ENDPOINTS.BANNERS_ALL);
        if (response.success) {
          setBanners(response.data || []);
        } else {
          setError(response.error);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { banners, loading, error };
}

// Usage in another component
export function BannerSlideshow() {
  const { banners, loading } = useBanners();

  if (loading) return null;

  return (
    <div className="slideshow">
      {banners.map((banner) => (
        <div key={banner._id} className="slide">
          <img src={banner.imageUrl} alt={banner.title} />
          <h3>{banner.title}</h3>
        </div>
      ))}
    </div>
  );
}

/**
 * Example 5: File Upload
 */
export function DiseaseDetection() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileUpload = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/detection', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      }
    } finally {
      setLoading(false);
    }
  }, [file]);

  return (
    <div className="detection">
      <h2>Disease Detection</h2>
      
      <form onSubmit={handleFileUpload}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
        <button type="submit" disabled={!file || loading}>
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>

      {result && (
        <div className="results">
          <h3>Results</h3>
          <p>Disease: {result.prediction}</p>
          <p>Confidence: {result.confidence}%</p>
        </div>
      )}
    </div>
  );
}

/**
 * Export all examples
 */
export default {
  DoctorsList,
  AppointmentManager,
  ProfileManager,
  BannerSlideshow,
  DiseaseDetection,
  useBanners,
};
