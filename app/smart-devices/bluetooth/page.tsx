'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

// ─── BLE Service & Characteristic UUIDs ──────────────────────────────────────
// Standard UUIDs: https://www.bluetooth.com/specifications/assigned-numbers/
const BLE_SERVICES = {
  HEART_RATE:      'heart_rate',            // 0x180D – standard wearables
  BATTERY:         'battery_service',        // 0x180F
  DEVICE_INFO:     'device_information',     // 0x180A
  HEALTH_THERMO:   'health_thermometer',     // 0x1809
  ENV_SENSING:     'environmental_sensing',  // 0x181A
  // 👇 Replace with YOUR custom wearable's advertised service UUID
  CUSTOM_WEARABLE: '12345678-1234-1234-1234-1234567890ab',
} as const;

const BLE_CHARACTERISTICS = {
  HEART_RATE_MEASUREMENT:  'heart_rate_measurement',  // 0x2A37
  BATTERY_LEVEL:           'battery_level',            // 0x2A19
  TEMPERATURE_MEASUREMENT: 'temperature_measurement',  // 0x2A1C
  MANUFACTURER_NAME:       'manufacturer_name_string', // 0x2A29
} as const;

interface ScannedDevice {
  id: string;
  name: string;
  rssi?: number;
  device: BluetoothDevice;
  discovered?: Date;
}

interface ConnectedDevice {
  _id: string;
  deviceType: string;
  deviceName: string;
  deviceModel?: string;
  isConnected: boolean;
  batteryLevel?: number;
  lastSyncedAt?: string;
  connectionStrength?: number;
}

interface ScanLog {
  timestamp: string;
  message: string;
  type: 'scanning' | 'device-found' | 'error' | 'info' | 'data';
}

interface LiveMetrics {
  heartRate: number | null;
  heartRateHistory: { time: string; bpm: number }[];
  rrIntervals: number[];        // R-R intervals in ms
  contactDetected: boolean | null;
  timestamp: string | null;
}

interface StreamLogEntry {
  time: string;
  bpm: number;
  sent: 'socket' | 'rest' | 'failed';
}

export default function BluetoothConnectionPage() {
  const router = useRouter();

  // ─ Persistent refs (survive re-renders) ─────────────────────────────────────
  const socketRef   = useRef<Socket | null>(null);
  const gattRef     = useRef<BluetoothRemoteGATTServer | null>(null);
  const hrCharRef   = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ─ UI State ────────────────────────────────────────────────────────
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedDevices, setScannedDevices] = useState<ScannedDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Idle');
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);

  // ─ BLE / Socket State ────────────────────────────────────────────────
  const [notificationsActive, setNotificationsActive] = useState(false);
  const [isHttps, setIsHttps] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  // scanPhase: idle → picking → found → connecting → done
  const [scanPhase, setScanPhase] = useState<'idle'|'picking'|'found'|'connecting'|'done'>('idle');
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
    heartRate: null,
    heartRateHistory: [],
    rrIntervals: [],
    contactDetected: null,
    timestamp: null,
  });
  const [dataStreamLog, setDataStreamLog] = useState<StreamLogEntry[]>([]);

  useEffect(() => {
    checkEnvironment();
    fetchConnectedDevices();
    initializeSocket();
    return () => {
      socketRef.current?.disconnect();
      hrCharRef.current?.stopNotifications().catch(() => {});
    };
  }, []);

  // ─── Environment & Browser Checks ───────────────────────────────────────
  const checkEnvironment = () => {
    const secure =
      typeof window !== 'undefined' &&
      (window.location.protocol === 'https:' || window.location.hostname === 'localhost');
    setIsHttps(secure);
    if (!navigator.bluetooth) {
      setError(
        'Web Bluetooth is not supported. Use Chrome ≥ 70, Edge, or Opera on Desktop / Android.'
      );
    }
  };

  // ─── Socket.IO ───────────────────────────────────────────────────────────
  const initializeSocket = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const socket = io('http://localhost:4000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1500,
    });
    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));
    socket.on('ble-ack', (d: any) => console.log('[Socket.IO] Server ack:', d));
    socketRef.current = socket;
  };

  // ─── BLE Data Parser ──────────────────────────────────────────────────────────
  /**
   * Parse the Heart Rate Measurement characteristic value (0x2A37).
   * Spec: https://www.bluetooth.com/specifications/assigned-numbers/
   *
   * Byte 0 – Flags:
   *   bit 0: 0 = HR format UINT8, 1 = UINT16
   *   bit 1: Sensor Contact Detected
   *   bit 2: Sensor Contact Feature supported
   *   bit 3: Energy Expended present
   *   bit 4: RR-Interval present
   */
  const parseHeartRateMeasurement = (
    value: DataView
  ): { bpm: number; contactDetected: boolean | null; rr: number[] } => {
    const flags          = value.getUint8(0);
    const isUint16       = (flags & 0x01) !== 0;
    const contactSupport = (flags & 0x04) !== 0;
    const contactDetected = contactSupport ? (flags & 0x02) !== 0 : null;
    const hasEnergyExp   = (flags & 0x08) !== 0;
    const hasRR          = (flags & 0x10) !== 0;

    let offset = 1;
    const bpm = isUint16 ? value.getUint16(offset, /*littleEndian=*/true) : value.getUint8(offset);
    offset += isUint16 ? 2 : 1;
    if (hasEnergyExp) offset += 2;          // skip Energy Expended

    const rr: number[] = [];
    if (hasRR) {
      while (offset + 1 < value.byteLength) {
        // RR values are in 1/1024 seconds, convert to ms
        rr.push(Math.round((value.getUint16(offset, true) / 1024) * 1000));
        offset += 2;
      }
    }
    return { bpm, contactDetected, rr };
  };

  // ─── Send BLE Data to Backend ─────────────────────────────────────────────────────
  /**
   * Sends parsed BLE metrics to the Node.js backend.
   * Strategy: Socket.IO (real-time) with automatic fallback to REST POST.
   */
  const sendDataToBackend = useCallback(
    async (payload: {
      bpm: number;
      rr: number[];
      contactDetected: boolean | null;
      deviceName: string;
      deviceId: string;
    }) => {
      const token = localStorage.getItem('token');
      const body = {
        heartRate:        payload.bpm,
        rrIntervals:      payload.rr,
        contactDetected:  payload.contactDetected,
        deviceName:       payload.deviceName,
        deviceId:         payload.deviceId,
        recordedAt:       new Date().toISOString(),
        dataSource:       'BLE-HeartRate',
      };

      // ─ Try Socket.IO first ──────────────────
      if (socketRef.current?.connected) {
        socketRef.current.emit('ble-health-data', body);
        setDataStreamLog(prev => [
          { time: new Date().toLocaleTimeString(), bpm: payload.bpm, sent: 'socket' },
          ...prev.slice(0, 19),
        ]);
        return;
      }

      // ─ REST fallback ──────────────────────
      try {
        const res = await fetch('http://localhost:4000/api/health/ble-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        setDataStreamLog(prev => [
          { time: new Date().toLocaleTimeString(), bpm: payload.bpm, sent: res.ok ? 'rest' : 'failed' },
          ...prev.slice(0, 19),
        ]);
      } catch {
        setDataStreamLog(prev => [
          { time: new Date().toLocaleTimeString(), bpm: payload.bpm, sent: 'failed' },
          ...prev.slice(0, 19),
        ]);
      }
    },
    []
  );

  // ─── Subscribe to BLE Notifications ──────────────────────────────────────────────
  /**
   * Subscribe to Heart Rate Measurement notifications (0x2A37).
   * The BLE device will push data automatically without polling.
   */
  const subscribeToNotifications = async (
    gatt: BluetoothRemoteGATTServer,
    device: BluetoothDevice
  ) => {
    try {
      addScanLog('Subscribing to Heart Rate notifications…', 'info');
      const hrService = await gatt.getPrimaryService(BLE_SERVICES.HEART_RATE);
      const hrChar    = await hrService.getCharacteristic(
        BLE_CHARACTERISTICS.HEART_RATE_MEASUREMENT
      );

      const onNotification = (event: Event) => {
        const target = event.target as unknown as BluetoothRemoteGATTCharacteristic;
        const { bpm, contactDetected, rr } = parseHeartRateMeasurement(target.value!);
        const now = new Date().toLocaleTimeString();

        setLiveMetrics(prev => ({
          ...prev,
          heartRate: bpm,
          contactDetected,
          rrIntervals: rr,
          timestamp: now,
          heartRateHistory: [
            ...prev.heartRateHistory.slice(-29),
            { time: now, bpm },
          ],
        }));

        sendDataToBackend({
          bpm,
          rr,
          contactDetected,
          deviceName: device.name ?? 'BLE Device',
          deviceId: device.id,
        });
      };

      hrChar.addEventListener('characteristicvaluechanged', onNotification);
      await hrChar.startNotifications();
      hrCharRef.current = hrChar;
      setNotificationsActive(true);
      addScanLog('✓ Heart Rate notifications active — streaming to backend', 'data');
    } catch (e: any) {
      addScanLog(`Heart Rate service unavailable: ${e.message}`, 'info');
      addScanLog('Device may not expose Heart Rate — try a different BLE service UUID', 'info');
    }
  };

  // ─── BPM Color Helper ────────────────────────────────────────────────────────────
  const bpmColor = (bpm: number | null) => {
    if (!bpm) return 'text-gray-300';
    if (bpm < 60)  return 'text-blue-500';   // bradycardia
    if (bpm <= 100) return 'text-green-500'; // normal
    if (bpm <= 140) return 'text-yellow-500'; // elevated
    return 'text-red-500';                   // tachycardia
  };

  const fetchConnectedDevices = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:4000/api/health/devices', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setDevices(data.devices || []);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      setError('Failed to fetch connected devices');
    } finally {
      setLoading(false);
    }
  };

  const addScanLog = (message: string, type: 'scanning' | 'device-found' | 'error' | 'info' | 'data' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setScanLogs(prev => [...prev, { timestamp, message, type }]);
  };

  // Step 1: open the scanner modal (no BLE call here - just shows the UI)
  const startBluetoothScan = () => {
    if (!isHttps) {
      setError('HTTPS or localhost required. Web Bluetooth cannot run on plain http://');
      return;
    }
    if (!navigator.bluetooth) {
      setError('Web Bluetooth not supported. Use Chrome 70+ or Edge on Desktop/Android.');
      return;
    }
    setScannedDevices([]);
    setScanLogs([]);
    setScanProgress(0);
    setError('');
    setSuccessMessage('');
    setScanPhase('idle');
    setShowScanModal(true);
  };

  // Step 2: called by the "Search for Devices" button INSIDE the modal.
  // Must be a direct user click to satisfy browser security requirements.
  const triggerBLEPicker = async () => {
    if (!navigator.bluetooth) {
      setError('Web Bluetooth not supported on this browser.');
      setScanPhase('idle');
      return;
    }
    try {
      setScanPhase('picking');
      addScanLog('Opening BLE device picker... select your wearable', 'scanning');

      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          BLE_SERVICES.HEART_RATE,
          BLE_SERVICES.BATTERY,
          BLE_SERVICES.DEVICE_INFO,
          BLE_SERVICES.HEALTH_THERMO,
          BLE_SERVICES.ENV_SENSING,
          BLE_SERVICES.CUSTOM_WEARABLE,
          '180a', '180d', '180f',
        ],
      });

      addScanLog(`Found: ${device.name || 'Unknown Device'}`, 'device-found');
      setScannedDevices([{
        id: device.id,
        name: device.name || `BLE Device (${device.id.slice(0, 8)})`,
        device,
        discovered: new Date(),
      }]);
      setScanPhase('found');

    } catch (e: any) {
      if (e.name === 'NotFoundError') {
        addScanLog('Picker closed - no device selected.', 'info');
        setScanPhase('idle');
      } else if (e.name === 'SecurityError') {
        addScanLog('SecurityError: HTTPS / localhost required.', 'error');
        setError('HTTPS or localhost required for Web Bluetooth.');
        setShowScanModal(false);
        setScanPhase('idle');
      } else {
        addScanLog(`Error: ${e.message || 'Unknown error'}`, 'error');
        setScanPhase('idle');
      }
    }
  };

  // Step 3: connect button inside modal - performs the full GATT connection
  const connectFromModal = async (device: BluetoothDevice) => {
    setScanPhase('connecting');
    setScanProgress(30);
    addScanLog('Connecting to GATT server...', 'scanning');
    try {
      await connectToDevice(device);
      setScanProgress(100);
      setScanPhase('done');
      addScanLog('Connected successfully!', 'device-found');
      setTimeout(() => { setShowScanModal(false); setScanPhase('idle'); }, 1000);
    } catch {
      addScanLog('Connection failed. Try again.', 'error');
      setScanPhase('found');
      setScanProgress(0);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    setScanProgress(0);
    setShowScanModal(false);
  };

  const connectToDevice = async (device: BluetoothDevice) => {
    try {
      if (!device) {
        setError('Device object is invalid. Please scan again.');
        return;
      }

      setIsConnecting(true);
      setError('');
      setConnectionStatus('Connecting...');
      setSuccessMessage('');
      
      console.log('Attempting to connect to device:', device.name || device.id);

      // Check if device already has GATT
      if (!device.gatt) {
        throw new Error('Device GATT server is unavailable');
      }

      // Check if already connected
      if (device.gatt.connected) {
        console.log('Device already connected');
        setConnectionStatus('Connected');
        setSuccessMessage(`✓ Already connected to ${device.name || 'device'}`);
        setSelectedDevice(device);
        // Re-subscribe in case notifications dropped
        await subscribeToNotifications(device.gatt, device);
        await saveDeviceConnection(device);
        setIsConnecting(false);
        return;
      }

      // Attempt to connect with timeout
      console.log('Initiating GATT connection...');
      setConnectionStatus('GATT connection in progress...');
      
      const gatt = await device.gatt.connect();
      
      if (!gatt) {
        throw new Error('GATT connection returned null');
      }

      console.log('GATT connection established, checking status...');
      
      // Small delay to ensure connection is stable
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!gatt.connected) {
        throw new Error('GATT server is not in connected state');
      }

      console.log('Connection verified successfully');
      setConnectionStatus('Connected');
      setSuccessMessage(`✓ Successfully connected to ${device.name || 'your device'}`);
      setSelectedDevice(device);

      // Try to fetch battery info but don't fail if unavailable
      console.log('Fetching device information...');
      await fetchBatteryInfo(gatt);

      // Step 2 ─ Subscribe to Heart Rate notifications (real-time BLE data)
      await subscribeToNotifications(gatt, device);

      // Save to backend
      console.log('Saving device to backend...');
      await saveDeviceConnection(device);

      // Setup disconnect monitoring
      monitorDeviceConnection(device);
      
      console.log('Device connection complete');
    } catch (error: any) {
      console.error('Connection error:', error);
      setConnectionStatus('Failed');
      
      // Provide helpful error messages
      let errorMsg = error.message || 'Unknown error occurred';
      
      if (error.message?.includes('GATT')) {
        errorMsg = '❌ GATT connection failed. Try: 1) Enable Bluetooth, 2) Keep phone closer, 3) Restart phone Bluetooth.';
      } else if (error.name === 'NotFoundError') {
        errorMsg = '❌ Device not found or disconnected. Scan and try again.';
      } else if (error.name === 'SecurityError') {
        errorMsg = '❌ Bluetooth permission denied. Check app permissions.';
      } else if (error.message?.includes('unavailable')) {
        errorMsg = '❌ Device is no longer available. Try scanning again.';
      } else if (!error.message) {
        errorMsg = '❌ Connection failed. Please try again.';
      }
      
      setError(errorMsg);
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchBatteryInfo = async (gatt: BluetoothRemoteGATTServer) => {
    try {
      const batteryService = await gatt.getPrimaryService('battery_service');
      const batteryLevelChar = await batteryService.getCharacteristic('battery_level');
      const value = await batteryLevelChar.readValue();
      const batteryPercent = value.getUint8(0);
      setBatteryLevel(batteryPercent);
    } catch (e: any) {
      // Battery service is optional, so we don't throw an error
      console.log('Battery service not available:', e.message);
      setBatteryLevel(null);
    }
  };

  const monitorDeviceConnection = (device: BluetoothDevice) => {
    try {
      // Monitor connection status
      const handleDisconnect = () => {
        setConnectionStatus('Disconnected');
        setError('Device disconnected unexpectedly');
        console.log('Device disconnected:', device.name);
      };

      device.addEventListener('gattserverdisconnected', handleDisconnect);

      // Return cleanup function
      return () => {
        if (device) {
          device.removeEventListener('gattserverdisconnected', handleDisconnect);
        }
      };
    } catch (error) {
      console.error('Monitoring error:', error);
    }
  };

  const saveDeviceConnection = async (device: BluetoothDevice) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No authentication token found');
        return;
      }

      console.log('Saving device connection:', device.name || device.id);
      
      const response = await fetch('http://localhost:4000/api/health/devices/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          deviceType: 'Wearable',
          deviceId: device.id,
          deviceName: device.name || 'BLE Wearable',
          deviceModel: device.id,
          isConnected: true,
          permissions: {
            heartRate: true,
            battery: true,
            steps: false,
            sleep: false,
            temperature: false,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        console.log('Device saved to backend successfully');
        fetchConnectedDevices();
      } else {
        console.warn('Backend returned success:false', data);
      }
    } catch (error) {
      console.error('Error saving device to backend:', error);
      // Don't throw - connection is already established, just backend save failed
    }
  };

  const disconnectDevice = async (deviceId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Stop BLE notifications first
      if (hrCharRef.current) {
        try { await hrCharRef.current.stopNotifications(); } catch {}
        hrCharRef.current = null;
      }
      setNotificationsActive(false);

      // Disconnect GATT
      if (selectedDevice?.gatt?.connected) {
        try { selectedDevice.gatt.disconnect(); } catch (e) {
          console.log('Could not disconnect GATT:', e);
        }
      }

      // Notify backend — uses the correct POST /disconnect route
      const response = await fetch(`http://localhost:4000/api/health/devices/${deviceId}/disconnect`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccessMessage('✓ Device disconnected successfully');
        setConnectionStatus('Disconnected');
        setSelectedDevice(null);
        setBatteryLevel(null);
        setLiveMetrics({ heartRate: null, heartRateHistory: [], rrIntervals: [], contactDetected: null, timestamp: null });
        setDataStreamLog([]);
        setError('');
        fetchConnectedDevices();
      } else {
        setError('Failed to disconnect device from system');
      }
    } catch (error) {
      console.error('Error disconnecting device:', error);
      setError('Failed to disconnect device');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-1">Smart Device — BLE Monitor</h1>
          <p className="text-gray-500">Connect via Bluetooth Low Energy and stream health metrics in real-time</p>
          {/* Status badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${isHttps ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isHttps ? '🔒 HTTPS / localhost' : '⚠ HTTP — BLE disabled'}
            </span>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${socketConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
              {socketConnected ? '⚡ Socket.IO connected' : '○ Socket.IO disconnected'}
            </span>
            {notificationsActive && (
              <span className="text-xs px-3 py-1 rounded-full font-semibold bg-red-50 text-red-600 animate-pulse">
                ❤ BLE notifications live
              </span>
            )}
          </div>
        </div>

        {/* ── HTTPS Warning ────────────────────────────────────────────────── */}
        {!isHttps && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-400 text-amber-800 rounded-lg text-sm">
            <strong>⚠ HTTPS Required:</strong> The Web Bluetooth API only works on <code>https://</code> or <code>localhost</code>.
            Serve your Next.js app over HTTPS in production (e.g. Vercel, Nginx + Let&apos;s Encrypt).
            In development, run <code>next dev</code> on <code>localhost</code>.
          </div>
        )}

        {/* ── Alerts ──────────────────────────────────────────────────────── */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {/* ── Main Grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left Panel: Scan & UUID Reference ────────────────────── */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Pair Device</h2>

              {/* PRIMARY CTA ─ must be a real click, never programmatic */}
              <button
                onClick={startBluetoothScan}
                disabled={isScanning || isConnecting || !isHttps}
                className="w-full mb-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
              >
                {isScanning ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Scanning…</>
                ) : (
                  <><span>📡</span>Connect Device</>
                )}
              </button>
              <p className="text-xs text-gray-400 text-center mb-4">
                Picks up all nearby BLE devices — select one to connect automatically
              </p>

              {/* Scanned device list */}
              {scannedDevices.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Available ({scannedDevices.length})</h3>
                  {scannedDevices.map((d) => (
                    <div key={d.id} className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500 mb-2">
                      <p className="font-medium text-gray-800">{d.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{d.id.slice(0, 16)}…</p>
                      {d.discovered && (
                        <p className="text-xs text-gray-400 mt-0.5">Found: {d.discovered.toLocaleTimeString()}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* BLE UUID reference card */}
            <div className="bg-white rounded-xl shadow-lg p-5">
              <h3 className="font-bold text-gray-800 mb-3 text-sm">BLE Service UUIDs</h3>
              <div className="space-y-1.5 text-xs font-mono">
                {Object.entries(BLE_SERVICES).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2 py-0.5 border-b border-gray-50">
                    <span className="text-gray-500 shrink-0">{k}</span>
                    <span className="text-indigo-600 truncate">{v}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">Replace <code>CUSTOM_WEARABLE</code> with your device&apos;s UUID</p>
            </div>
          </div>

          {/* ── Right Panel: Live Data & Status ──────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Live Heart Rate Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Live Heart Rate</h2>
                {notificationsActive && (
                  <span className="flex items-center gap-1.5 text-xs text-red-500 font-bold">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping inline-block" />
                    LIVE
                  </span>
                )}
              </div>

              <div className="flex items-end gap-4 mb-3">
                <span className={`text-8xl font-black tabular-nums leading-none ${bpmColor(liveMetrics.heartRate)}`}>
                  {liveMetrics.heartRate ?? '—'}
                </span>
                <div className="pb-1">
                  <p className="text-2xl text-gray-400 font-semibold">BPM</p>
                  {liveMetrics.contactDetected !== null && (
                    <p className={`text-xs mt-1 font-semibold ${liveMetrics.contactDetected ? 'text-green-600' : 'text-amber-500'}`}>
                      {liveMetrics.contactDetected ? '✓ Sensor contact good' : '⚠ Poor sensor contact'}
                    </p>
                  )}
                  {liveMetrics.timestamp && (
                    <p className="text-xs text-gray-400 mt-0.5">Last update: {liveMetrics.timestamp}</p>
                  )}
                </div>
              </div>

              {/* BPM bar chart (last 30 readings) */}
              {liveMetrics.heartRateHistory.length > 0 && (
                <div className="flex items-end gap-0.5 h-16 mt-2 mb-2">
                  {liveMetrics.heartRateHistory.map((pt, i) => {
                    const maxB = Math.max(...liveMetrics.heartRateHistory.map(p => p.bpm), 1);
                    const h = Math.max(4, (pt.bpm / maxB) * 60);
                    return (
                      <div
                        key={i}
                        title={`${pt.time}: ${pt.bpm} bpm`}
                        style={{ height: `${h}px` }}
                        className="flex-1 rounded-t bg-gradient-to-t from-rose-500 to-red-300 opacity-80 hover:opacity-100 transition-opacity cursor-default"
                      />
                    );
                  })}
                </div>
              )}

              {!notificationsActive && (
                <p className="text-sm text-gray-400 mt-1">
                  {connectionStatus === 'Connected'
                    ? 'Heart Rate service not found on this device — check UUIDs.'
                    : 'Connect a BLE device to start streaming live data.'}
                </p>
              )}

              {/* R-R Intervals */}
              {liveMetrics.rrIntervals.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">R-R Intervals (ms)</p>
                  <p className="text-xs font-mono text-gray-700">{liveMetrics.rrIntervals.join(' · ')}</p>
                </div>
              )}
            </div>

            {/* Connection Status Card */}
            {selectedDevice && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">GATT Connection</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Device</p>
                    <p className="font-semibold text-gray-800 text-sm truncate">{selectedDevice.name || 'Unknown'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    connectionStatus === 'Connected' ? 'bg-green-50' :
                    connectionStatus.includes('Connecting') ? 'bg-yellow-50' : 'bg-red-50'
                  }`}>
                    <p className="text-xs text-gray-500 mb-1">GATT Status</p>
                    <p className={`font-semibold text-sm ${
                      connectionStatus === 'Connected' ? 'text-green-700' :
                      connectionStatus.includes('Connecting') ? 'text-yellow-700' : 'text-red-700'
                    }`}>
                      {connectionStatus}
                    </p>
                  </div>
                  {batteryLevel !== null && (
                    <div className="bg-amber-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Battery</p>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-800">{batteryLevel}%</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1.5 rounded-full"
                            style={{ width: `${batteryLevel}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="bg-purple-50 p-3 rounded-lg md:col-span-3">
                    <p className="text-xs text-gray-500 mb-1">Device ID</p>
                    <p className="text-xs font-mono text-gray-700 break-all">{selectedDevice.id}</p>
                  </div>
                </div>
                {connectionStatus === 'Connected' && (
                  <button
                    onClick={() => disconnectDevice(selectedDevice.id)}
                    className="w-full px-4 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all"
                  >
                    Disconnect &amp; Stop Notifications
                  </button>
                )}
              </div>
            )}

            {/* Data Stream Log */}
            {dataStreamLog.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-3">
                  Data Stream Log <span className="text-xs font-normal text-gray-400">last 20 readings</span>
                </h2>
                <div className="space-y-0.5 max-h-48 overflow-y-auto font-mono text-xs">
                  {dataStreamLog.map((entry, i) => (
                    <div key={i} className="flex items-center gap-3 py-1 border-b border-gray-50">
                      <span className="text-gray-400 w-20 shrink-0">{entry.time}</span>
                      <span className="font-bold text-gray-700 w-16 shrink-0">{entry.bpm} bpm</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        entry.sent === 'socket' ? 'bg-emerald-100 text-emerald-700' :
                        entry.sent === 'rest'   ? 'bg-blue-100 text-blue-700' :
                                                   'bg-red-100 text-red-600'
                      }`}>
                        {entry.sent === 'socket' ? '⚡ Socket.IO' :
                         entry.sent === 'rest'   ? '📡 REST API' : '✗ failed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Paired Devices */}
            {devices.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Paired Devices</h2>
                <div className="grid gap-3">
                  {devices.map((device) => (
                    <div
                      key={device._id}
                      className={`p-4 rounded-lg border-2 transition-all ${device.isConnected ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">{device.deviceName}</p>
                          <p className="text-xs text-gray-500">
                            Last synced: {device.lastSyncedAt ? new Date(device.lastSyncedAt).toLocaleString() : 'Never'}
                          </p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${device.isConnected ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                          {device.isConnected ? '● Live' : '○ Offline'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-sm">
              <h3 className="font-bold text-gray-800 mb-3">📋 Quick Tips</h3>
              <ul className="space-y-1.5 list-disc list-inside text-gray-600">
                <li>Use <strong>Chrome ≥ 70</strong> or <strong>Edge</strong> on Desktop or Android — Safari and Firefox do not support Web Bluetooth</li>
                <li>The <strong>Connect Device</strong> button <em>must</em> be triggered by a direct user click — never by <code>setTimeout</code>, <code>useEffect</code>, or other programmatic triggers</li>
                <li>App must be served over <strong>HTTPS</strong> or <code>localhost</code></li>
                <li>Keep the wearable within <strong>10 m</strong> during pairing</li>
                <li>Replace <code>CUSTOM_WEARABLE</code> UUID in <code>BLE_SERVICES</code> with your device&apos;s advertised service UUID</li>
                <li>Real-time data flows via <strong>Socket.IO</strong>; if disconnected it falls back to <strong>REST POST</strong> at <code>/api/health/ble-stream</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Bluetooth Device Scanner Modal --------------------------------- */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => { if (scanPhase === 'idle') { setShowScanModal(false); } }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white text-center relative">
              <button onClick={() => { setShowScanModal(false); setScanPhase('idle'); }} className="absolute right-3 top-3 text-white/70 hover:text-white text-lg">✕</button>
              <div className="flex justify-center mb-2">
                {/* Animated radar rings */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  {(scanPhase === 'idle' || scanPhase === 'picking') && <>
                    <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
                    <div className="absolute inset-2 rounded-full border-4 border-white/50 animate-ping [animation-delay:0.3s]" />
                    <div className="absolute inset-4 rounded-full border-4 border-white/70 animate-ping [animation-delay:0.6s]" />
                  </>}
                  {scanPhase === 'found' && <div className="absolute inset-0 rounded-full border-4 border-green-300 animate-pulse" />}
                  {scanPhase === 'done' && <div className="absolute inset-0 rounded-full bg-green-500/30 animate-ping" />}
                  <span className="relative z-10 text-2xl">
                    {scanPhase === 'done' ? '✓' : scanPhase === 'found' ? '📱' : '📡'}
                  </span>
                </div>
              </div>
              <h2 className="text-lg font-bold">
                {scanPhase === 'idle'       && 'Bluetooth Scanner'}
                {scanPhase === 'picking'    && 'Select Your Device'}
                {scanPhase === 'found'      && 'Device Found!'}
                {scanPhase === 'connecting' && 'Connecting...'}
                {scanPhase === 'done'       && 'Connected!'}
              </h2>
              <p className="text-white/80 text-xs mt-1">
                {scanPhase === 'idle'       && 'Click Search to discover nearby BLE devices'}
                {scanPhase === 'picking'    && 'Browser dialog is open — pick your device from the list'}
                {scanPhase === 'found'      && 'Review the device below, then tap Connect'}
                {scanPhase === 'connecting' && 'Establishing GATT connection...'}
                {scanPhase === 'done'       && 'Live data streaming is now active'}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-5">

              {/* IDLE: big search button */}
              {scanPhase === 'idle' && (
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-5">Make sure your wearable is powered on and within 10m. Tap the button below to start.</p>
                  <button
                    onClick={triggerBLEPicker}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all"
                  >
                    🔍 Search for Devices
                  </button>
                  <p className="text-gray-400 text-xs mt-3">Requires Chrome / Edge on Desktop or Android</p>
                </div>
              )}

              {/* PICKING: waiting for user to pick from browser dialog */}
              {scanPhase === 'picking' && (
                <div className="text-center py-4">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-gray-700 font-semibold">Browser picker is open</p>
                  <p className="text-gray-400 text-sm mt-2">Choose your Bluetooth device from the dialog window above this modal.</p>
                  <div className="mt-4 bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
                    <strong>Can&apos;t see your device?</strong> Make sure Bluetooth is enabled and your wearable is in pairing mode.
                  </div>
                </div>
              )}

              {/* FOUND: device card + connect button */}
              {scanPhase === 'found' && scannedDevices.length > 0 && (
                <div>
                  {scannedDevices.map(d => (
                    <div key={d.id} className="bg-gray-50 border-2 border-green-400 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-white text-xl shrink-0">📱</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">{d.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{d.id.slice(0, 20)}...</p>
                          <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">BLE Ready</span>
                        </div>
                        <div className="text-green-500 text-2xl">✓</div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => connectFromModal(scannedDevices[0].device)}
                    className="w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 active:scale-95 transition-all text-base shadow"
                  >
                    ⚡ Connect to {scannedDevices[0].name}
                  </button>
                  <button
                    onClick={triggerBLEPicker}
                    className="w-full mt-2 py-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Search again for a different device
                  </button>
                </div>
              )}

              {/* CONNECTING: progress bar */}
              {scanPhase === 'connecting' && scannedDevices.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-xl shrink-0">📱</div>
                    <div>
                      <p className="font-bold text-gray-900">{scannedDevices[0].name}</p>
                      <p className="text-sm text-gray-500">Pairing via GATT...</p>
                    </div>
                    <div className="ml-auto w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-center text-gray-400 mt-2">Reading GATT services... {scanProgress}%</p>
                  {/* Connection log */}
                  {scanLogs.length > 0 && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-3 max-h-28 overflow-y-auto space-y-1">
                      {scanLogs.map((log, i) => (
                        <div key={i} className="text-xs flex gap-2">
                          <span className="text-gray-400 shrink-0">{log.timestamp}</span>
                          <span className={log.type === 'device-found' ? 'text-green-600' : log.type === 'error' ? 'text-red-600' : 'text-blue-600'}>{log.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* DONE: success */}
              {scanPhase === 'done' && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">✅</div>
                  <p className="font-bold text-green-700 text-lg">Device Connected!</p>
                  <p className="text-gray-500 text-sm mt-1">Live health data streaming is now active.</p>
                  <button
                    onClick={() => { setShowScanModal(false); setScanPhase('idle'); }}
                    className="mt-5 w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600"
                  >
                    Done
                  </button>
                </div>
              )}

              {/* Cancel link (visible on idle/found) */}
              {(scanPhase === 'idle' || scanPhase === 'found') && (
                <button
                  onClick={() => { setShowScanModal(false); setScanPhase('idle'); }}
                  className="w-full mt-3 py-2 text-xs text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
