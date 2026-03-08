"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface User {
  _id: string;
  name: string;
  email: string;
  role: "patient" | "doctor" | "admin";
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalPatients: number;
  totalDoctors: number;
  totalAdmins: number;
}

interface Activity {
  _id: string;
  action: string;
  actionTitle: string;
  userName: string;
  userEmail: string;
  description?: string;
  metadata?: any;
  createdAt: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [contactStats, setContactStats] = useState({ total: 0, unread: 0, read: 0, replied: 0 });
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    totalAdmins: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showNewAppointmentPage, setShowNewAppointmentPage] = useState(false);
  const [addUserFormData, setAddUserFormData] = useState({ name: "", email: "", password: "", role: "patient" as "patient" | "doctor" });
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState({ patientId: "", requestedDate: "", reason: "" });
  const [editFormData, setEditFormData] = useState({ name: "", email: "", role: "patient" });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteActivityConfirm, setDeleteActivityConfirm] = useState<string | null>(null);
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [doctorAvailability, setDoctorAvailability] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Pagination states for each activity category
  const [activityPagination, setActivityPagination] = useState({
    user_registration: 1,
    user_verified: 1,
    password_reset_requested: 1,
    profile_updated: 1,
    appointment_scheduled: 1,
    appointment_approved: 1,
    appointment_rejected: 1,
  });
  const activitiesPerPage = 5;
  
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
    if (user && user.role === "admin") {
      fetchAllUsers();
      fetchActivities();
      fetchContactStats();
      fetchContactMessages();
    }
  }, [user]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:4000/api/admin/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setAllUsers(data.users || []);

      // Calculate stats
      const totalUsers = data.users?.length || 0;
      const totalPatients =
        data.users?.filter((u: User) => u.role?.toLowerCase() === "patient").length || 0;
      const totalDoctors =
        data.users?.filter((u: User) => u.role?.toLowerCase() === "doctor").length || 0;
      const totalAdmins =
        data.users?.filter((u: User) => u.role?.toLowerCase() === "admin").length || 0;

      setStats({
        totalUsers,
        totalPatients,
        totalDoctors,
        totalAdmins,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load users"
      );
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:4000/api/activities", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }

      const data = await response.json();
      setActivities(data.activities || []);
    } catch (err) {
      console.error("Error fetching activities:", err);
    }
  };

  const fetchContactStats = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:4000/api/contact/stats/overview", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch contact stats");
      }

      const data = await response.json();
      setContactStats({
        total: data.data?.total || 0,
        unread: data.data?.unread || 0,
        read: data.data?.read || 0,
        replied: data.data?.replied || 0,
      });
    } catch (err) {
      console.error("Error fetching contact stats:", err);
    }
  };

  const fetchContactMessages = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:4000/api/contact?limit=5&sort=-createdAt", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch contact messages");
      }

      const data = await response.json();
      setContactMessages(data.data || []);
    } catch (err) {
      console.error("Error fetching contact messages:", err);
    }
  };

  // Helper function to get paginated activities by action
  const getPaginatedActivities = (action: string | string[]) => {
    const actionArray = Array.isArray(action) ? action : [action];
    const filtered = activities.filter(a => actionArray.includes(a.action));
    const page = activityPagination[action as keyof typeof activityPagination] || 1;
    const startIdx = (page - 1) * activitiesPerPage;
    const endIdx = startIdx + activitiesPerPage;
    return filtered.slice(startIdx, endIdx);
  };

  // Helper function to get total pages for an action
  const getTotalPages = (action: string | string[]) => {
    const actionArray = Array.isArray(action) ? action : [action];
    const filtered = activities.filter(a => actionArray.includes(a.action));
    return Math.ceil(filtered.length / activitiesPerPage);
  };

  // Helper function to change page for an activity category
  const changeActivityPage = (action: string, newPage: number) => {
    setActivityPagination(prev => ({
      ...prev,
      [action]: newPage
    }));
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      setDeletingActivityId(activityId);
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:4000/api/activities/${activityId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete activity");
      }

      alert("Activity deleted successfully");
      setDeleteActivityConfirm(null);
      setDeletingActivityId(null);
      await fetchActivities();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete activity");
      setDeletingActivityId(null);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAddUserLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:4000/api/auth/signup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: addUserFormData.name,
          email: addUserFormData.email,
          password: addUserFormData.password,
          role: addUserFormData.role,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create user");
      }

      alert("User created successfully!");
      setShowAddUserModal(false);
      setAddUserFormData({ name: "", email: "", password: "", role: "patient" });
      await fetchAllUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setAddUserLoading(false);
    }
  };

  const fetchDoctorAvailability = async (doctorId: string) => {
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching availability for doctor:", doctorId);
      const response = await fetch(`http://localhost:4000/api/availability/${doctorId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch doctor availability: ${response.status}`);
      }

      const data = await response.json();
      console.log("Full API response:", data);
      console.log("Available slots:", data.availabilitySlots);
      
      // Handle both response formats
      const slots = data.availabilitySlots || data || [];
      console.log("Setting doctor availability to:", slots);
      setDoctorAvailability(slots);
    } catch (err) {
      console.error("Error fetching doctor availability:", err);
      setDoctorAvailability([]);
    }
  };

  // Generate available appointment slots based on doctor's availability
  const generateAvailableDates = (): string[] => {
    if (!doctorAvailability || doctorAvailability.length === 0) {
      return [];
    }

    const dates: Set<string> = new Set();
    const now = new Date();
    const maxDays = 90; // Generate dates for next 90 days

    for (let daysAhead = 1; daysAhead <= maxDays; daysAhead++) {
      const date = new Date(now);
      date.setDate(date.getDate() + daysAhead);
      const dayOfWeek = date.getDay();

      // Find availability for this day of week
      const dayAvailability = doctorAvailability.find(a => a.dayOfWeek === dayOfWeek);
      if (!dayAvailability) continue;

      // Add only the date (YYYY-MM-DD), not time
      const dateStr = date.toISOString().split('T')[0];
      dates.add(dateStr);
    }

    return Array.from(dates).sort();
  };

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }

  const handleViewUser = (userData: User) => {
    setSelectedUser(userData);
    setShowViewModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      console.log("Deleting user:", userId);
      const token = localStorage.getItem("token");
      console.log("Token:", token ? "exists" : "missing");
      
      const response = await fetch(`http://localhost:4000/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Delete response status:", response.status);
      const responseData = await response.json();
      console.log("Delete response:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to delete user");
      }

      console.log("User deleted successfully");
      setDeleteConfirm(null);
      await fetchAllUsers(); // Refresh the table
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to delete user";
      console.error("Error deleting user:", errorMsg);
      alert(errorMsg);
    }
  };

  const handleEditUser = (userData: User) => {
    setSelectedUser(userData);
    setEditFormData({
      name: userData.name,
      email: userData.email,
      role: userData.role.toLowerCase(),
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      setUpdateLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:4000/api/admin/users/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editFormData.name,
          email: editFormData.email,
          role: editFormData.role,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update user");
      }

      alert("User updated successfully!");
      setShowEditModal(false);
      await fetchAllUsers(); // Refresh the table
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update user";
      console.error("Error updating user:", errorMsg);
      alert(errorMsg);
    } finally {
      setUpdateLoading(false);
    }
  };

  const stats_data = [
    { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "from-blue-500 to-cyan-500", change: "+12%" },
    { label: "Active Patients", value: stats.totalPatients, icon: "🏥", color: "from-green-500 to-emerald-500", change: "+8%" },
    { label: "Doctors", value: stats.totalDoctors, icon: "⚕️", color: "from-purple-500 to-pink-500", change: "+3%" },
    { label: "Admins", value: stats.totalAdmins, icon: "👨‍💼", color: "from-orange-500 to-red-500", change: "+1%" },
  ];

  // Generate real chart data based on actual user creation dates
  const generateRealChartData = () => {
    if (allUsers.length === 0) {
      return [
        { date: "No Data", users: 0, patients: 0, doctors: 0, admins: 0 },
      ];
    }

    // Get all unique dates when users were created
    const usersByDate: { [key: string]: { users: any[]; patients: any[]; doctors: any[]; admins: any[] } } = {};
    
    allUsers.forEach(user => {
      const createdDate = new Date(user.createdAt);
      const dateKey = createdDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      if (!usersByDate[dateKey]) {
        usersByDate[dateKey] = { users: [], patients: [], doctors: [], admins: [] };
      }

      usersByDate[dateKey].users.push(user);
      
      // Categorize by role
      if (user.role?.toLowerCase() === "patient") {
        usersByDate[dateKey].patients.push(user);
      } else if (user.role?.toLowerCase() === "doctor") {
        usersByDate[dateKey].doctors.push(user);
      } else if (user.role?.toLowerCase() === "admin") {
        usersByDate[dateKey].admins.push(user);
      }
    });

    // Get sorted unique dates
    const sortedDates = Object.keys(usersByDate).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });

    // Calculate cumulative counts per date
    let cumulativeUsers = 0;
    let cumulativePatients = 0;
    let cumulativeDoctors = 0;
    let cumulativeAdmins = 0;

    const chartDataArray = sortedDates.map(dateKey => {
      cumulativeUsers += usersByDate[dateKey].users.length;
      cumulativePatients += usersByDate[dateKey].patients.length;
      cumulativeDoctors += usersByDate[dateKey].doctors.length;
      cumulativeAdmins += usersByDate[dateKey].admins.length;

      return {
        date: dateKey,
        users: cumulativeUsers,
        patients: cumulativePatients,
        doctors: cumulativeDoctors,
        admins: cumulativeAdmins,
      };
    });

    return chartDataArray.length > 0 ? chartDataArray : [{ date: "No Data", users: 0, patients: 0, doctors: 0, admins: 0 }];
  };

  const chartData = generateRealChartData();

  const getActionTypeColor = (action: string) => {
    switch (action) {
      case "user_registration":
        return "text-green-600";
      case "appointment_scheduled":
        return "text-blue-600";
      case "profile_updated":
        return "text-yellow-600";
      case "user_verified":
        return "text-purple-600";
      case "password_reset_requested":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const handleScheduleAppointment = (doctorId: string) => {
    console.log("Schedule appointment clicked for doctor:", doctorId);
    setSelectedDoctorId(doctorId);
    setScheduleFormData({ patientId: "", requestedDate: "", reason: "" });
    setShowScheduleModal(true);
    // Fetch availability immediately
    fetchDoctorAvailability(doctorId);
  };

  const handleConfirmScheduleAppointment = async () => {
    if (!scheduleFormData.patientId || !scheduleFormData.requestedDate || !scheduleFormData.reason) {
      alert("Please fill all fields");
      return;
    }

    // Validate that the selected date is in the future
    const selectedDate = new Date(scheduleFormData.requestedDate);
    const now = new Date();
    
    if (selectedDate <= now) {
      alert("Please select a future date");
      return;
    }

    try {
      // Auto-assign time based on doctor availability
      let appointmentTime = "";
      if (doctorAvailability && doctorAvailability.length > 0) {
        const selectedDateObj = new Date(scheduleFormData.requestedDate);
        const dayOfWeek = selectedDateObj.getDay();
        const dayAvailability = doctorAvailability.find((a: any) => a.dayOfWeek === dayOfWeek);

        if (dayAvailability) {
          const [startHour, startMin] = dayAvailability.startTime.split(':').map(Number);
          const [endHour, endMin] = dayAvailability.endTime.split(':').map(Number);

          // Parse the date string properly (YYYY-MM-DD format)
          const [year, month, day] = scheduleFormData.requestedDate.split('-').map(Number);
          
          // Generate a simple time slot based on current time
          // This ensures different appointments get different times
          const now = new Date();
          const slotIndex = Math.floor(now.getMilliseconds() / 100); // Use milliseconds for simple variation
          
          // Create date in local timezone (not UTC)
          const appointmentDateTime = new Date(year, month - 1, day, startHour, startMin, 0, 0);
          
          // Add 30 minute intervals based on slot index
          const slotMinutes = (slotIndex % 8) * 30; // Max 8 slots (4 hours)
          appointmentDateTime.setMinutes(appointmentDateTime.getMinutes() + slotMinutes);

          // Check if the calculated time is within doctor's available hours
          const appointmentEndTime = new Date(appointmentDateTime);
          appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + 30);

          const endDateTime = new Date(year, month - 1, day, endHour, endMin, 0, 0);

          if (appointmentEndTime > endDateTime) {
            alert(`Doctor's availability ends at ${dayAvailability.endTime}. No more slots available for this date.`);
            return;
          }

          // Format time properly for sending to backend
          const hours = String(appointmentDateTime.getHours()).padStart(2, '0');
          const minutes = String(appointmentDateTime.getMinutes()).padStart(2, '0');
          const formattedDateStr = String(appointmentDateTime.getFullYear()).padStart(4, '0') + '-' +
                         String(appointmentDateTime.getMonth() + 1).padStart(2, '0') + '-' +
                         String(appointmentDateTime.getDate()).padStart(2, '0');
          appointmentTime = `${formattedDateStr}T${hours}:${minutes}`;
        } else {
          alert("Doctor is not available on this day");
          return;
        }
      } else {
        alert("Doctor has not set their availability yet");
        return;
      }

      // Schedule the appointment with auto-assigned time
      const token = localStorage.getItem("token");
      const scheduleResponse = await fetch("http://localhost:4000/api/appointments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          patientId: scheduleFormData.patientId,
          requestedDate: appointmentTime,
          reason: scheduleFormData.reason,
        }),
      });

      if (!scheduleResponse.ok) {
        throw new Error("Failed to schedule appointment");
      }

      alert("Appointment scheduled successfully!");
      setShowScheduleModal(false);
      setScheduleFormData({ patientId: "", requestedDate: "", reason: "" });
      await fetchActivities();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to schedule appointment");
    }
  };

  const handleVerifyUser = (userId: string) => {
    // Navigate to verification page
    window.location.href = `/admin/verify-doctor?id=${userId}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Patient":
        return "bg-blue-100 text-blue-700";
      case "Doctor":
        return "bg-purple-100 text-purple-700";
      case "Admin":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                A
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user?.name || "Admin"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content with top space */}
      <div className="pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats_data.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-2xl shadow-md`}
                >
                  {stat.icon}
                </div>
                <span className="text-green-500 text-sm font-semibold bg-green-50 px-3 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">
                {stat.label}
              </h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 flex space-x-2 overflow-x-auto">
          {["overview", "users", "activity"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex-1 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* User Growth Analytics Chart */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">
                    User Growth Analytics
                  </h2>
                  <Line
                    data={{
                      labels: chartData.map(d => d.date),
                      datasets: [
                        {
                          label: 'Total Users',
                          data: chartData.map(d => d.users),
                          borderColor: '#3b82f6',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          borderWidth: 2,
                          tension: 0.4,
                          fill: true,
                          pointRadius: 4,
                          pointHoverRadius: 6,
                          pointBackgroundColor: '#3b82f6',
                        },
                        {
                          label: 'Patients',
                          data: chartData.map(d => d.patients),
                          borderColor: '#10b981',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          borderWidth: 2,
                          tension: 0.4,
                          fill: true,
                          pointRadius: 4,
                          pointHoverRadius: 6,
                          pointBackgroundColor: '#10b981',
                        },
                        {
                          label: 'Doctors',
                          data: chartData.map(d => d.doctors),
                          borderColor: '#8b5cf6',
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          borderWidth: 2,
                          tension: 0.4,
                          fill: true,
                          pointRadius: 4,
                          pointHoverRadius: 6,
                          pointBackgroundColor: '#8b5cf6',
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                          labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: { size: 12, weight: 'bold' },
                          },
                        },
                        title: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                          },
                          ticks: {
                            font: { size: 11 },
                          },
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                          ticks: {
                            font: { size: 11 },
                          },
                        },
                      },
                    }}
                  />
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        label: "Add User",
                        icon: "➕",
                        color: "from-green-500 to-emerald-500",
                        action: () => setShowAddUserModal(true),
                      },
                      {
                        label: "Manage Banners",
                        icon: "🎨",
                        color: "from-indigo-500 to-blue-500",
                        action: () => router.push("/admin/banner"),
                      },
                      {
                        label: "View Reports",
                        icon: "📄",
                        color: "from-blue-500 to-cyan-500",
                        action: () => alert("Reports feature coming soon!"),
                      },
                      {
                        label: "Send Email",
                        icon: "✉️",
                        color: "from-purple-500 to-pink-500",
                        action: () => alert("Email feature coming soon!"),
                      },
                      {
                        label: "Settings",
                        icon: "⚙️",
                        color: "from-orange-500 to-red-500",
                        action: () => alert("Settings coming soon!"),
                      },
                    ].map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className={`bg-gradient-to-br ${action.color} text-white p-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center space-y-2`}
                      >
                        <span className="text-3xl">{action.icon}</span>
                        <span className="font-medium">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    All Registered Users
                  </h2>

                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading users...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="p-6 text-center">
                    <p className="text-red-600 font-medium">Error: {error}</p>
                    <button
                      onClick={fetchAllUsers}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : allUsers.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <p className="text-lg font-medium">No users found</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                              Name
                            </th>
                            <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                              Email
                            </th>
                            <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                              Role
                            </th>
                            <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                              Joined
                            </th>
                            <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {allUsers
                            .slice(
                              (currentPage - 1) * itemsPerPage,
                              currentPage * itemsPerPage
                            )
                            .map((u, index) => (
                              <tr
                                key={u._id}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                              >
                                <td className="py-4 px-4">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                      {u.name[0]}
                                    </div>
                                    <span className="font-medium text-gray-800">
                                      {u.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-gray-600">
                                  {u.email}
                                </td>
                                <td className="py-4 px-4">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      getRoleColor(u.role)
                                    }`}
                                  >
                                    {u.role}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-sm text-gray-600">
                                  {formatDate(u.createdAt)}
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleViewUser(u)}
                                      className="text-blue-600 hover:text-blue-800 transition-colors"
                                      title="View user details"
                                    >
                                      <span className="text-lg">👁️</span>
                                    </button>
                                    <button
                                      onClick={() => handleEditUser(u)}
                                      className="text-green-600 hover:text-green-800 transition-colors"
                                      title="Edit user"
                                    >
                                      <span className="text-lg">✏️</span>
                                    </button>
                                    {u.role?.toLowerCase() === "doctor" && (
                                      <button
                                        onClick={() => handleVerifyUser(u._id)}
                                        className="text-purple-600 hover:text-purple-800 transition-colors"
                                        title="Verify doctor"
                                      >
                                        <span className="text-lg">✅</span>
                                      </button>
                                    )}
                                    {u.role?.toLowerCase() === "doctor" && (
                                      <button
                                        onClick={() => handleScheduleAppointment(u._id)}
                                        className="text-orange-600 hover:text-orange-800 transition-colors"
                                        title="Schedule appointment"
                                      >
                                        <span className="text-lg">📅</span>
                                      </button>
                                    )}
                                    <button
                                      onClick={() => setDeleteConfirm(u._id)}
                                      className="text-red-600 hover:text-red-800 transition-colors"
                                      title="Delete user"
                                    >
                                      <span className="text-lg">🗑️</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, allUsers.length)} to{" "}
                        {Math.min(currentPage * itemsPerPage, allUsers.length)} of {allUsers.length} users
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        <div className="flex items-center space-x-2">
                          {Array.from({
                            length: Math.ceil(allUsers.length / itemsPerPage),
                          }).map((_, i) => (
                            <button
                              key={i + 1}
                              onClick={() => setCurrentPage(i + 1)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === i + 1
                                  ? "bg-blue-600 text-white"
                                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() =>
                            setCurrentPage(
                              Math.min(
                                Math.ceil(allUsers.length / itemsPerPage),
                                currentPage + 1
                              )
                            )
                          }
                          disabled={
                            currentPage === Math.ceil(allUsers.length / itemsPerPage)
                          }
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "activity" && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold mb-6 text-gray-800">
                  Activity Log
                </h2>
                {activities.length > 0 ? (
                  <div className="space-y-8">
                    {/* New User Registration Section */}
                    {activities.some(a => a.action === "user_registration") && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-blue-200">
                          👤 New user registration
                        </h3>
                        <div className="space-y-3">
                          {getPaginatedActivities("user_registration")
                            .map((activity) => (
                              <div key={activity._id}>
                                {deleteActivityConfirm === activity._id ? (
                                  <div className="flex items-start space-x-4 p-4 rounded-xl border-2 border-red-300 bg-red-50">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-red-100 text-red-600">
                                      ⚠️
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-800">
                                        Delete this activity?
                                      </p>
                                      <div className="flex gap-2 mt-3">
                                        <button
                                          onClick={() => handleDeleteActivity(activity._id)}
                                          disabled={deletingActivityId === activity._id}
                                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                                        >
                                          {deletingActivityId === activity._id ? "Deleting..." : "Delete"}
                                        </button>
                                        <button
                                          onClick={() => setDeleteActivityConfirm(null)}
                                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100 text-blue-600">
                                      📝
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-800">
                                        {activity.actionTitle}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {activity.userName || activity.userEmail}
                                      </p>
                                      {activity.description && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          {activity.description}
                                        </p>
                                      )}
                                      <p className="text-xs text-gray-400 mt-1">
                                        {new Date(activity.createdAt).toLocaleString()}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => setDeleteActivityConfirm(activity._id)}
                                      className="px-2 py-1 text-red-500 hover:bg-red-50 rounded text-sm font-medium"
                                    >
                                      🗑️ Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                        {getTotalPages("user_registration") > 1 && (
                          <div className="flex justify-center items-center gap-2 mt-4">
                            <button
                              onClick={() => changeActivityPage("user_registration", Math.max(1, (activityPagination.user_registration || 1) - 1))}
                              disabled={(activityPagination.user_registration || 1) === 1}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                            >
                              Prev
                            </button>
                            <span className="text-sm text-gray-600">
                              Page {activityPagination.user_registration || 1} of {getTotalPages("user_registration")}
                            </span>
                            <button
                              onClick={() => changeActivityPage("user_registration", Math.min(getTotalPages("user_registration"), (activityPagination.user_registration || 1) + 1))}
                              disabled={(activityPagination.user_registration || 1) === getTotalPages("user_registration")}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* User Verified Section */}
                    {activities.some(a => a.action === "user_verified") && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-green-200">
                          ✅ User verified
                        </h3>
                        <div className="space-y-3">
                          {getPaginatedActivities("user_verified")
                            .map((activity) => (
                              <div key={activity._id}>
                                {deleteActivityConfirm === activity._id ? (
                                  <div className="flex items-start space-x-4 p-4 rounded-xl border-2 border-red-300 bg-red-50">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-red-100 text-red-600">
                                      ⚠️
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-800">
                                        Delete this activity?
                                      </p>
                                      <div className="flex gap-2 mt-3">
                                        <button
                                          onClick={() => handleDeleteActivity(activity._id)}
                                          disabled={deletingActivityId === activity._id}
                                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                                        >
                                          {deletingActivityId === activity._id ? "Deleting..." : "Delete"}
                                        </button>
                                        <button
                                          onClick={() => setDeleteActivityConfirm(null)}
                                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100 text-green-600">
                                      ✅
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-800">
                                        {activity.actionTitle}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {activity.userName || activity.userEmail}
                                      </p>
                                      {activity.description && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          {activity.description}
                                        </p>
                                      )}
                                      <p className="text-xs text-gray-400 mt-1">
                                        {new Date(activity.createdAt).toLocaleString()}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => setDeleteActivityConfirm(activity._id)}
                                      className="px-2 py-1 text-red-500 hover:bg-red-50 rounded text-sm font-medium"
                                    >
                                      🗑️ Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                        {getTotalPages("user_verified") > 1 && (
                          <div className="flex justify-center items-center gap-2 mt-4">
                            <button
                              onClick={() => changeActivityPage("user_verified", Math.max(1, (activityPagination.user_verified || 1) - 1))}
                              disabled={(activityPagination.user_verified || 1) === 1}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                            >
                              Prev
                            </button>
                            <span className="text-sm text-gray-600">
                              Page {activityPagination.user_verified || 1} of {getTotalPages("user_verified")}
                            </span>
                            <button
                              onClick={() => changeActivityPage("user_verified", Math.min(getTotalPages("user_verified"), (activityPagination.user_verified || 1) + 1))}
                              disabled={(activityPagination.user_verified || 1) === getTotalPages("user_verified")}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Other User Activities Section */}
                    {activities.some(a => ["password_reset_requested", "profile_updated"].includes(a.action)) && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-yellow-200">
                          ⚠️ Other Activities
                        </h3>
                        <div className="space-y-3">
                          {getPaginatedActivities(["password_reset_requested", "profile_updated"])
                            .map((activity) => {
                              let activityIcon = "⚠";
                              let bgColor = "bg-yellow-100 text-yellow-600";

                              if (activity.action === "password_reset_requested") {
                                activityIcon = "🔑";
                              } else if (activity.action === "profile_updated") {
                                activityIcon = "📝";
                              }

                              return (
                                <div key={activity._id}>
                                  {deleteActivityConfirm === activity._id ? (
                                    <div className="flex items-start space-x-4 p-4 rounded-xl border-2 border-red-300 bg-red-50">
                                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-red-100 text-red-600">
                                        ⚠️
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-800">
                                          Delete this activity?
                                        </p>
                                        <div className="flex gap-2 mt-3">
                                          <button
                                            onClick={() => handleDeleteActivity(activity._id)}
                                            disabled={deletingActivityId === activity._id}
                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                                          >
                                            {deletingActivityId === activity._id ? "Deleting..." : "Delete"}
                                          </button>
                                          <button
                                            onClick={() => setDeleteActivityConfirm(null)}
                                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${bgColor}`}>
                                        {activityIcon}
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-800">
                                          {activity.actionTitle}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          {activity.userName || activity.userEmail}
                                        </p>
                                        {activity.description && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            {activity.description}
                                          </p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                          {new Date(activity.createdAt).toLocaleString()}
                                        </p>
                                      </div>
                                      <button
                                        onClick={() => setDeleteActivityConfirm(activity._id)}
                                        className="px-2 py-1 text-red-500 hover:bg-red-50 rounded text-sm font-medium"
                                      >
                                        🗑️ Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                        {getTotalPages(["password_reset_requested", "profile_updated"]) > 1 && (
                          <div className="flex justify-center items-center gap-2 mt-4">
                            <button
                              onClick={() => changeActivityPage("password_reset_requested", Math.max(1, (activityPagination.password_reset_requested || 1) - 1))}
                              disabled={(activityPagination.password_reset_requested || 1) === 1}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                            >
                              Prev
                            </button>
                            <span className="text-sm text-gray-600">
                              Page {activityPagination.password_reset_requested || 1} of {getTotalPages(["password_reset_requested", "profile_updated"])}
                            </span>
                            <button
                              onClick={() => changeActivityPage("password_reset_requested", Math.min(getTotalPages(["password_reset_requested", "profile_updated"]), (activityPagination.password_reset_requested || 1) + 1))}
                              disabled={(activityPagination.password_reset_requested || 1) === getTotalPages(["password_reset_requested", "profile_updated"])}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Appointment Activities Section */}
                    {activities.some(a => ["appointment_scheduled", "appointment_approved", "appointment_rejected"].includes(a.action)) && (
                      <div>
                        {/* Appointment Scheduled */}
                        {activities.some(a => a.action === "appointment_scheduled") && (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-blue-200">
                              📅 Appointment Scheduled
                            </h3>
                            <div className="space-y-3">
                              {getPaginatedActivities("appointment_scheduled")
                                .map((activity) => (
                                  <div key={activity._id}>
                                    {deleteActivityConfirm === activity._id ? (
                                      <div className="flex items-start space-x-4 p-4 rounded-xl border-2 border-red-300 bg-red-50">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-red-100 text-red-600">
                                          ⚠️
                                        </div>
                                        <div className="flex-1">
                                          <p className="font-medium text-gray-800">
                                            Delete this activity?
                                          </p>
                                          <div className="flex gap-2 mt-3">
                                            <button
                                              onClick={() => handleDeleteActivity(activity._id)}
                                              disabled={deletingActivityId === activity._id}
                                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                                            >
                                              {deletingActivityId === activity._id ? "Deleting..." : "Delete"}
                                            </button>
                                            <button
                                              onClick={() => setDeleteActivityConfirm(null)}
                                              className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100 text-blue-600">
                                          📅
                                        </div>
                                        <div className="flex-1">
                                          <p className="font-medium text-gray-800">
                                            {activity.actionTitle}
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            By: {activity.userName || activity.userEmail}
                                          </p>
                                          {activity.metadata?.patientName && (
                                            <p className="text-sm text-gray-600">
                                              Patient: {activity.metadata.patientName} ({activity.metadata.patientId})
                                            </p>
                                          )}
                                          {activity.description && (
                                            <p className="text-xs text-gray-500 mt-1">
                                              {activity.description}
                                            </p>
                                          )}
                                          <p className="text-xs text-gray-400 mt-1">
                                            {new Date(activity.createdAt).toLocaleString()}
                                          </p>
                                        </div>
                                        <button
                                          onClick={() => setDeleteActivityConfirm(activity._id)}
                                          className="px-2 py-1 text-red-500 hover:bg-red-50 rounded text-sm font-medium"
                                        >
                                          🗑️ Delete
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                            {getTotalPages("appointment_scheduled") > 1 && (
                              <div className="flex justify-center items-center gap-2 mt-4">
                                <button
                                  onClick={() => changeActivityPage("appointment_scheduled", Math.max(1, (activityPagination.appointment_scheduled || 1) - 1))}
                                  disabled={(activityPagination.appointment_scheduled || 1) === 1}
                                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                                >
                                  Prev
                                </button>
                                <span className="text-sm text-gray-600">
                                  Page {activityPagination.appointment_scheduled || 1} of {getTotalPages("appointment_scheduled")}
                                </span>
                                <button
                                  onClick={() => changeActivityPage("appointment_scheduled", Math.min(getTotalPages("appointment_scheduled"), (activityPagination.appointment_scheduled || 1) + 1))}
                                  disabled={(activityPagination.appointment_scheduled || 1) === getTotalPages("appointment_scheduled")}
                                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                                >
                                  Next
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Appointment Approved */}
                        {activities.some(a => a.action === "appointment_approved") && (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-green-200">
                              ✅ Appointment Approved
                            </h3>
                            <div className="space-y-3">
                              {getPaginatedActivities("appointment_approved")
                                .map((activity) => (
                                  <div key={activity._id}>
                                    {deleteActivityConfirm === activity._id ? (
                                      <div className="flex items-start space-x-4 p-4 rounded-xl border-2 border-red-300 bg-red-50">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-red-100 text-red-600">
                                          ⚠️
                                        </div>
                                        <div className="flex-1">
                                          <p className="font-medium text-gray-800">
                                            Delete this activity?
                                          </p>
                                          <div className="flex gap-2 mt-3">
                                            <button
                                              onClick={() => handleDeleteActivity(activity._id)}
                                              disabled={deletingActivityId === activity._id}
                                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                                            >
                                              {deletingActivityId === activity._id ? "Deleting..." : "Delete"}
                                            </button>
                                            <button
                                              onClick={() => setDeleteActivityConfirm(null)}
                                              className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100 text-green-600">
                                          ✅
                                        </div>
                                        <div className="flex-1">
                                          <p className="font-medium text-gray-800">
                                            {activity.actionTitle}
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            By: {activity.userName || activity.userEmail}
                                          </p>
                                          {activity.metadata?.patientName && (
                                            <p className="text-sm text-gray-600">
                                              Patient: {activity.metadata.patientName} ({activity.metadata.patientId})
                                            </p>
                                          )}
                                          {activity.description && (
                                            <p className="text-xs text-gray-500 mt-1">
                                              {activity.description}
                                            </p>
                                          )}
                                          <p className="text-xs text-gray-400 mt-1">
                                            {new Date(activity.createdAt).toLocaleString()}
                                          </p>
                                        </div>
                                        <button
                                          onClick={() => setDeleteActivityConfirm(activity._id)}
                                          className="px-2 py-1 text-red-500 hover:bg-red-50 rounded text-sm font-medium"
                                        >
                                          🗑️ Delete
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                            {getTotalPages("appointment_approved") > 1 && (
                              <div className="flex justify-center items-center gap-2 mt-4">
                                <button
                                  onClick={() => changeActivityPage("appointment_approved", Math.max(1, (activityPagination.appointment_approved || 1) - 1))}
                                  disabled={(activityPagination.appointment_approved || 1) === 1}
                                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                                >
                                  Prev
                                </button>
                                <span className="text-sm text-gray-600">
                                  Page {activityPagination.appointment_approved || 1} of {getTotalPages("appointment_approved")}
                                </span>
                                <button
                                  onClick={() => changeActivityPage("appointment_approved", Math.min(getTotalPages("appointment_approved"), (activityPagination.appointment_approved || 1) + 1))}
                                  disabled={(activityPagination.appointment_approved || 1) === getTotalPages("appointment_approved")}
                                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                                >
                                  Next
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Appointment Rejected */}
                        {activities.some(a => a.action === "appointment_rejected") && (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-red-200">
                              ❌ Appointment Rejected
                            </h3>
                            <div className="space-y-3">
                              {getPaginatedActivities("appointment_rejected")
                                .map((activity) => (
                                  <div key={activity._id}>
                                    {deleteActivityConfirm === activity._id ? (
                                      <div className="flex items-start space-x-4 p-4 rounded-xl border-2 border-red-300 bg-red-50">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-red-100 text-red-600">
                                          ⚠️
                                        </div>
                                        <div className="flex-1">
                                          <p className="font-medium text-gray-800">
                                            Delete this activity?
                                          </p>
                                          <div className="flex gap-2 mt-3">
                                            <button
                                              onClick={() => handleDeleteActivity(activity._id)}
                                              disabled={deletingActivityId === activity._id}
                                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                                            >
                                              {deletingActivityId === activity._id ? "Deleting..." : "Delete"}
                                            </button>
                                            <button
                                              onClick={() => setDeleteActivityConfirm(null)}
                                              className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-red-100 text-red-600">
                                          ❌
                                        </div>
                                        <div className="flex-1">
                                          <p className="font-medium text-gray-800">
                                            {activity.actionTitle}
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            By: {activity.userName || activity.userEmail}
                                          </p>
                                          {activity.metadata?.patientName && (
                                            <p className="text-sm text-gray-600">
                                              Patient: {activity.metadata.patientName} ({activity.metadata.patientId})
                                            </p>
                                          )}
                                          {activity.description && (
                                            <p className="text-xs text-gray-500 mt-1">
                                              {activity.description}
                                            </p>
                                          )}
                                          <p className="text-xs text-gray-400 mt-1">
                                            {new Date(activity.createdAt).toLocaleString()}
                                          </p>
                                        </div>
                                        <button
                                          onClick={() => setDeleteActivityConfirm(activity._id)}
                                          className="px-2 py-1 text-red-500 hover:bg-red-50 rounded text-sm font-medium"
                                        >
                                          🗑️ Delete
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                            {getTotalPages("appointment_rejected") > 1 && (
                              <div className="flex justify-center items-center gap-2 mt-4">
                                <button
                                  onClick={() => changeActivityPage("appointment_rejected", Math.max(1, (activityPagination.appointment_rejected || 1) - 1))}
                                  disabled={(activityPagination.appointment_rejected || 1) === 1}
                                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                                >
                                  Prev
                                </button>
                                <span className="text-sm text-gray-600">
                                  Page {activityPagination.appointment_rejected || 1} of {getTotalPages("appointment_rejected")}
                                </span>
                                <button
                                  onClick={() => changeActivityPage("appointment_rejected", Math.min(getTotalPages("appointment_rejected"), (activityPagination.appointment_rejected || 1) + 1))}
                                  disabled={(activityPagination.appointment_rejected || 1) === getTotalPages("appointment_rejected")}
                                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                                >
                                  Next
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No activities yet
                  </p>
                )}
              </div>
            )}


          </div>
          <div className="space-y-6">
            {/* System Status */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold mb-4 text-gray-800">
                System Status
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Server Status", value: "Online", color: "green" },
                  { label: "Database", value: "Connected", color: "green" },
                  { label: "API Response", value: "45ms", color: "green" },
                  { label: "Storage Used", value: "67%", color: "yellow" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-gray-600">
                      {item.label}
                    </span>
                    <span
                      className={`text-sm font-medium px-3 py-1 rounded-full ${
                        item.color === "green"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold mb-4 text-gray-800">
                Notifications
              </h3>
              <div className="space-y-3">
                {[
                  {
                    title: "System backup completed",
                    time: "1h ago",
                    icon: "💾",
                    action: () => alert("Backup details coming soon!"),
                  },
                  {
                    title: "User report submitted",
                    time: "2h ago",
                    icon: "📝",
                    action: () => alert("Report details coming soon!"),
                  },
                ].map((notif, index) => (
                  <button
                    key={index}
                    onClick={notif.action}
                    className="w-full flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 text-left"
                  >
                    <span className="text-2xl">{notif.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-400">{notif.time}</p>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Messages Button */}
              <button
                onClick={() => router.push("/admin/contact-messages")}
                className="w-full bg-white text-gray-900 p-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center space-y-2 mt-4 font-medium border-2 border-gray-200 hover:border-gray-400"
              >
                <span className="text-2xl">📧</span>
                <span>View Contact Messages</span>
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Today's Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-sm opacity-90">New Signups</span>
                  <span className="text-2xl font-bold">{stats.totalUsers}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-sm opacity-90">Active Patients</span>
                  <span className="text-2xl font-bold">{stats.totalPatients}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Active Sessions</span>
                  <span className="text-2xl font-bold">{stats.totalAdmins + stats.totalDoctors}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600">
              <h2 className="text-xl font-bold text-white">User Details</h2>
            </div>
            <div className="px-6 py-6 space-y-4">
              <div>
                <label className="text-sm text-gray-600 font-medium">Name</label>
                <p className="text-gray-800 font-semibold">{selectedUser.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Email</label>
                <p className="text-gray-800">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Role</label>
                <p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Joined Date</label>
                <p className="text-gray-800">{formatDate(selectedUser.createdAt)}</p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600">
              <h2 className="text-xl font-bold text-white">Edit User</h2>
            </div>
            <div className="px-6 py-6 space-y-4">
              <div>
                <label className="text-sm text-gray-600 font-medium mb-1 block">Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium mb-1 block">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium mb-1 block">Role</label>
                <select
                  aria-label="User Role"
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                disabled={updateLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                {updateLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-pink-600">
              <h2 className="text-xl font-bold text-white">Confirm Delete</h2>
            </div>
            <div className="px-6 py-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
              <div className="bg-gray-100 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">
                  User: <span className="font-semibold">{allUsers.find(u => u._id === deleteConfirm)?.name}</span>
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Appointment Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 bg-gradient-to-r from-orange-600 to-pink-600">
              <h2 className="text-xl font-bold text-white">Schedule Appointment</h2>
            </div>
            <div className="px-6 py-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Patient
                </label>
                <select
                  aria-label="Select Patient"
                  value={scheduleFormData.patientId}
                  onChange={(e) =>
                    setScheduleFormData({ ...scheduleFormData, patientId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">-- Choose Patient --</option>
                  {allUsers
                    .filter((u) => u.role?.toLowerCase() === "patient")
                    .map((patient) => (
                      <option key={patient._id} value={patient._id}>
                        {patient.name} ({patient.email})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Appointment Date
                </label>
                <select
                  aria-label="Appointment Date"
                  value={scheduleFormData.requestedDate}
                  onChange={(e) =>
                    setScheduleFormData({ ...scheduleFormData, requestedDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">-- Select Available Date --</option>
                  {generateAvailableDates().map((dateStr) => {
                    const date = new Date(dateStr + 'T00:00:00');
                    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    const dayName = days[date.getDay()];
                    const monthName = date.toLocaleString('default', { month: 'short' });
                    const fullDateStr = `${dayName}, ${monthName} ${date.getDate()}, ${date.getFullYear()}`;
                    return (
                      <option key={dateStr} value={dateStr}>
                        {fullDateStr}
                      </option>
                    );
                  })}
                </select>
                {generateAvailableDates().length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    No available dates for this doctor
                  </p>
                )}
                {doctorAvailability.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-gray-600 font-semibold">Doctor Availability:</p>
                    {doctorAvailability.map((d, idx) => {
                      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      return (
                        <div key={idx} className="text-xs bg-blue-50 p-2 rounded border border-blue-200">
                          <p className="text-gray-700">
                            <span className="font-semibold">{days[d.dayOfWeek]}</span>: {d.startTime} - {d.endTime}
                          </p>
                          {d.location && d.location.address && (
                            <p className="text-blue-600 mt-1">
                              📍 {d.location.address}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <p className="text-xs text-blue-600 mt-2 font-medium">
                  ✓ Time will be automatically assigned (30 min slots)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Appointment
                </label>
                <textarea
                  value={scheduleFormData.reason}
                  onChange={(e) =>
                    setScheduleFormData({ ...scheduleFormData, reason: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                  placeholder="e.g., Regular checkup, skin consultation..."
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-2">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmScheduleAppointment}
                className="px-4 py-2 bg-gradient-to-r from-orange-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600">
              <h2 className="text-xl font-bold text-white">Add New User</h2>
            </div>
            <form onSubmit={handleAddUser} className="px-6 py-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={addUserFormData.name}
                  onChange={(e) =>
                    setAddUserFormData({ ...addUserFormData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={addUserFormData.email}
                  onChange={(e) =>
                    setAddUserFormData({ ...addUserFormData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={addUserFormData.password}
                  onChange={(e) =>
                    setAddUserFormData({ ...addUserFormData, password: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  User Role
                </label>
                <select
                  aria-label="User Role"
                  value={addUserFormData.role}
                  onChange={(e) =>
                    setAddUserFormData({ 
                      ...addUserFormData, 
                      role: e.target.value as "patient" | "doctor" 
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>
            </form>

            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowAddUserModal(false);
                  setAddUserFormData({ name: "", email: "", password: "", role: "patient" });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={addUserLoading}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50"
              >
                {addUserLoading ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewAppointmentPage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Available Doctors</h2>
              <button
                onClick={() => setShowNewAppointmentPage(false)}
                className="text-white text-2xl hover:opacity-70"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-6">
              {allUsers.filter((u) => u.role?.toLowerCase() === "doctor").length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No doctors available at the moment</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200 bg-gray-50">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers
                        .filter((u) => u.role?.toLowerCase() === "doctor")
                        .map((doctor) => (
                          <tr key={doctor._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-medium text-gray-800">{doctor.name}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-600">{doctor.email}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                ✓ Verified
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => {
                                  setSelectedDoctorId(doctor._id);
                                  setShowNewAppointmentPage(false);
                                  setShowScheduleModal(true);
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
                              >
                                Schedule
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end">
              <button
                onClick={() => setShowNewAppointmentPage(false)}
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
