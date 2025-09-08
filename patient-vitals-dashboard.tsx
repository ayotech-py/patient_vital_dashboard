"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Heart, Activity, Thermometer, AlertTriangle, History, Wifi, User, Clock } from "lucide-react"
import useWebSocket from '@/hooks/useWebSocket';

// Patient data structure
interface Patient {
  id: number
  patient_id: string
  name: string
  age: number
  room: string
  condition: string
  avatar?: string
}

interface DataItem {
  patient: Patient;
  otherField: string;
}

// Placeholder chart components
const LineChart = ({
  title,
  value,
  unit,
  color,
  data,
}: {
  title: string
  value: number
  unit: string
  color: string
  data: number[]
}) => (
  <div
    className={`h-32 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center relative overflow-hidden`}
  >
    <div className="absolute inset-0 opacity-20">
      <svg className="w-full h-full" viewBox="0 0 200 100">
        <polyline
          suppressHydrationWarning
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          points={data.map((point, index) => `${index * 10},${100 - point}`).join(" ")}
        />
      </svg>
    </div>
    <div className="text-center z-10">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-white/80">{unit}</div>
    </div>
  </div>
)

const WaveformChart = ({ data }: { data: number[] }) => (
  <div className="h-48 bg-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden">
    <div className="absolute inset-0">
      <svg className="w-full h-full" viewBox="0 0 400 200">
        <defs>
          <linearGradient id="ecgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <polyline
          suppressHydrationWarning
          fill="none"
          stroke="url(#ecgGradient)"
          strokeWidth="2"
          points={data.map((point, index) => `${index * 2},${100 + point * 50}`).join(" ")}
        />
        <line x1="0" y1="100" x2="400" y2="100" stroke="#374151" strokeWidth="1" opacity="0.3" />
      </svg>
    </div>
    <div className="absolute top-2 left-2 text-green-400 text-sm font-mono">ECG - Lead II</div>
  </div>
)

interface HistoryPageProps {
  selectedPatient: Patient
  onBack: () => void
  onSwitchPatient: (patient: Patient) => void
  patients: Patient[],
  aggregates: Aggregate[]
}

const HistoryPage: React.FC<HistoryPageProps> = ({ selectedPatient, onBack, onSwitchPatient, patients, aggregates }) => {
  return (
    <div className="p-4">
      <Button onClick={onBack}>Back to Dashboard</Button>
      <h2>History for {selectedPatient.name}</h2>
      <AggregateTable aggregates={aggregates} />
    </div>
  )
}

interface SettingsPageProps {
  onBack: () => void
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  return (
    <div className="p-4">
      <Button onClick={onBack}>Back to Dashboard</Button>
      <h2>Settings</h2>
      {/* Add settings content here */}
    </div>
  )
}

type AccelerometerData = {
  x: number | undefined
  y: number | undefined
  z: number | undefined
}

interface Aggregate {
  id: number;
  start_time: string;
  end_time: string;
  patient: {
    id: number;
    name: string;
  };
  avg_heart_rate?: number;
  avg_spo2?: number;
  avg_temperature?: number;
  avg_accel_x?: number;
  avg_accel_y?: number;
  avg_accel_z?: number;
  risk_level: "Low" | "Moderate" | "High";
  confidence?: number;
  summary: string;
  created_at: string;
}

interface AggregateTableProps {
  aggregates: Aggregate[];
}

const AggregateTable: React.FC<AggregateTableProps> = ({ aggregates }) => {
  return (
    <div className="p-4 overflow-x-auto">
      <table className="min-w-full border border-gray-200 rounded-lg shadow-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">S/N</th>
            <th className="px-4 py-2 border">Start</th>
            <th className="px-4 py-2 border">End</th>
            <th className="px-4 py-2 border">HR (bpm)</th>
            <th className="px-4 py-2 border">SpO₂ (%)</th>
            <th className="px-4 py-2 border">Temp (°C)</th>
            <th className="px-4 py-2 border">Accel (x,y,z)</th>
            <th className="px-4 py-2 border">Risk</th>
            <th className="px-4 py-2 border">Confidence</th>
            <th className="px-4 py-2 border">Summary</th>
          </tr>
        </thead>
        <tbody>
          {aggregates.length > 0 ? (
            aggregates.map((agg, index) => (
              <tr key={agg.id} className="text-center hover:bg-gray-50">
                <td className="px-4 py-2 border">{index + 1}</td>
                <td className="px-4 py-2 border">{new Date(agg.start_time).toLocaleString()}</td>
                <td className="px-4 py-2 border">{new Date(agg.end_time).toLocaleString()}</td>
                <td className="px-4 py-2 border">{agg.avg_heart_rate?.toFixed(2) ?? "-"}</td>
                <td className="px-4 py-2 border">{agg.avg_spo2?.toFixed(2) ?? "-"}</td>
                <td className="px-4 py-2 border">{agg.avg_temperature?.toFixed(2) ?? "-"}</td>
                <td className="px-4 py-2 border">
                  ({agg.avg_accel_x?.toFixed(2) ?? 0}, {agg.avg_accel_y?.toFixed(2) ?? 0}, {agg.avg_accel_z?.toFixed(2) ?? 0})
                </td>
                <td
                  className={`px-4 py-2 border font-semibold ${
                    agg.risk_level === "High"
                      ? "text-red-600"
                      : agg.risk_level === "Moderate"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {agg.risk_level}
                </td>
                <td className="px-4 py-2 border">{agg.confidence ? `${(agg.confidence * 100).toFixed(1)}%` : "-"}</td>
                <td
                  className="px-4 py-2 border text-sm text-left max-w-xs truncate"
                  title={agg.summary}
                >
                  {agg.summary}
                </td>

              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={11} className="px-4 py-6 text-center text-gray-500">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default function PatientVitalsMonitor() {
  // Simulated real-time data
  const [currentTime, setCurrentTime] = useState(new Date())
  const [heartRate, setHeartRate] = useState<number>(0)
  const [spO2, setSpO2] = useState<number>(0)
  const [bodyTemp, setBodyTemp] = useState<number>(0)
  const [accelerometer, setAccelerometer] = useState<AccelerometerData>({ x: 0, y: 0, z: 0 })
  const [fallDetected, setFallDetected] = useState(false)
  const [riskLevel, setRiskLevel] = useState<"Low" | "Moderate" | "High" | "N/A">("N/A")
  const [vitalSummary, setVitalSummary] = useState<String>("")
  const [mlConfidence, setMlConfidence] = useState<number>(0)

  // Add after the existing state declarations
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState<"dashboard" | "history" | "settings">("dashboard")
  
  const [isLoading, setIsLoading] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState(patients[0])
  const baseUrl = "https://patientvitalbackend-production.up.railway.app"
  
  const { latestVitals, isConnected } = useWebSocket(selectedPatient?.id?.toString());

  console.log(latestVitals?.aggregates)


  const fetchPatientData = async() => {
    const url = `${baseUrl}/api/patients/`
    setIsLoading(true)
    try {
      const response = await fetch(url, {
        method: 'GET'
      })
      const data = await response.json()
      setPatients(data)
      setSelectedPatient(data[0])
      
      setIsLoading(false)
    } catch (error) {
      alert(`An error occured while fetching patient data: ${error}`)
    }
  } 

  useEffect(() => {
    fetchPatientData()
  }, [])

  // Chart data arrays
  const [hrData, setHrData] = useState<number[]>(Array(20).fill(0),)
  const [spO2Data, setSpO2Data] = useState<number[]>(Array(20).fill(0))
  const [ecgData, setEcgData] = useState<number[]>(Array(200).fill(0))

  interface PatientVitals {
    hr_data: number[];
    ecg_data: number[];
    spo2_data: number[];
  }

  interface AllPatientVitals {
    [patient_id: string]: PatientVitals;   // 👈 better to make patient_id dynamic
  }

  const [patientVitals, setPatientVitals] = useState<AllPatientVitals>({});

  const updateVitals = (patient_id: string, newVitals: PatientVitals) => {
    setPatientVitals(prev => ({
      ...prev,
      [patient_id]: newVitals   // replace or add vitals for this patient
    }));
  };



  const [vitalAggregate, setVitalAggregate] = useState<Aggregate[]>([])

  const switchPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsPatientDropdownOpen(false)

    /* // Reset vital signs with some variation based on patient condition
    const baseHR = patient.condition.includes("Cardiac") ? 85 : 72
    const baseSPO2 = patient.condition.includes("Respiratory") ? 94 : 98
    const baseTemp = patient.condition.includes("Post-operative") ? 99.2 : 98.6

    setHeartRate(baseHR + (Math.random() - 0.5) * 10)
    setSpO2(baseSPO2 + (Math.random() - 0.5) * 4)
    setBodyTemp(baseTemp + (Math.random() - 0.5) * 1) */

    // Reset fall detection
    setFallDetected(false)
  }

  // Real-time data simulation
  useEffect(() => {
    
    setCurrentTime(new Date())
    
    const accX = latestVitals?.accel_x;
    const accY = latestVitals?.accel_y;
    const accZ = latestVitals?.accel_z;

    const heart_rate = latestVitals?.heart_rate || 0;
    const spo2 = latestVitals?.spo2 || 0;
    const temp = latestVitals?.temperature || 0;

    const ecg = latestVitals?.ecg || 0;

    // Simulate vital signs with some variation
    setHeartRate(heart_rate)
    setSpO2(spo2)
    setBodyTemp(temp)

    setVitalSummary(latestVitals?.summary ?? "")
    setMlConfidence(latestVitals?.confidence ?? 0)


    // Simulate accelerometer data
    setAccelerometer({
      x: accX,
      y: accY,
      z: accZ,
    })

    // Simulate fall detection (random chance)
    const fallRisk = Math.random()
    setFallDetected(fallRisk < 0.02) // 2% chance per second

    // Update chart data
    setHrData((prev) => [...prev.slice(1), heart_rate])
    setSpO2Data((prev) => [...prev.slice(1), spo2])
    setEcgData((prev) => [...prev.slice(1), Math.sin(Date.now() * 0.01) * 0.5 + ecg])

    setRiskLevel(latestVitals?.risk_level || 'Low')

    setVitalAggregate(latestVitals?.aggregates ?? [])

    if (selectedPatient) {
      updateVitals(selectedPatient.patient_id, {
        hr_data: latestVitals?.hr_data ?? [],
        spo2_data: latestVitals?.spo2_data ?? [],
        ecg_data: latestVitals?.ecg_data ?? [],
      });
    }


    
  }, [latestVitals])

  useEffect(() => {
    setHeartRate(0)
    setSpO2(0)
    setBodyTemp(0)


    // Simulate accelerometer data
    setAccelerometer({
      x: 0,
      y: 0,
      z: 0,
    })

    // Update chart data
    setHrData(Array(20).fill(0).map((_, index) => patientVitals[selectedPatient?.patient_id]?.hr_data[index] ?? 0))
    setSpO2Data(Array(20).fill(0).map((_, index) => patientVitals[selectedPatient?.patient_id]?.spo2_data[index] ?? 0))
    setEcgData(Array(200).fill(0).map((_, index) => patientVitals[selectedPatient?.patient_id]?.ecg_data[index] ?? 0))

    setRiskLevel("N/A")

    setVitalSummary("")
    setMlConfidence(0)

    setVitalAggregate([])
  }, [selectedPatient])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (
        isPatientDropdownOpen &&
        !target.closest('[aria-haspopup="listbox"]') &&
        !target.closest('[role="listbox"]')
      ) {
        setIsPatientDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isPatientDropdownOpen])

  const getStatusColor = () => {
    switch (riskLevel) {
      case "High":
        return "bg-red-500"
      case "Moderate":
        return "bg-yellow-500"
      default:
        return "bg-green-500"
    }
  }

  const getRiskRecommendation = () => {
    switch (riskLevel) {
      case "High":
        return "Immediate attention required. Contact physician."
      default:
        return "Patient vitals within normal range. Continue monitoring."
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      {currentPage === "dashboard" && (
        <>
          {/* Header */}
          <header className="bg-white rounded-lg shadow-sm p-4 mb-6" role="banner">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <User className="h-6 w-6 text-teal-600" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-slate-900">Patient Vitals Monitor</h1>

                  {/* Patient Selector Dropdown */}
                  <div className="relative mt-1">
                    <button
                      onClick={() => setIsPatientDropdownOpen(!isPatientDropdownOpen)}
                      className="flex items-center gap-2 text-left hover:bg-slate-50 rounded-md p-2 transition-colors w-full sm:w-auto"
                      aria-label={`Current patient: ${selectedPatient?.name}, click to switch patients`}
                      aria-expanded={isPatientDropdownOpen}
                      aria-haspopup="listbox"
                    >
                      <div>
                        <div className="font-medium text-slate-900">{selectedPatient?.name}</div>
                        <div className="text-sm text-slate-600">
                          {selectedPatient?.patient_id} • Room {selectedPatient?.room}
                        </div>
                      </div>
                      <svg
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isPatientDropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isPatientDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                        <div className="p-2">
                          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide px-2 py-1">
                            Select Patient
                          </div>
                          <div className="space-y-1" role="listbox">
                            {patients.map((patient) => (
                              <button
                                key={patient?.patient_id}
                                onClick={() => switchPatient(patient)}
                                className={`w-full text-left p-3 rounded-md transition-colors hover:bg-slate-50 ${
                                  selectedPatient.patient_id === patient.patient_id ? "bg-teal-50 border border-teal-200" : ""
                                }`}
                                role="option"
                                aria-selected={selectedPatient.patient_id === patient?.patient_id}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-medium text-slate-600">
                                    {patient?.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-slate-900">{patient.name}</div>
                                    <div className="text-sm text-slate-600">
                                      {patient.patient_id} • Room {patient.room} • Age {patient.age}
                                    </div>
                                    <div className="text-xs text-slate-500">{patient.condition}</div>
                                  </div>
                                  {selectedPatient.patient_id === patient.patient_id && (
                                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Badge className={`${getStatusColor()} text-white px-3 py-1`} aria-label={`Risk level: ${riskLevel}`}>
                  {riskLevel} Risk
                </Badge>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <time suppressHydrationWarning>{new Date().toLocaleTimeString()}</time>
                </div>
                <div className={`flex items-center gap-1 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  <Wifi className="h-4 w-4" aria-hidden="true" />
                  <span className="text-sm font-medium" aria-label="Connection status: Live">
                    {isConnected ? 'Live' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
          </header>
          {/* AI Risk Assessment - Prominent Position */}
          <section className="bg-white rounded-lg shadow-sm p-4 mb-6" aria-labelledby="risk-assessment-heading">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 id="risk-assessment-heading" className="font-semibold text-slate-900 mb-2">
                  AI Risk Assessment
                </h2>
                <div className="flex items-center gap-3">
                  <Badge
                    className={`${getStatusColor()} text-white px-3 py-1`}
                    aria-label={`AI Risk level: ${riskLevel}`}
                  >
                    {riskLevel} Risk
                  </Badge>
                  <span className="text-sm text-slate-600">ML Confidence: {mlConfidence?.toFixed(2)}%</span>
                </div>
              </div>
              <div className="sm:max-w-md">
                <p className="text-sm text-slate-700" aria-live="polite">
                  {vitalSummary}
                </p>
              </div>
            </div>
          </section>

          {/* Main Dashboard Grid */}
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            {/* Left Panel - Vital Signs Charts - Order 2 on mobile */}
            <section className="lg:col-span-3 space-y-4 order-2 lg:order-1" aria-labelledby="vital-charts-heading">
              <h2 id="vital-charts-heading" className="sr-only">
                Vital Signs Charts
              </h2>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="h-5 w-5 text-red-500" aria-hidden="true" />
                    Heart Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart
                    title="Heart Rate"
                    value={Math.round(heartRate)}
                    unit="BPM"
                    color="from-red-500 to-red-600"
                    data={hrData}
                  />
                  <div className="mt-2 text-xs text-slate-600" aria-live="polite">
                    Normal: 60-100 BPM
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-blue-500" aria-hidden="true" />
                    SpO₂
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart
                    title="SpO₂"
                    value={Math.round(spO2)}
                    unit="%"
                    color="from-blue-500 to-blue-600"
                    data={spO2Data}
                  />
                  <div className="mt-2 text-xs text-slate-600" aria-live="polite">
                    Normal: 95-100%
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Center Panel - ECG Waveform - Order 1 on mobile */}
            <section className="lg:col-span-6 order-1 lg:order-2" aria-labelledby="ecg-heading">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle id="ecg-heading" className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" aria-hidden="true" />
                    ECG Waveform
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <WaveformChart data={ecgData} />
                  <div className="mt-4 flex justify-between text-sm text-slate-600">
                    <span>25mm/s</span>
                    <span>10mm/mV</span>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Right Panel - Motion/Fall Detection - Order 3 on mobile */}
            <section className="lg:col-span-3 order-3 lg:order-3" aria-labelledby="motion-heading">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle id="motion-heading" className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" aria-hidden="true" />
                    Motion Monitor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fallDetected && (
                    <Alert className="border-red-200 bg-red-50" role="alert">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800 font-medium">
                        Fall Detected! Immediate attention required.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-3">
                    <h3 className="font-medium text-slate-900">Accelerometer Data</h3>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center p-2 bg-slate-100 rounded">
                        <div className="font-mono font-bold" aria-label={`X-axis: ${accelerometer.x?.toFixed(2)}`}>
                          {accelerometer.x?.toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-600">X-axis</div>
                      </div>
                      <div className="text-center p-2 bg-slate-100 rounded">
                        <div className="font-mono font-bold" aria-label={`Y-axis: ${accelerometer.y?.toFixed(2)}`}>
                          {accelerometer.y?.toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-600">Y-axis</div>
                      </div>
                      <div className="text-center p-2 bg-slate-100 rounded">
                        <div className="font-mono font-bold" aria-label={`Z-axis: ${accelerometer.z?.toFixed(2)}`}>
                          {accelerometer.z?.toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-600">Z-axis</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                        fallDetected ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${fallDetected ? "bg-red-500" : "bg-green-500"}`}
                        aria-hidden="true"
                      ></div>
                      {fallDetected ? "Alert Active" : "Normal Activity"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </main>

          {/* Footer - Summary and Controls */}
          <footer className="bg-white rounded-lg shadow-sm p-6" role="contentinfo">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Latest Values */}
              <section aria-labelledby="latest-values-heading">
                <h2 id="latest-values-heading" className="font-semibold text-slate-900 mb-4">
                  Latest Values
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div
                      className="text-2xl font-bold text-red-600"
                      aria-label={`Heart rate: ${Math.round(heartRate)} BPM`}
                    >
                      {Math.round(heartRate)}
                    </div>
                    <div className="text-sm text-slate-600">HR (BPM)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600" aria-label={`SpO2: ${Math.round(spO2)} percent`}>
                      {Math.round(spO2)}%
                    </div>
                    <div className="text-sm text-slate-600">SpO₂</div>
                  </div>
                  <div className="text-center">
                    <div
                      className="text-2xl font-bold text-orange-600"
                      aria-label={`Body temperature: ${bodyTemp.toFixed(1)} degrees Fahrenheit`}
                    >
                      {bodyTemp.toFixed(1)}°F
                    </div>
                    <div className="text-sm text-slate-600">
                      <Thermometer className="h-4 w-4 inline mr-1" aria-hidden="true" />
                      Temp
                    </div>
                  </div>
                </div>
              </section>

              <Separator orientation="vertical" className="hidden lg:block" />

              {/* Controls */}
              <section aria-labelledby="controls-heading">
                <h2 id="controls-heading" className="font-semibold text-slate-900 mb-4">
                  Controls
                </h2>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setCurrentPage("history")}
                    aria-label="View patient history"
                  >
                    <History className="h-4 w-4 mr-2" aria-hidden="true" />
                    View History
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" aria-label="Export data">
                    Export Data
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setCurrentPage("settings")}
                    aria-label="Settings"
                  >
                    Settings
                  </Button>
                </div>
              </section>
            </div>
          </footer>
        </>
      )}

      {currentPage === "history" && (
        <HistoryPage
          selectedPatient={selectedPatient}
          onBack={() => setCurrentPage("dashboard")}
          onSwitchPatient={switchPatient}
          patients={patients}
          aggregates={vitalAggregate}
        />
      )}

      {currentPage === "settings" && <SettingsPage onBack={() => setCurrentPage("dashboard")} />}
    </div>
  )
}
