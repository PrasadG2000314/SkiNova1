"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SelfCheckGuide from "@/app/components/skin-cancer/SelfCheckGuide";

type DiseaseKey = "psoriasis" | "tinea" | "leprosy" | "skinCancer";

const DISEASE_CONFIG: Record<
  DiseaseKey,
  {
    label: string;
    accent: string;
    bgPill: string;
    lastScan: string;
    risk: string;
    riskColor: string;
    riskHint: string;
    upcoming: string;
    upcomingHint: string;
    checks: { area: string; label: string; status: string; color: string }[];
    tip: string;
  }
> = {
  psoriasis: {
    label: "Psoriasis",
    accent: "text-purple-700",
    bgPill: "bg-purple-600/90",
    lastScan: "1 day ago",
    risk: "Medium",
    riskColor: "text-amber-600",
    riskHint: "Follow your treatment plan and track flare patterns.",
    upcoming: "Review in 2 weeks",
    upcomingHint: "Ideal time to re‑check chronic patches.",
    checks: [
      {
        area: "Elbows",
        label: "Plaque psoriasis pattern",
        status: "Stable",
        color: "text-emerald-700 bg-emerald-100",
      },
      {
        area: "Knees",
        label: "Mild scaling",
        status: "Improving",
        color: "text-sky-700 bg-sky-100",
      },
      {
        area: "Scalp line",
        label: "Psoriasis vs dandruff",
        status: "Monitor",
        color: "text-amber-700 bg-amber-100",
      },
    ],
    tip: "Moisturize daily and note what seems to trigger your flare‑ups such as stress, climate or certain foods.",
  },
  tinea: {
    label: "Tinea",
    accent: "text-yellow-700",
    bgPill: "bg-yellow-600/90",
    lastScan: "3 days ago",
    risk: "Low–Medium",
    riskColor: "text-amber-600",
    riskHint: "Keep the area clean, dry and follow antifungal guidance.",
    upcoming: "Review in 1 week",
    upcomingHint: "Check that ring‑like patches are shrinking, not spreading.",
    checks: [
      {
        area: "Neck",
        label: "Ring‑like patch",
        status: "Improving",
        color: "text-emerald-700 bg-emerald-100",
      },
      {
        area: "Chest",
        label: "Mild fungal pattern",
        status: "Stable",
        color: "text-sky-700 bg-sky-100",
      },
      {
        area: "Back",
        label: "Previous tinea spot",
        status: "Healed",
        color: "text-emerald-800 bg-emerald-200",
      },
    ],
    tip: "Dry thoroughly after bathing and avoid sharing towels or clothing to prevent reinfection.",
  },
  leprosy: {
    label: "Leprosy",
    accent: "text-red-700",
    bgPill: "bg-red-600/90",
    lastScan: "5 days ago",
    risk: "Requires follow‑up",
    riskColor: "text-red-600",
    riskHint: "Stick closely to medication schedule and nerve‑sensation checks.",
    upcoming: "Clinic visit scheduled",
    upcomingHint: "Important to review skin patches and nerve status.",
    checks: [
      {
        area: "Forearm patch",
        label: "Reduced sensation area",
        status: "Under treatment",
        color: "text-red-700 bg-red-100",
      },
      {
        area: "Upper arm",
        label: "Light patch border",
        status: "Stable",
        color: "text-amber-700 bg-amber-100",
      },
      {
        area: "Back of hand",
        label: "Nerve tenderness",
        status: "Monitor",
        color: "text-rose-700 bg-rose-100",
      },
    ],
    tip: "Report any new numbness, muscle weakness or burns you don’t feel immediately.",
  },
  skinCancer: {
    label: "Skin Cancer",
    accent: "text-red-800",
    bgPill: "bg-red-600/90",
    lastScan: "Recently scanned",
    risk: "High priority",
    riskColor: "text-red-600",
    riskHint: "Watch any changing mole closely and follow medical advice promptly.",
    upcoming: "Dermatologist review recommended",
    upcomingHint: "Early review can dramatically improve outcomes.",
    checks: [
      {
        area: "Monitoring",
        label: "Start a scan to track lesions",
        status: "Ready",
        color: "text-blue-700 bg-blue-100",
      },
      {
        area: "Prevention",
        label: "Use SPF 30+ sunscreen daily",
        status: "Important",
        color: "text-orange-700 bg-orange-100",
      },
      {
        area: "Follow-up",
        label: "Quarterly dermatologist visits",
        status: "Recommended",
        color: "text-purple-700 bg-purple-100",
      },
    ],
    tip: "Use sunscreen daily and photograph suspicious spots monthly to track any change in size, color or border.",
  },
};

interface SymptomQuestion {
  id: number;
  question: string;
  answers: { text: string; diseaseScores: Record<DiseaseKey, number> }[];
}

const SYMPTOM_QUESTIONS: SymptomQuestion[] = [
  {
    id: 1,
    question: "Where do you see the skin issue on your body?",
    answers: [
      {
        text: "Elbows, knees, scalp (extensor surfaces)",
        diseaseScores: { psoriasis: 8, tinea: 2, leprosy: 1, skinCancer: 1 },
      },
      {
        text: "Neck, chest, back, inner thighs (warm, moist areas)",
        diseaseScores: { psoriasis: 2, tinea: 8, leprosy: 2, skinCancer: 1 },
      },
      {
        text: "Face, hands, patches with numbness",
        diseaseScores: { psoriasis: 2, tinea: 2, leprosy: 8, skinCancer: 4 },
      },
      {
        text: "Anywhere, especially sun-exposed areas",
        diseaseScores: { psoriasis: 1, tinea: 1, leprosy: 1, skinCancer: 9 },
      },
    ],
  },
  {
    id: 2,
    question: "What does the skin look like?",
    answers: [
      {
        text: "Red, scaly, raised plaques with silvery scales",
        diseaseScores: { psoriasis: 9, tinea: 3, leprosy: 1, skinCancer: 1 },
      },
      {
        text: "Ring-shaped patches with clear center (circular)",
        diseaseScores: { psoriasis: 1, tinea: 9, leprosy: 2, skinCancer: 1 },
      },
      {
        text: "Light-colored flat patches or nodules",
        diseaseScores: { psoriasis: 2, tinea: 1, leprosy: 9, skinCancer: 2 },
      },
      {
        text: "Mole or spot with irregular shape or multiple colors",
        diseaseScores: { psoriasis: 1, tinea: 1, leprosy: 1, skinCancer: 10 },
      },
    ],
  },
  {
    id: 3,
    question: "How long has this been present?",
    answers: [
      {
        text: "Weeks to months (chronic condition)",
        diseaseScores: { psoriasis: 8, tinea: 6, leprosy: 7, skinCancer: 4 },
      },
      {
        text: "Recent development (days to weeks)",
        diseaseScores: { psoriasis: 3, tinea: 8, leprosy: 2, skinCancer: 5 },
      },
      {
        text: "Present for years with slow progression",
        diseaseScores: { psoriasis: 6, tinea: 2, leprosy: 9, skinCancer: 8 },
      },
    ],
  },
  {
    id: 4,
    question: "Is there any of the following?",
    answers: [
      {
        text: "Itching or burning sensation",
        diseaseScores: { psoriasis: 8, tinea: 9, leprosy: 2, skinCancer: 3 },
      },
      {
        text: "Numbness or reduced sensation",
        diseaseScores: { psoriasis: 1, tinea: 1, leprosy: 9, skinCancer: 1 },
      },
      {
        text: "Bleeding, oozing, or texture changes",
        diseaseScores: { psoriasis: 5, tinea: 2, leprosy: 3, skinCancer: 8 },
      },
      {
        text: "No specific sensation issues",
        diseaseScores: { psoriasis: 4, tinea: 5, leprosy: 2, skinCancer: 4 },
      },
    ],
  },
  {
    id: 5,
    question: "How did it start?",
    answers: [
      {
        text: "After exposure to heat, sweat, or moisture",
        diseaseScores: { psoriasis: 2, tinea: 10, leprosy: 1, skinCancer: 1 },
      },
      {
        text: "After stress, weather changes, or injury",
        diseaseScores: { psoriasis: 9, tinea: 2, leprosy: 1, skinCancer: 1 },
      },
      {
        text: "Gradually, with slow changes over time",
        diseaseScores: { psoriasis: 5, tinea: 1, leprosy: 8, skinCancer: 7 },
      },
      {
        text: "Unsure of the cause",
        diseaseScores: { psoriasis: 3, tinea: 3, leprosy: 3, skinCancer: 5 },
      },
    ],
  },
];

export default function PatientDashboard() {
  const [user, setUser] = useState<any>(null);
  const [profilePhoto, setProfilePhoto] = useState<string>("https://api.dicebear.com/7.x/avataaars/svg?seed=SkinNova");
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState<DiseaseKey>("psoriasis");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [scheduleFormData, setScheduleFormData] = useState({
    requestedDate: "",
    reason: "",
  });
  const [doctorAvailability, setDoctorAvailability] = useState<any[]>([]);
  // Scan data states
  const [scanData, setScanData] = useState<{ [key: string]: any }>({});
  const [loadingScans, setLoadingScans] = useState(false);
  // Symptom checker states
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);
  const [showSelfCheck, setShowSelfCheck] = useState(false);
  const [currentSymptomQuestion, setCurrentSymptomQuestion] = useState(0);
  const [symptomScores, setSymptomScores] = useState<Record<DiseaseKey, number>>({
    psoriasis: 0,
    tinea: 0,
    leprosy: 0,
    skinCancer: 0,
  });
  const [recommendedDisease, setRecommendedDisease] = useState<DiseaseKey | null>(null);
  const router = useRouter();

  useEffect(() => {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (raw) {
      const userData = JSON.parse(raw);
      setUser(userData);
      
      // Load profile photo if it exists
      if (userData._id || userData.id || userData.userId) {
        const userId = userData._id || userData.id || userData.userId;
        setProfilePhoto(`http://localhost:4000/api/profile/photo/${userId}?t=${Date.now()}`);
      }

      // Check URL parameters for disease selection
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const disease = params.get("disease");
        if (disease && ["psoriasis", "tinea", "leprosy", "skinCancer"].includes(disease)) {
          setSelectedDisease(disease as DiseaseKey);
        }
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (user?.role === "patient") {
      fetchAppointments();
      fetchVerifiedDoctors();
      fetchAllScans();
      
      // Refetch every 5 seconds for appointments
      const appointmentInterval = setInterval(fetchAppointments, 5000);
      
      // Refetch scans every 10 seconds to catch newly saved scans
      const scanInterval = setInterval(fetchAllScans, 10000);
      
      return () => {
        clearInterval(appointmentInterval);
        clearInterval(scanInterval);
      };
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.warn("No authentication token found. User may not be logged in.");
        setAppointments([]);
        return;
      }

      const response = await fetch("http://localhost:4000/api/appointments", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        console.error(
          `API Error: ${response.status} ${response.statusText}`,
          errorDetails
        );
        throw new Error(
          `Failed to fetch appointments: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Error fetching appointments:", errorMessage);
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchVerifiedDoctors = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/doctors/verified", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("API Error:", response.status, response.statusText);
        throw new Error(`Failed to fetch doctors: ${response.status}`);
      }

      const data = await response.json();
      console.log("Verified doctors found:", data.doctors);
      setDoctors(data.doctors || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Error fetching doctors:", errorMessage);
      setDoctors([]);
    }
  };

  const fetchAllScans = async () => {
    try {
      setLoadingScans(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/api/analysis/all-scans", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Error fetching scans:", response.status);
        return;
      }

      const data = await response.json();
      if (data.success && data.scansByDisease) {
        setScanData(data.scansByDisease);
        console.log("Scans loaded:", data.scansByDisease);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Error fetching scans:", errorMessage);
    } finally {
      setLoadingScans(false);
    }
  };

  const fetchDoctorAvailability = async (doctorId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:4000/api/availability/${doctorId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch doctor availability");
      }

      const data = await response.json();
      setDoctorAvailability(data.availabilitySlots || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Error fetching doctor availability:", errorMessage);
      setDoctorAvailability([]);
    }
  };

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

  const handleScheduleAppointment = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setScheduleFormData({ requestedDate: "", reason: "" });
    setShowScheduleModal(true);
    fetchDoctorAvailability(doctorId);
  };

  const handleConfirmScheduleAppointment = async () => {
    if (!scheduleFormData.requestedDate || !scheduleFormData.reason) {
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
      // Get all appointments for this doctor on the selected date to auto-assign time
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

      const appointmentsData = await response.json();
      const allAppointments = appointmentsData.appointments || [];

      // Filter appointments for this doctor on the selected date
      const dateStr = scheduleFormData.requestedDate; // Format: YYYY-MM-DD
      const sameDateAppointments = allAppointments.filter((apt: any) => {
        const aptDate = new Date(apt.requestedDate).toISOString().split('T')[0];
        return apt.doctorId === selectedDoctorId && aptDate === dateStr;
      });

      // Auto-assign time based on doctor availability and existing appointments
      let appointmentTime = "";
      let slotLocation = undefined;
      let dayAvailability: any = null;
      
      if (doctorAvailability && doctorAvailability.length > 0) {
        const [year, month, day] = scheduleFormData.requestedDate.split('-').map(Number);
        const selectedDateObj = new Date(year, month - 1, day);
        const dayOfWeek = selectedDateObj.getDay();
        dayAvailability = doctorAvailability.find((a: any) => a.dayOfWeek === dayOfWeek);

        if (dayAvailability) {
          const [startHour, startMin] = dayAvailability.startTime.split(':').map(Number);
          const [endHour, endMin] = dayAvailability.endTime.split(':').map(Number);

          // Create date in local timezone (not UTC)
          const appointmentDateTime = new Date(year, month - 1, day, startHour, startMin, 0, 0);
          
          // Calculate appointment slot based on number of appointments that day (30 min intervals)
          const slotMinutes = sameDateAppointments.length * 30;
          appointmentDateTime.setMinutes(appointmentDateTime.getMinutes() + slotMinutes);

          // Check if the calculated time is within doctor's available hours
          const appointmentEndTime = new Date(appointmentDateTime);
          appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + 30); // Appointment duration is 30 min

          const endDateTime = new Date(year, month - 1, day, endHour, endMin, 0, 0);

          // If appointment would go past doctor's availability, alert user
          if (appointmentEndTime > endDateTime) {
            alert(`Doctor's availability ends at ${dayAvailability.endTime}. No more slots available for this date.`);
            return;
          }

          // Format time properly for sending to backend
          const hours = String(appointmentDateTime.getHours()).padStart(2, '0');
          const minutes = String(appointmentDateTime.getMinutes()).padStart(2, '0');
          const dateStrFormatted = String(appointmentDateTime.getFullYear()).padStart(4, '0') + '-' +
                         String(appointmentDateTime.getMonth() + 1).padStart(2, '0') + '-' +
                         String(appointmentDateTime.getDate()).padStart(2, '0');
          appointmentTime = `${dateStrFormatted}T${hours}:${minutes}`;
          
          // Capture location from availability slot
          if (dayAvailability.location?.address) {
            slotLocation = dayAvailability.location;
          }
        } else {
          alert("Doctor is not available on this day");
          return;
        }
      } else {
        alert("Doctor has not set their availability yet");
        return;
      }

      // Schedule the appointment with auto-assigned time and location
      const scheduleResponse = await fetch("http://localhost:4000/api/appointments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          patientId: user._id,
          requestedDate: appointmentTime,
          reason: scheduleFormData.reason,
          availabilitySlotId: dayAvailability?._id,
          location: slotLocation,
        }),
      });

      if (!scheduleResponse.ok) {
        throw new Error("Failed to schedule appointment");
      }

      alert("Appointment requested successfully!");
      setShowScheduleModal(false);
      setScheduleFormData({ requestedDate: "", reason: "" });
      await fetchAppointments();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to schedule appointment");
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
      const response = await fetch("http://localhost:4000/api/profile/upload-photo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload profile photo");
      }

      const data = await response.json();
      // Update profile photo URL with cache busting timestamp
      if (user && (user._id || user.id || user.userId)) {
        const userId = user._id || user.id || user.userId;
        setProfilePhoto(`http://localhost:4000/api/profile/photo/${userId}?t=${Date.now()}`);
      }
      alert("Profile photo uploaded successfully!");
      setShowPhotoModal(false);
    } catch (err: unknown) {
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to remove profile photo");
      }

      // Clear profile photo by setting to empty string
      setProfilePhoto("");
      alert("Profile photo removed successfully!");
      setShowPhotoModal(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to remove profile photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  function getTimeSinceScan(date: string): string {
    const scanDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - scanDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays === 0) {
      if (diffHours === 0) return "Today";
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return "1 day ago";
    } else {
      return `${diffDays} days ago`;
    }
  }

  function transformScanLabel(label: string): string {
    if (label === 'Leprosy Skin') return 'Leprosy Positive';
    if (label === 'Normal Skin') return 'Leprosy Negative';
    return label;
  }

  function getRecentScans(diseaseType: string): any[] {
    const scans = scanData[diseaseType] || [];
    return scans.slice(0, 3); // Get last 3 scans
  }

  function getLatestScanDate(diseaseType: string): string {
    const scans = scanData[diseaseType] || [];
    if (scans.length > 0) {
      return getTimeSinceScan(scans[0].uploadedAt);
    }
    return "No scans yet";
  }

  function getAverageRiskLevel(diseaseType: string): string {
    const scans = scanData[diseaseType] || [];
    if (scans.length === 0) return "No data";
    
    const confidences = scans.map((s: any) => s.confidence || 0);
    const avgConfidence = confidences.reduce((a: number, b: number) => a + b, 0) / confidences.length;
    
    if (avgConfidence < 0.3) return "Low";
    if (avgConfidence < 0.6) return "Medium";
    if (avgConfidence < 0.8) return "Medium-High";
    return "High";
  }

  function getDynamicChecks(diseaseType: DiseaseKey): { area: string; label: string; status: string; color: string }[] {
    const scans = scanData[diseaseType] || [];
    
    // If we have actual scans, create checks from them
    if (scans.length > 0) {
      return scans.slice(0, 3).map((scan: any, index: number) => {
        const confidencePercent = Math.round((scan.confidence || 0) * 100);
        let area = scan.scanArea || `Scan ${index + 1}`;
        
        // Format area for skinCancer
        if (diseaseType === 'skinCancer' && scan.skinCondition) {
          area = `${scan.skinCondition} (${confidencePercent}%)`;
        }
        
        return {
          area: area,
          label: scan.skinCondition ? `${scan.skinCondition} detected` : `Analysis - ${confidencePercent}% confidence`,
          status: scan.scanStatus || 'Monitor',
          color: 
            scan.scanStatus === 'Stable' ? 'text-emerald-700 bg-emerald-100' :
            scan.scanStatus === 'Improving' ? 'text-sky-700 bg-sky-100' :
            scan.scanStatus === 'Needs review' ? 'text-red-700 bg-red-100' :
            scan.scanStatus === 'Healed' ? 'text-emerald-800 bg-emerald-200' :
            'text-amber-700 bg-amber-100'
        };
      });
    }
    
    // Otherwise return default checks from config
    return DISEASE_CONFIG[diseaseType].checks;
  }

  const handleSymptomAnswer = (diseaseScores: Record<DiseaseKey, number>) => {
    // Add the scores from this answer to the running total
    const newScores = { ...symptomScores };
    (Object.keys(diseaseScores) as DiseaseKey[]).forEach((key) => {
      newScores[key] += diseaseScores[key];
    });
    setSymptomScores(newScores);

    // Move to next question or finish quiz
    if (currentSymptomQuestion < SYMPTOM_QUESTIONS.length - 1) {
      setCurrentSymptomQuestion(currentSymptomQuestion + 1);
    } else {
      // Quiz finished - find the disease with highest score
      const highestScore = Math.max(...Object.values(newScores));
      const recommended = (Object.keys(newScores) as DiseaseKey[]).find(
        (key) => newScores[key] === highestScore
      ) || "psoriasis";
      setRecommendedDisease(recommended);
    }
  };

  const handleCloseSymptomChecker = () => {
    setShowSymptomChecker(false);
    setCurrentSymptomQuestion(0);
    setRecommendedDisease(null);
    setSymptomScores({ psoriasis: 0, tinea: 0, leprosy: 0, skinCancer: 0 });
  };

  const handleSelectRecommendedDisease = () => {
    if (recommendedDisease) {
      setSelectedDisease(recommendedDisease);
      handleCloseSymptomChecker();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-emerald-50 to-teal-100">
        <div className="animate-pulse text-gray-600 text-sm">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  const cfg = DISEASE_CONFIG[selectedDisease];
  const recentScans = getRecentScans(selectedDisease);
  const latestScanTime = getLatestScanDate(selectedDisease);
  const riskLevel = getAverageRiskLevel(selectedDisease);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-emerald-50 to-teal-100 pt-28 px-4 sm:px-6 lg:px-8 pb-24 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        {/* Top section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-6">
            {/* Profile Photo - Creative Design */}
            <div className="relative group">
              {/* Animated background gradient circles */}
              <div className="absolute -inset-2 bg-gradient-to-br from-emerald-300 via-sky-300 to-cyan-300 rounded-full blur-2xl opacity-70 group-hover:opacity-90 transition-opacity duration-300 animate-pulse"></div>
              
              {/* Main profile container */}
              <div
                onClick={() => setShowPhotoModal(true)}
                className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center cursor-pointer overflow-hidden group/photo shadow-2xl hover:shadow-3xl transition-all duration-300 border-4 border-white backdrop-blur-xl"
              >
                {/* Animated border effect */}
                <div className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-white/50 via-transparent to-white/50 opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300 animate-spin" style={{ animationDuration: '3s' }}></div>
                
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="w-full h-full object-cover relative z-10 group-hover/photo:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/avataaars/svg?seed=SkinNova";
                    }}
                  />
                ) : null}
                
                {/* Hover overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover/photo:opacity-100 transition-all duration-300 flex items-end justify-center pb-4 z-20 rounded-full">
                  <span className="text-white text-xs font-bold uppercase tracking-wider">Upload</span>
                </div>
              </div>

              {/* Online status indicator - positioned outside overflow */}
              <div className="absolute bottom-2 right-2 w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-green-600 to-green-700 rounded-full border-3 border-white shadow-lg z-40 animate-pulse" title="Online"></div>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight">
                Hi, <span className="bg-gradient-to-r from-emerald-600 via-sky-600 to-cyan-600 bg-clip-text text-transparent animate-pulse">{user.name}</span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-gray-700 max-w-xl leading-relaxed">
                Welcome to your SkinNova dashboard. Track your skin health, review AI insights,
                and stay ahead with intelligent personalized guidance.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-sky-600/90 to-emerald-600/90 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-xl border border-sky-400/50">
              ✨ Role • {user.role?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Disease selector tabs - Creative Design */}
        <div className="flex flex-wrap gap-3 items-center justify-between pb-6 border-b border-emerald-200">
          <div className="flex flex-wrap gap-3">
            {(
              [
                { key: "psoriasis", label: "🟣 Psoriasis" },
                { key: "tinea", label: "🟡 Tinea" },
                { key: "leprosy", label: "🔴 Leprosy" },
                { key: "skinCancer", label: "🟠 Skin Cancer" },
              ] as { key: DiseaseKey; label: string }[]
            ).map((d) => {
              const active = selectedDisease === d.key;
              return (
                <button
                  key={d.key}
                  onClick={() => setSelectedDisease(d.key)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold shadow-md transition-all border backdrop-blur-xl ${
                    active
                      ? "bg-gradient-to-r from-sky-500 to-emerald-500 border-sky-400 text-white scale-105"
                      : "bg-white/60 border-sky-200 text-gray-700 hover:bg-white/80"
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowSymptomChecker(true)}
              className="px-6 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-sky-600 to-emerald-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all border border-sky-400/50 backdrop-blur-xl"
            >
              🔍 Symptom Checker
            </button>
            {selectedDisease === "leprosy" && (
              <button
                onClick={() => router.push("/leprosy/assistant")}
                className="px-6 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all border border-red-400"
              >
                💬 Care Assistant
              </button>
            )}
            {selectedDisease === "skinCancer" && (
              <>
                <button
                  onClick={() => router.push("/skin-cancer/predict")}
                  className="px-6 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all border border-red-400"
                >
                  🎯 Predict Risk
                </button>
                <button
                  onClick={() => setShowSelfCheck(true)}
                  className="px-6 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all border border-blue-400"
                >
                  🕵️ Self Check Guide
                </button>
              </>
            )}
          </div>
        </div>

        {/* Status cards – content depends on selectedDisease */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/60 backdrop-blur-xl border border-sky-200 shadow-lg p-5 flex flex-col gap-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Last Scan ({cfg.label})
            </span>
            <span className="text-lg font-bold text-gray-900">
              {loadingScans ? "Loading..." : latestScanTime}
            </span>
            <span className={`text-xs font-medium ${cfg.accent}`}>
              {cfg.upcomingHint}
            </span>
          </div>
          <div className="rounded-2xl bg-white/60 backdrop-blur-xl border border-sky-200 shadow-lg p-5 flex flex-col gap-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              AI Risk Level
            </span>
            <span className={`text-lg font-bold ${cfg.riskColor}`}>
              {loadingScans ? "Loading..." : riskLevel}
            </span>
            <span className="text-xs text-amber-700 font-medium">
              {cfg.riskHint}
            </span>
          </div>
          <div className="rounded-2xl bg-white/60 backdrop-blur-xl border border-sky-200 shadow-lg p-5 flex flex-col gap-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Upcoming Plan
            </span>
            <span className="text-lg font-bold text-gray-900">
              {cfg.upcoming}
            </span>
            <span className="text-xs text-sky-700 font-medium">
              {cfg.upcomingHint}
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Quick actions & tips */}
          <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-sky-200 shadow-2xl p-6 sm:p-7 space-y-5 group hover:border-sky-300 transition-all duration-300">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                What would you like to do?
              </h2>
              <div className="h-1 w-12 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full mt-2"></div>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => {
                  const diseaseRoutes: Record<DiseaseKey, string> = {
                    psoriasis: "/psoriasis/upload",
                    tinea: "/tinea/detect",
                    leprosy: "/leprosy/detect",
                    skinCancer: "/skin-cancer/detect"
                  };
                  router.push(diseaseRoutes[selectedDisease]);
                }}
                className="w-full rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold px-4 py-3 shadow-lg hover:shadow-2xl hover:scale-105 transition-all"
              >
                🔍 Start new {cfg.label.toLowerCase()} scan
              </button>

              <button 
                onClick={() => router.push('/patient/reports')} 
                className="w-full rounded-2xl bg-blue-700 hover:bg-blue-900 text-white text-sm font-semibold px-4 py-3 shadow-lg hover:shadow-2xl hover:scale-105 transition-all"
              >
                📊 View previous reports
              </button>

              <button 
                onClick={() => {
                  const diseaseRoutes: Record<DiseaseKey, string> = {
                    psoriasis: "/psoriasis/risk-analysis",
                    tinea: "/tinea",
                    leprosy: "/leprosy",
                    skinCancer: "/skin-cancer"
                  };
                  router.push(diseaseRoutes[selectedDisease]);
                }}
                className="w-full rounded-2xl bg-emerald-700 hover:bg-emerald-900 text-white text-sm font-semibold px-4 py-3 shadow-lg hover:shadow-2xl hover:scale-105 transition-all"
              >
                ⚠️ {selectedDisease === 'psoriasis' ? 'Risk analysis' : `Ask a doctor`}
              </button>

              <button 
                onClick={() => window.location.href = 'http://172.20.10.6'} 
                className="w-full rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-4 py-3 shadow-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                ❤️ Heart Rate Check
              </button>
            </div>

            {/* Daily tip card with Glass Morphism */}
            <div className="mt-6 rounded-2xl bg-cyan-100 backdrop-blur-2xl px-5 py-4 text-xs text-cyan-900 border border-cyan-300 shadow-lg">
              <p className="font-semibold mb-2 text-cyan-900 flex items-center gap-2">💡 Daily Tip for {cfg.label}</p>
              <p className="text-cyan-800 leading-relaxed">{cfg.tip}</p>
            </div>
          </div>

          {/* Right: Recent results */}
          <div className="lg:col-span-2 rounded-3xl bg-white/60 backdrop-blur-xl border border-sky-200 shadow-xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Recent Skin Checks – {cfg.label}
              </h2>
              <span className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                View history
              </span>
            </div>

            <div className="space-y-4">
              {loadingScans ? (
                <div className="text-center py-8 text-gray-600">Loading scan data...</div>
              ) : recentScans.length > 0 ? (
                recentScans.map((scan: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-2xl bg-white/50 px-4 py-3 shadow-sm hover:shadow-md transition-all"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {scan.scanArea || 'Area'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {transformScanLabel(scan.skinCondition || 'Analysis')} ({(scan.confidence * 100).toFixed(0)}% confidence)
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${
                        scan.scanStatus === 'Stable' ? 'text-emerald-700 bg-emerald-100' :
                        scan.scanStatus === 'Improving' ? 'text-sky-700 bg-sky-100' :
                        scan.scanStatus === 'Monitor' ? 'text-amber-700 bg-amber-100' :
                        scan.scanStatus === 'Needs review' ? 'text-red-700 bg-red-100' :
                        scan.scanStatus === 'Healed' ? 'text-emerald-800 bg-emerald-200' :
                        'text-red-700 bg-red-100'
                      }`}
                    >
                      {scan.scanStatus || 'Monitor'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="space-y-4">
                  {getDynamicChecks(selectedDisease).map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-2xl bg-white/50 px-4 py-3 shadow-sm hover:shadow-md transition-all"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {item.area}
                        </p>
                        <p className="text-xs text-gray-600">{item.label}</p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${item.color}`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Doctors and Appointments Section - 2 Columns */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Doctors Section - Book Appointment */}
          <div className="rounded-3xl bg-white/50 backdrop-blur-xl border border-sky-200 shadow-xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              👨‍⚕️ Available Doctors - Schedule Appointment
            </h2>
            
            {doctors.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-700 text-lg">No verified doctors available</p>
                <p className="text-gray-600 text-sm mt-2">Please check back later</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {doctors.map((doctor) => (
                  <div key={doctor._id} className="w-full bg-gradient-to-br from-white/70 to-white/50 rounded-2xl p-5 border border-sky-200 hover:shadow-xl transition-all hover:scale-105 duration-300 flex flex-col">
                  {/* Doctor Header Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-lg font-bold text-gray-900">Dr. {doctor.name}</p>
                      <p className="text-xs text-gray-600 mt-1">📧 {doctor.email}</p>
                    </div>
                    <div className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 whitespace-nowrap ml-2">
                      <span className="text-xs font-semibold text-emerald-700">✓ Verified</span>
                    </div>
                  </div>
                  
                  {/* Doctor Info - Row Layout */}
                  <div className="flex flex-wrap gap-3 text-xs mb-4">
                    {doctor.specialization && (
                      <div className="flex items-center gap-2 bg-cyan-50 rounded-lg px-3 py-2 text-gray-700">
                        <span>🩺</span>
                        <span className="font-medium">{doctor.specialization}</span>
                      </div>
                    )}
                    {doctor.experience && (
                      <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 text-gray-700">
                        <span>⏱️</span>
                        <span>{doctor.experience} yrs</span>
                      </div>
                    )}
                    {doctor.phone && (
                      <div className="flex items-center gap-2 bg-emerald-50 rounded-lg px-3 py-2 text-gray-700">
                        <span>📱</span>
                        <span>{doctor.phone}</span>
                      </div>
                    )}
                  </div>

                  {doctor.location && (
                    <div className="text-xs text-gray-600 mb-4">
                      <span>📍</span>
                      <span className="ml-2">{doctor.location}</span>
                    </div>
                  )}
                  
                  {/* Action Button */}
                  <button
                    onClick={() => handleScheduleAppointment(doctor._id)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all text-sm mt-auto"
                  >
                    📅 Book Appointment
                  </button>
                </div>
              ))}
            </div>
          )}
          </div>

          {/* Appointments Section */}
          <div className="rounded-3xl bg-white/50 backdrop-blur-xl border border-sky-200 shadow-xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              📅 Your Appointments
            </h2>
          
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-700 text-lg">No appointments scheduled yet</p>
              <p className="text-gray-600 text-sm mt-2">Book an appointment with a doctor from the available doctors section</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Approved Appointments */}
              {appointments.filter(apt => apt.status === "approved").length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-emerald-700 mb-3">✅ Confirmed Appointments</h3>
                  <div className="space-y-3">
                    {appointments.filter(apt => apt.status === "approved").map((apt) => (
                      <div key={apt._id} className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                              Dr. {apt.doctorName}
                            </p>
                            <p className="text-sm font-bold text-emerald-700 mt-2">
                              🕐 {new Date(apt.approvedDate).toLocaleString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            <p className="text-xs text-gray-700 mt-1">
                              📝 {apt.reason}
                            </p>
                            {apt.location?.address && (
                              <p className="text-xs text-blue-700 mt-1 flex items-center gap-1">
                                📍 {apt.location.address}
                              </p>
                            )}
                            {apt.notes && (
                              <p className="text-xs text-gray-700 mt-2">
                                <strong>Notes:</strong> {apt.notes}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => router.push(`/direct-chat?patientId=${user._id || user.id}&doctorId=${apt.doctorId}`)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm whitespace-nowrap h-fit"
                          >
                            💬 Chat
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejected Appointments */}
              {appointments.filter(apt => apt.status === "rejected").length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-red-700 mb-3">❌ Rejected Appointments</h3>
                  <div className="space-y-3">
                    {appointments.filter(apt => apt.status === "rejected").map((apt) => (
                      <div key={apt._id} className="bg-red-50 rounded-2xl p-4 border border-red-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                              Dr. {apt.doctorName}
                            </p>
                            <p className="text-xs text-gray-700 mt-1">
                              📅 Requested: {new Date(apt.requestedDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-700 mt-1">
                              📝 Reason: {apt.reason}
                            </p>
                            {apt.location?.address && (
                              <p className="text-xs text-blue-700 mt-1 flex items-center gap-1">
                                📍 {apt.location.address}
                              </p>
                            )}
                            {apt.notes && (
                              <p className="text-xs text-red-700 mt-2">
                                <strong>Doctor's Message:</strong> {apt.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        </div>

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
                        <span className="text-5xl sm:text-6xl">👤</span>
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
                      placeholder="Choose your profile photo"
                      title="Upload a profile photo (JPG, PNG, GIF, WEBP - Max 5MB)"
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

        {/* Symptom Checker Modal */}
        {showSymptomChecker && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-white">🩺 Symptom Checker</h2>
                  <p className="text-white/90 text-sm mt-2">
                    {recommendedDisease ? "Your Results" : "Let's help you identify what you might have. Answer these questions based on your symptoms."}
                  </p>
                </div>
              </div>

              {/* Quiz Content */}
              <div className="px-5 py-6">
                {recommendedDisease ? (
                  // RESULTS SCREEN
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-5xl mb-2">✓</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        Based on your symptoms, we recommend:
                      </h3>
                      <p className="text-gray-600 text-xs">
                        Please consult a doctor for accurate diagnosis.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200">
                      <div className="text-center space-y-2">
                        <div className="text-4xl">
                          {recommendedDisease === "psoriasis" && "🔴"}
                          {recommendedDisease === "tinea" && "🟡"}
                          {recommendedDisease === "leprosy" && "🔴"}
                          {recommendedDisease === "skinCancer" && "⚠️"}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {recommendedDisease === "psoriasis" && "Psoriasis"}
                          {recommendedDisease === "tinea" && "Tinea"}
                          {recommendedDisease === "leprosy" && "Leprosy"}
                          {recommendedDisease === "skinCancer" && "Skin Cancer"}
                        </h2>
                        <p className="text-xs text-gray-700 font-medium">
                          Confidence: {Math.round((symptomScores[recommendedDisease] / 45) * 100)}%
                        </p>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-xs text-blue-800 leading-relaxed">
                        <strong>📋 Next Steps:</strong> Accept to view details, review symptoms, take a scan, or book a doctor.
                      </p>
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                      ⚠️ Not a medical diagnosis. Consult a healthcare professional.
                    </p>
                  </div>
                ) : (
                  // QUIZ SCREEN
                  <>
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700">
                          Q{currentSymptomQuestion + 1}/{SYMPTOM_QUESTIONS.length}
                        </span>
                        <span className="text-xs text-gray-500">
                          {Math.round(((currentSymptomQuestion + 1) / SYMPTOM_QUESTIONS.length) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${((currentSymptomQuestion + 1) / SYMPTOM_QUESTIONS.length) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Current Question */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-gray-900">
                        {SYMPTOM_QUESTIONS[currentSymptomQuestion].question}
                      </h3>

                      <div className="space-y-2">
                        {SYMPTOM_QUESTIONS[currentSymptomQuestion].answers.map((answer, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSymptomAnswer(answer.diseaseScores)}
                            className="w-full text-left p-3 rounded-lg border border-gray-200 bg-white hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group"
                          >
                            <span className="text-xs font-medium text-gray-700 group-hover:text-purple-700">
                              {answer.text}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Help Text */}
                    <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-800">
                        💡 Not a medical diagnosis. Consult a doctor.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-gray-50 rounded-b-2xl border-t border-gray-200 flex justify-between items-center gap-2">
                <button
                  onClick={handleCloseSymptomChecker}
                  className="px-3 py-1.5 text-sm bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  {recommendedDisease ? "Close" : "Cancel"}
                </button>
                
                {recommendedDisease && (
                  <button
                    onClick={handleSelectRecommendedDisease}
                    className="px-4 py-1.5 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                  >
                    ✅ Accept
                  </button>
                )}

                {!recommendedDisease && currentSymptomQuestion > 0 && (
                  <button
                    onClick={() => {
                      setCurrentSymptomQuestion(currentSymptomQuestion - 1);
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium"
                  >
                    ← Back
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Schedule Appointment Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600">
                <h2 className="text-xl font-bold text-white">Schedule Appointment</h2>
              </div>
              <div className="px-6 py-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Appointment Date
                  </label>
                  <select
                    value={scheduleFormData.requestedDate}
                    onChange={(e) =>
                      setScheduleFormData({ ...scheduleFormData, requestedDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select an available appointment date"
                    aria-label="Appointment Date"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="e.g., Skin consultation, treatment follow-up..."
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
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  Request Appointment
                </button>
              </div>
            </div>
          </div>
        )}
        
        <SelfCheckGuide isOpen={showSelfCheck} onClose={() => setShowSelfCheck(false)} />
      </div>
    </div>
  );
}
