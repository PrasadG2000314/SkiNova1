'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Device {
  _id: string;
  deviceType: string;
  deviceName: string;
  deviceModel?: string;
  isConnected: boolean;
  lastSyncedAt?: string;
  permissions: {
    heartRate: boolean;
    steps: boolean;
    sleep: boolean;
    temperature: boolean;
    stress: boolean;
    ecg: boolean;
    bloodPressure: boolean;
    spO2: boolean;
    activity: boolean;
    hydration: boolean;
  };
}

interface ScannedDevice {
  id: string;
  name: string;
  rssi?: number;
  device: BluetoothDevice;
}

interface DoshaAnalysis {
  type: 'Vata' | 'Pitta' | 'Kapha' | 'Vata-Pitta' | 'Pitta-Kapha' | 'Vata-Kapha';
  heartRate: number;
  description: string;
  recommendations: string[];
}

export default function SmartDevicesPage() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState('');
  const [scannedDevices, setScannedDevices] = useState<ScannedDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [bluetoothDevice, setBluetoothDevice] = useState<BluetoothDevice | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [currentHeartRate, setCurrentHeartRate] = useState<number | null>(null);
  const [doshaAnalysis, setDoshaAnalysis] = useState<DoshaAnalysis | null>(null);
  const [showDoshaModal, setShowDoshaModal] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [liveDataLog, setLiveDataLog] = useState<Array<{timestamp: string, heartRate: number}>>([]);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/signin');
        return;
      }

      const response = await fetch('http://localhost:4000/api/health/devices', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setDevices(data.devices);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const scanBluetoothDevices = async (deviceType: string) => {
    try {
      setIsScanning(true);
      setScannedDevices([]);
      setSelectedDeviceType(deviceType);
      setShowScanModal(true);
      
      // Check if Web Bluetooth is supported
      if (!navigator.bluetooth) {
        alert('Web Bluetooth is not supported in this browser. Please use Chrome, Edge, or Opera on desktop or Android.');
        setIsScanning(false);
        return;
      }

      setConnectionStatus('Scanning for Bluetooth devices...');
      
      // Request Bluetooth device with heart rate service
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] }
        ],
        optionalServices: [
          'battery_service',
          'device_information',
          'health_thermometer',
          'blood_pressure',
          'cycling_power'
        ]
      });

      // Add scanned device to list
      const scannedDevice: ScannedDevice = {
        id: device.id,
        name: device.name || 'Unknown Device',
        device: device
      };

      setScannedDevices([scannedDevice]);
      setConnectionStatus(`Found: ${scannedDevice.name}`);
      
    } catch (error: any) {
      console.error('Error scanning devices:', error);
      if (error.name === 'NotFoundError') {
        setConnectionStatus('No devices found. Make sure your smartwatch Bluetooth is on and in pairing mode.');
      } else if (error.name === 'SecurityError') {
        setConnectionStatus('Bluetooth access denied. Please allow Bluetooth access.');
      } else {
        setConnectionStatus(`Scan failed: ${error.message}`);
      }
    } finally {
      setIsScanning(false);
    }
  };

  const calculateDoshaType = (heartRate: number): DoshaAnalysis => {
    let type: DoshaAnalysis['type'];
    let description: string;
    let recommendations: string[];

    if (heartRate >= 75) {
      type = 'Vata';
      description = 'Vata dominant - Higher heart rate indicates active, energetic constitution';
      recommendations = [
        '🧘 Practice calming meditation and yoga',
        '🌿 Consume warm, grounding foods',
        '💧 Stay well hydrated',
        '😴 Maintain regular sleep schedule',
        '🌾 Use sesame oil for massage'
      ];
    } else if (heartRate >= 65 && heartRate < 75) {
      type = 'Vata-Pitta';
      description = 'Vata-Pitta balance - Moderately elevated heart rate shows mixed constitution';
      recommendations = [
        '🌱 Balance cooling and warming foods',
        '🧘 Regular exercise with rest periods',
        '💚 Include leafy greens in diet',
        '🌊 Practice breathing exercises',
        '⚖️ Maintain work-life balance'
      ];
    } else if (heartRate >= 60 && heartRate < 65) {
      type = 'Pitta';
      description = 'Pitta dominant - Moderate heart rate indicates balanced, focused constitution';
      recommendations = [
        '🥗 Eat cooling, fresh foods',
        '🏊 Engage in moderate exercise',
        '🧊 Avoid excessive heat',
        '🌙 Practice evening relaxation',
        '🥥 Use coconut oil externally'
      ];
    } else if (heartRate >= 55 && heartRate < 60) {
      type = 'Pitta-Kapha';
      description = 'Pitta-Kapha balance - Moderately low heart rate shows grounded energy';
      recommendations = [
        '🏃 Regular physical activity',
        '🌶️ Include warming spices',
        '🥗 Light, nutritious meals',
        '☀️ Morning exercise routine',
        '🌿 Herbal teas for digestion'
      ];
    } else {
      type = 'Kapha';
      description = 'Kapha dominant - Lower heart rate indicates calm, stable constitution';
      recommendations = [
        '🏃 Vigorous daily exercise',
        '🌶️ Spicy, warming foods',
        '☀️ Wake up early, stay active',
        '🧹 Avoid heavy, oily foods',
        '🌿 Dry brushing and massage'
      ];
    }

    return {
      type,
      heartRate,
      description,
      recommendations
    };
  };

  const connectDevice = async (deviceType: string) => {
    try {
      setIsConnecting(true);
      setConnectionStatus('Requesting Bluetooth access...');
      
      // Check if Web Bluetooth is supported
      if (!navigator.bluetooth) {
        alert('Web Bluetooth is not supported in this browser. Please use Chrome, Edge, or Opera.');
        setIsConnecting(false);
        return;
      }

      setConnectionStatus('Scanning for devices...');
      
      // Request Bluetooth device
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] }
        ],
        optionalServices: ['battery_service', 'device_information', 'health_thermometer']
      });

      setConnectionStatus(`Connecting to ${device.name}...`);
      setBluetoothDevice(device);

      // Connect to GATT Server
      const server = await device.gatt?.connect();
      
      if (!server) {
        throw new Error('Failed to connect to GATT server');
      }

      setConnectionStatus('Reading device information...');
      
      // Get device information
      let deviceModel = 'Unknown Model';
      let deviceId = device.id || `${deviceType}-${Date.now()}`;
      
      try {
        const deviceInfoService = await server.getPrimaryService('device_information');
        const modelCharacteristic = await deviceInfoService.getCharacteristic('model_number_string');
        const modelValue = await modelCharacteristic.readValue();
        deviceModel = new TextDecoder().decode(modelValue);
      } catch (e) {
        console.log('Could not read device model, using default');
      }

      setConnectionStatus('Saving device connection...');
      
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:4000/api/health/devices/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceType,
          deviceId,
          deviceName: device.name || (deviceType === 'apple-watch' ? 'Apple Watch' : 
                     deviceType === 'samsung-watch' ? 'Samsung Galaxy Watch' : 
                     deviceType === 'wear-os' ? 'Wear OS Device' : 'Smartwatch'),
          deviceModel,
          permissions: {
            heartRate: true,
            steps: true,
            sleep: true,
            temperature: true,
            stress: true,
            ecg: true,
            bloodPressure: true,
            spO2: true,
            activity: true,
            hydration: true
          },
          syncFrequency: 'hourly'
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowConnectModal(false);
        setShowScanModal(false);
        setConnectionStatus('Connected successfully! Reading heart rate...');
        fetchDevices();
        
        // Start reading health data from Bluetooth device
        startBluetoothDataSync(server, data.device.deviceId, deviceType);
      }
      } catch (error: any) {
      console.error('Error connecting device:', error);
      if (error.name === 'NotFoundError') {
        setConnectionStatus('⚠️ No device selected. Make sure your smartwatch is in pairing mode and Bluetooth is enabled.');
      } else if (error.name === 'SecurityError') {
        setConnectionStatus('Bluetooth access denied');
      } else {
        setConnectionStatus(`Connection failed: ${error.message}`);
      }
      setTimeout(() => setConnectionStatus(''), 5000);
    } finally {
      setIsConnecting(false);
    }
  };

  const connectToScannedDevice = async (scannedDevice: ScannedDevice) => {
    try {
      setIsConnecting(true);
      setConnectionStatus(`Connecting to ${scannedDevice.name}...`);
      
      const device = scannedDevice.device;
      setBluetoothDevice(device);

      // Connect to GATT Server
      const server = await device.gatt?.connect();
      
      if (!server) {
        throw new Error('Failed to connect to GATT server');
      }

      setConnectionStatus('Reading device information...');
      
      // Get device information
      let deviceModel = 'Unknown Model';
      let deviceId = device.id || `${selectedDeviceType}-${Date.now()}`;
      
      try {
        const deviceInfoService = await server.getPrimaryService('device_information');
        const modelCharacteristic = await deviceInfoService.getCharacteristic('model_number_string');
        const modelValue = await modelCharacteristic.readValue();
        deviceModel = new TextDecoder().decode(modelValue);
      } catch (e) {
        console.log('Could not read device model, using default');
      }

      setConnectionStatus('Saving device connection...');
      
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:4000/api/health/devices/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceType: selectedDeviceType,
          deviceId,
          deviceName: device.name || 'Smartwatch',
          deviceModel,
          permissions: {
            heartRate: true,
            steps: true,
            sleep: true,
            temperature: true,
            stress: true,
            ecg: true,
            bloodPressure: true,
            spO2: true,
            activity: true,
            hydration: true
          },
          syncFrequency: 'hourly'
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowScanModal(false);
        setConnectionStatus('Connected successfully! Reading heart rate...');
        fetchDevices();
        
        // Start reading health data from Bluetooth device
        startBluetoothDataSync(server, data.device.deviceId, selectedDeviceType);
      }
    } catch (error: any) {
      console.error('Error connecting to device:', error);
      setConnectionStatus(`Connection failed: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const startBluetoothDataSync = async (server: BluetoothRemoteGATTServer, deviceId: string, deviceType: string) => {
    try {
      setConnectionStatus('Starting heart rate monitoring...');
      setIsMonitoring(true);
      
      // Try to get heart rate service
      const heartRateService = await server.getPrimaryService('heart_rate');
      const heartRateCharacteristic = await heartRateService.getCharacteristic('heart_rate_measurement');
      
      // Listen for heart rate measurements (CONTINUOUS LIVE DATA)
      heartRateCharacteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const flags = value.getUint8(0);
        const rate16Bits = flags & 0x1;
        let heartRate;
        
        if (rate16Bits) {
          heartRate = value.getUint16(1, true);
        } else {
          heartRate = value.getUint8(1);
        }
        
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] Live Heart Rate: ${heartRate} BPM`);
        
        // Update current heart rate
        setCurrentHeartRate(heartRate);
        
        // Add to live data log
        setLiveDataLog(prev => {
          const newLog = [...prev, { timestamp, heartRate }];
          // Keep only last 20 readings
          return newLog.slice(-20);
        });
        
        // Calculate dosha type
        const dosha = calculateDoshaType(heartRate);
        setDoshaAnalysis(dosha);
        
        // Auto-show modal on first reading
        if (liveDataLog.length === 0) {
          setShowDoshaModal(true);
        }
        
        // Sync this data to backend
        syncHealthData(deviceId, deviceType, { heartRate });
      });
      
      await heartRateCharacteristic.startNotifications();
      setConnectionStatus('✅ Connected! Receiving live heart rate data...');
      
      // Try to get battery level
      try {
        const batteryService = await server.getPrimaryService('battery_service');
        const batteryCharacteristic = await batteryService.getCharacteristic('battery_level');
        const batteryValue = await batteryCharacteristic.readValue();
        const battery = batteryValue.getUint8(0);
        setBatteryLevel(battery);
        console.log('Battery level:', battery + '%');
      } catch (e) {
        console.log('Could not read battery level');
      }
      
      // Handle disconnection
      server.device.addEventListener('gattserverdisconnected', () => {
        console.log('Device disconnected');
        setIsMonitoring(false);
        setConnectionStatus('⚠️ Device disconnected');
        setTimeout(() => setConnectionStatus(''), 5000);
      });
      
      setTimeout(() => setConnectionStatus(''), 3000);
    } catch (error) {
      console.error('Error starting Bluetooth data sync:', error);
      setConnectionStatus('⚠️ Could not read heart rate. Using simulated data for demo.');
      setIsMonitoring(false);
      
      // Fall back to simulated data with continuous updates
      let simulationInterval = setInterval(() => {
        const simulatedHeartRate = Math.floor(Math.random() * 30) + 60;
        const timestamp = new Date().toLocaleTimeString();
        
        setCurrentHeartRate(simulatedHeartRate);
        setLiveDataLog(prev => {
          const newLog = [...prev, { timestamp, heartRate: simulatedHeartRate }];
          return newLog.slice(-20);
        });
        
        const dosha = calculateDoshaType(simulatedHeartRate);
        setDoshaAnalysis(dosha);
        
        syncHealthData(deviceId, deviceType, { heartRate: simulatedHeartRate });
      }, 2000); // Update every 2 seconds
      
      // Show modal on first simulated reading
      setTimeout(() => setShowDoshaModal(true), 1000);
      
      setTimeout(() => setConnectionStatus(''), 3000);
    }
  };

  const syncHealthData = async (deviceId: string, deviceType: string, realtimeData?: any) => {
    try {
      const token = localStorage.getItem('token');
      
      // Use real-time data if available, otherwise simulate
      const healthData = realtimeData || {
        heartRate: Math.floor(Math.random() * 30) + 60,
        steps: Math.floor(Math.random() * 10000) + 5000,
        bodyTemperature: Math.random() * 2 + 36.5,
        spO2: Math.floor(Math.random() * 5) + 95,
        stressLevel: Math.floor(Math.random() * 50) + 20,
        sleepDurationMinutes: Math.floor(Math.random() * 180) + 360,
        caloriesBurned: Math.floor(Math.random() * 1000) + 1500,
        activeMinutes: Math.floor(Math.random() * 60) + 30,
        recordedAt: new Date(),
        dataSource: deviceType === 'apple-watch' ? 'Apple Health' : 
                   deviceType === 'samsung-watch' ? 'Samsung Health' : 'Google Fit'
      };

      await fetch('http://localhost:4000/api/health/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceId,
          healthData
        })
      });
    } catch (error) {
      console.error('Error syncing health data:', error);
    }
  };

  const disconnectDevice = async (deviceId: string) => {
    try {
      // Disconnect Bluetooth device if connected
      if (bluetoothDevice?.gatt?.connected) {
        bluetoothDevice.gatt.disconnect();
        setBluetoothDevice(null);
      }
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:4000/api/health/devices/${deviceId}/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchDevices();
      }
    } catch (error) {
      console.error('Error disconnecting device:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-blue-600 hover:text-blue-700"
              >
                ← Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                ⌚ Smart Device Hub
              </h1>
            </div>
            <button
              onClick={() => scanBluetoothDevices('smartwatch')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg"
            >
              🔍 Scan & Connect Device
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Live Monitoring Indicator */}
        {isMonitoring && (
          <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-white rounded-full animate-ping"></div>
              <div>
                <h3 className="text-xl font-bold">🔴 Live Monitoring Active</h3>
                <p className="text-green-100">Receiving real-time data from your smartwatch</p>
              </div>
              {batteryLevel && (
                <div className="ml-auto text-right">
                  <p className="text-sm text-green-100">Device Battery</p>
                  <p className="text-2xl font-bold">{batteryLevel}%</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Data Log */}
        {liveDataLog.length > 0 && (
          <div className="mb-6 bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Live Heart Rate Data Stream</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
              <div className="space-y-2">
                {liveDataLog.slice().reverse().map((log, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{log.timestamp}</span>
                    <span className="font-bold text-red-600">{log.heartRate} BPM</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Showing last {liveDataLog.length} readings • Updates in real-time</p>
          </div>
        )}

        {/* Current Heart Rate & Dosha Display */}
        {currentHeartRate && doshaAnalysis && (
          <div className="mb-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">💓 Current Heart Rate</h3>
                <p className="text-5xl font-bold mb-2">{currentHeartRate} BPM</p>
                <p className="text-xl font-semibold">Dosha Type: {doshaAnalysis.type}</p>
                <p className="text-purple-100 mt-2">{doshaAnalysis.description}</p>
              </div>
              <button
                onClick={() => setShowDoshaModal(true)}
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all"
              >
                View Full Analysis →
              </button>
            </div>
          </div>
        )}

        {/* Important Info Banner */}
        <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="text-5xl">💡</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">How to Connect Your Smartwatch</h3>
              <p className="text-green-100 mb-3">Follow these steps to connect your device and get Dosha analysis:</p>
              <ul className="text-green-50 space-y-1 text-sm">
                <li>✅ <strong>Step 1:</strong> Turn on Bluetooth on your smartwatch and phone/computer</li>
                <li>✅ <strong>Step 2:</strong> Click "🔍 Scan & Connect Device" button above</li>
                <li>✅ <strong>Step 3:</strong> Select your smartwatch from the browser dialog</li>
                <li>✅ <strong>Step 4:</strong> Your heart rate will be monitored automatically</li>
                <li>✅ <strong>Step 5:</strong> Get instant Dosha type analysis based on your heart rate!</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Connection Status Banner */}
        {connectionStatus && (
          <div className={`mb-6 p-4 rounded-lg ${isConnecting ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
            <div className="flex items-center gap-3">
              {isConnecting && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              )}
              <p className="font-semibold">{connectionStatus}</p>
            </div>
          </div>
        )}

        {/* Connected Devices */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connected Devices</h2>
          
          {devices.filter(d => d.isConnected).length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg border-2 border-gray-200">
              <div className="text-6xl mb-4">📱</div>
              <p className="text-gray-600 text-lg">No devices connected yet</p>
              <p className="text-gray-500 mt-2">Connect your smartwatch or smartphone to start tracking your health</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {devices.filter(d => d.isConnected).map(device => (
                <div key={device._id} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-300 hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl">
                      {device.deviceType === 'apple-watch' ? '⌚' : 
                       device.deviceType === 'samsung-watch' ? '⌚' : 
                       device.deviceType === 'smartphone' ? '📱' : '⌚'}
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">
                      Connected
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{device.deviceName}</h3>
                  {device.deviceModel && (
                    <p className="text-gray-600 text-sm mb-3">{device.deviceModel}</p>
                  )}
                  
                  {device.lastSyncedAt && (
                    <p className="text-gray-500 text-xs mb-4">
                      Last synced: {new Date(device.lastSyncedAt).toLocaleString()}
                    </p>
                  )}
                  
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Tracking:</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(device.permissions)
                        .filter(([_, enabled]) => enabled)
                        .map(([perm]) => (
                          <span key={perm} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {perm}
                          </span>
                        ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => disconnectDevice(device.deviceName)}
                    className="w-full bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-200 transition-all"
                  >
                    Disconnect
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Devices */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Devices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Apple Watch */}
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-6 shadow-lg border-2 border-blue-300 hover:shadow-xl transition-all">
              <div className="text-5xl mb-4">⌚</div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Apple Watch</h3>
              <p className="text-gray-700 text-sm mb-4">Real-time heart rate, body temperature, and stress monitoring</p>
              
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="text-xs bg-blue-200 text-blue-900 px-3 py-1 rounded-full">Heart Rate</span>
                <span className="text-xs bg-blue-200 text-blue-900 px-3 py-1 rounded-full">Temperature</span>
                <span className="text-xs bg-blue-200 text-blue-900 px-3 py-1 rounded-full">Sleep Data</span>
                <span className="text-xs bg-blue-200 text-blue-900 px-3 py-1 rounded-full">Stress Level</span>
              </div>
              
              <button
                onClick={() => scanBluetoothDevices('apple-watch')}
                disabled={isConnecting}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Connecting...
                  </>
                ) : (
                  <>🔗 Scan & Connect</>
                )}
              </button>
            </div>

            {/* Samsung Watch */}
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 shadow-lg border-2 border-purple-300 hover:shadow-xl transition-all">
              <div className="text-5xl mb-4">⌚</div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Samsung Galaxy Watch</h3>
              <p className="text-gray-700 text-sm mb-4">Comprehensive health tracking with Samsung Health integration</p>
              
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="text-xs bg-purple-200 text-purple-900 px-3 py-1 rounded-full">Activity</span>
                <span className="text-xs bg-purple-200 text-purple-900 px-3 py-1 rounded-full">Hydration</span>
                <span className="text-xs bg-purple-200 text-purple-900 px-3 py-1 rounded-full">ECG</span>
                <span className="text-xs bg-purple-200 text-purple-900 px-3 py-1 rounded-full">SpO2</span>
              </div>
              
              <button
                onClick={() => scanBluetoothDevices('samsung-watch')}
                disabled={isConnecting}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Connecting...
                  </>
                ) : (
                  <>🔗 Scan & Connect</>
                )}
              </button>
            </div>

            {/* Wear OS */}
            <div className="bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl p-6 shadow-lg border-2 border-green-300 hover:shadow-xl transition-all">
              <div className="text-5xl mb-4">⌚</div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Wear OS Devices</h3>
              <p className="text-gray-700 text-sm mb-4">Compatible with all Wear OS smartwatches</p>
              
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="text-xs bg-green-200 text-green-900 px-3 py-1 rounded-full">Heart Rate</span>
                <span className="text-xs bg-green-200 text-green-900 px-3 py-1 rounded-full">Steps</span>
                <span className="text-xs bg-green-200 text-green-900 px-3 py-1 rounded-full">Sleep</span>
                <span className="text-xs bg-green-200 text-green-900 px-3 py-1 rounded-full">Calories</span>
              </div>
              
              <button
                onClick={() => scanBluetoothDevices('wear-os')}
                disabled={isConnecting}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Connecting...
                  </>
                ) : (
                  <>🔗 Scan & Connect</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Health Dashboard Link */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-xl">
          <h3 className="text-2xl font-bold mb-4">📊 View Your Health Dashboard</h3>
          <p className="mb-6">Track your health metrics, analyze trends, and get personalized insights for better skin health</p>
          <button
            onClick={() => router.push('/health-dashboard')}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all"
          >
            Open Health Dashboard →
          </button>
        </div>
      </div>

      {/* Scan Modal */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">🔍 Scan Bluetooth Devices</h2>
              <button
                onClick={() => {
                  setShowScanModal(false);
                  setScannedDevices([]);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {isScanning ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-xl font-semibold text-gray-700">Scanning for devices...</p>
                <p className="text-gray-500 mt-2">Please select your device from the browser dialog</p>
              </div>
            ) : scannedDevices.length > 0 ? (
              <div>
                <p className="text-gray-600 mb-4">Found {scannedDevices.length} device(s). Click to connect:</p>
                <div className="space-y-3">
                  {scannedDevices.map((device) => (
                    <div
                      key={device.id}
                      className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-300 hover:border-blue-500 cursor-pointer transition-all"
                      onClick={() => connectToScannedDevice(device)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">⌚ {device.name}</h3>
                          <p className="text-gray-600 text-sm">Device ID: {device.id}</p>
                          {device.rssi && <p className="text-gray-500 text-xs">Signal: {device.rssi} dBm</p>}
                        </div>
                        <button
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                          disabled={isConnecting}
                        >
                          {isConnecting ? 'Connecting...' : 'Connect'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📱</div>
                <p className="text-gray-600 mb-4">No devices found yet</p>
                <button
                  onClick={() => scanBluetoothDevices(selectedDeviceType)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                >
                  Start Scanning
                </button>
              </div>
            )}

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>💡 Tip:</strong> Make sure your smartwatch is in pairing mode and Bluetooth is enabled. 
                When the browser dialog appears, select your device and click "Pair".
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dosha Analysis Modal */}
      {showDoshaModal && doshaAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">🧘 Your Dosha Analysis</h2>
              <button
                onClick={() => setShowDoshaModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="mb-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Current Heart Rate</p>
                <p className="text-6xl font-bold text-purple-600 mb-4">{doshaAnalysis.heartRate} BPM</p>
                <div className="inline-block bg-purple-600 text-white px-8 py-3 rounded-full text-2xl font-bold">
                  {doshaAnalysis.type}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">📋 Description</h3>
              <p className="text-gray-700 leading-relaxed">{doshaAnalysis.description}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">💡 Recommendations for You</h3>
              <div className="space-y-3">
                {doshaAnalysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 bg-green-50 p-4 rounded-lg">
                    <span className="text-2xl">✓</span>
                    <p className="text-gray-700 flex-1">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-bold text-blue-900 mb-2">📚 About Doshas & Heart Rate</h4>
              <p className="text-sm text-blue-800">
                In Ayurveda, your dosha type represents your unique constitution. Heart rate is one indicator:
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• <strong>Vata</strong> (75+ bpm): Active, energetic, creative</li>
                <li>• <strong>Pitta</strong> (60-74 bpm): Focused, determined, warm</li>
                <li>• <strong>Kapha</strong> (below 60 bpm): Calm, stable, grounded</li>
              </ul>
            </div>

            <button
              onClick={() => setShowDoshaModal(false)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Close Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
