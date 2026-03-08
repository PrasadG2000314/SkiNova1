"use client"
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icons
const markerIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LocationMapPickerProps {
  onLocationSelect: (location: any) => void;
  initialLat?: number;
  initialLng?: number;
}

function LocationMarker({ onLocationSelect, existingLocation }: any) {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    existingLocation ? [existingLocation.latitude, existingLocation.longitude] : null
  );

  useMapEvents({
    click(e: any) {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);
      
      // Reverse geocode using OpenStreetMap Nominatim API
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => {
          onLocationSelect({
            address: data.address?.name || data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            latitude: lat,
            longitude: lng
          });
        })
        .catch(err => {
          console.log("Error:", err);
          onLocationSelect({
            address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            latitude: lat,
            longitude: lng
          });
        });
    },
  });

  return markerPosition ? (
    <Marker position={markerPosition}>
      <Popup>Your clinic location</Popup>
    </Marker>
  ) : null;
}

export default function LocationMapPicker({ 
  onLocationSelect, 
  initialLat = 40, 
  initialLng = -95 
}: LocationMapPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [center, setCenter] = useState<[number, number]>([initialLat, initialLng]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (err) {
      console.log("Error searching locations:", err);
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestion: any) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    
    setCenter([lat, lng]);
    setSearchQuery(suggestion.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
    
    onLocationSelect({
      address: suggestion.display_name,
      latitude: lat,
      longitude: lng
    });
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="relative z-20 p-3 bg-white border-b border-gray-300">
        <input
          type="text"
          placeholder="🔍 Search location (city, address, etc.)"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-0 max-h-48 overflow-y-auto z-20">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-200 last:border-b-0 text-sm text-gray-700"
              >
                📍 {suggestion.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 w-full" style={{ minHeight: "300px" }}>
        <MapContainer 
          key={`${center[0]}-${center[1]}`}
          center={center} 
          zoom={13} 
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <LocationMarker onLocationSelect={onLocationSelect} existingLocation={null} />
        </MapContainer>
      </div>
    </div>
  );
}
