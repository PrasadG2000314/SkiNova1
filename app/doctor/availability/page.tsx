"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

interface AvailabilitySlot {
  _id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Dynamically import map component to avoid SSR issues with Leaflet
const LocationMapPicker = dynamic(() => import("@/components/LocationMapPicker"), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center">Loading map...</div>
});

export default function DoctorAvailability() {
  const [user, setUser] = useState<any>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [formData, setFormData] = useState({ 
    dayOfWeek: 0, 
    startTime: "09:00", 
    endTime: "17:00",
    location: {
      address: "",
      latitude: 0,
      longitude: 0
    }
  });
  const [showForm, setShowForm] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (raw) {
      const userData = JSON.parse(raw);
      setUser(userData);
      if (userData.role !== "doctor") {
        router.push("/");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (user?.role === "doctor") {
      fetchAvailability();
    }
  }, [user]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("No token found - user not authenticated");
        alert("Please log in first");
        router.push("/login");
        return;
      }

      const response = await fetch("http://localhost:4000/api/availability/my-availability", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch availability`);
      }

      const data = await response.json();
      console.log("Fetched availability slots:", data.availabilitySlots);
      setAvailabilitySlots(data.availabilitySlots || []);
    } catch (err) {
      console.error("Error fetching availability:", err);
      alert(`Failed to load availability slots: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.startTime >= formData.endTime) {
      alert("Start time must be before end time");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("Please log in first");
        router.push("/login");
        return;
      }

      const method = editingSlot ? "PUT" : "POST";
      const url = editingSlot
        ? `http://localhost:4000/api/availability/${editingSlot._id}`
        : "http://localhost:4000/api/availability";

      const bodyData = {
        dayOfWeek: parseInt(formData.dayOfWeek as any),
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location.address ? formData.location : undefined,
      };

      console.log("Sending request:", { method, url, bodyData });

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      console.log("POST/PUT response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to save availability`);
      }

      const responseData = await response.json();
      console.log("Response data:", responseData);

      alert(editingSlot ? "Availability updated!" : "Availability slot added!");
      setShowForm(false);
      setEditingSlot(null);
      setFormData({ dayOfWeek: 0, startTime: "09:00", endTime: "17:00", location: { address: "", latitude: 0, longitude: 0 } });
      
      // Give the server a moment to process, then refresh
      setTimeout(() => {
        fetchAvailability();
      }, 500);
    } catch (err) {
      console.error("Error saving availability:", err);
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("Full error:", err);
      alert(`Failed to save availability: ${errMsg}`);
    }
  };

  const handleEdit = (slot: AvailabilitySlot) => {
    setEditingSlot(slot);
    setFormData({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      location: slot.location || { address: "", latitude: 0, longitude: 0 },
    });
    setShowForm(true);
  };

  const handleDelete = async (slotId: string) => {
    if (!confirm("Are you sure you want to remove this availability slot?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:4000/api/availability/${slotId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete availability");
      }

      alert("Availability slot removed!");
      fetchAvailability();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete availability");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setShowLocationModal(false);
    setEditingSlot(null);
    setFormData({ dayOfWeek: 0, startTime: "09:00", endTime: "17:00", location: { address: "", latitude: 0, longitude: 0 } });
  };

  const handleLocationSearch = async (value: string) => {
    // Update the address in formData
    setFormData({...formData, location: {...formData.location, address: value}});
    
    // Only search if user is actively typing (length > 2)
    if (!value || value.length < 3) {
      setPredictions([]);
      return;
    }

    // Don't search if this is the exact address from saved location (avoid re-searching)
    if (editingSlot && editingSlot.location?.address === value) {
      setPredictions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}`
      );
      const data = await response.json();
      setPredictions(data.slice(0, 5));
    } catch (error) {
      console.error("Error searching locations:", error);
      setPredictions([]);
    }
  };

  const handlePlaceSelect = (prediction: any) => {
    const newLocation = {
      address: prediction.display_name || `${prediction.lat}, ${prediction.lon}`,
      latitude: parseFloat(prediction.lat),
      longitude: parseFloat(prediction.lon)
    };
    setFormData({...formData, location: newLocation});
    setPredictions([]);
  };

  const handleLocationSelect = (location: any) => {
    setFormData({...formData, location});
    setShowLocationModal(false);
  };

  const slotsByDay = DAYS_OF_WEEK.map((day, index) => {
    const slot = availabilitySlots.find(s => s.dayOfWeek === index);
    return { day, index, slot };
  });

  if (!user || user.role !== "doctor") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 pt-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Your Availability
          </h1>
          <p className="text-gray-600">Set your available time slots for appointments</p>
        </div>

        {/* Add Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
          >
            {showForm ? "Cancel" : "+ Add Time Slot"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {editingSlot ? "Edit Time Slot" : "Add New Time Slot"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Day of Week
                </label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {DAYS_OF_WEEK.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Clinic Location (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search location or enter address..."
                    value={formData.location.address}
                    onChange={(e) => handleLocationSearch(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLocationModal(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    🗺️ Map
                  </button>
                </div>

                {/* Location Predictions */}
                {predictions.length > 0 && (
                  <div className="mt-2 border border-gray-300 rounded-lg bg-white max-h-48 overflow-y-auto">
                    {predictions.map((prediction, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handlePlaceSelect(prediction)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0 text-sm"
                      >
                        {prediction.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  {editingSlot ? "Update" : "Add"} Slot
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Availability Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Weekly Schedule</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slotsByDay.map(({ day, index, slot }) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    slot
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <h3 className="font-bold text-gray-800 mb-3">{day}</h3>
                  {slot ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        {slot.startTime} - {slot.endTime}
                      </p>
                      {slot.location?.address && (
                        <p className="text-xs text-blue-600 mb-3 flex items-center gap-1">
                          📍 {slot.location.address}
                        </p>
                      )}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(slot)}
                          className="flex-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(slot._id)}
                          className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Not available</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/doctor/dashboard")}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Location Map Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full h-[600px] flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Select Clinic Location</h2>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <LocationMapPicker 
                onLocationSelect={handleLocationSelect}
                initialLat={formData.location?.latitude || 40}
                initialLng={formData.location?.longitude || -95}
              />
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => setShowLocationModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
