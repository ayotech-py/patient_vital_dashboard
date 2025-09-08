"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Calendar,
  Download,
  Filter,
  Heart,
  Activity,
  Thermometer,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  User,
} from "lucide-react"

interface Patient {
  id: string
  name: string
  age: number
  room: string
  condition: string
}

interface HistoryPageProps {
  selectedPatient: Patient
  onBack: () => void
  onSwitchPatient: (patient: Patient) => void
  patients: Patient[]
}

// Sample historical data
const generateHistoricalData = () => {
  const data = []
  const now = new Date()

  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000) // Last 24 hours
    data.push({
      timestamp: time,
      heartRate: 70 + Math.sin(i * 0.5) * 15 + Math.random() * 10,
      spO2: 97 + Math.sin(i * 0.3) * 2 + Math.random() * 2,
      temperature: 98.6 + Math.sin(i * 0.2) * 0.8 + Math.random() * 0.4,
      riskLevel: Math.random() > 0.8 ? "High" : Math.random() > 0.6 ? "Moderate" : "Low",
      alerts: Math.random() > 0.9 ? ["Fall detected"] : Math.random() > 0.95 ? ["High heart rate"] : [],
    })
  }
  return data
}

const VitalTrendCard = ({
  title,
  icon: Icon,
  currentValue,
  previousValue,
  unit,
  color,
}: {
  title: string
  icon: any
  currentValue: number
  previousValue: number
  unit: string
  color: string
}) => {
  const change = currentValue - previousValue
  const changePercent = ((change / previousValue) * 100).toFixed(1)
  const isPositive = change > 0
  const isNeutral = Math.abs(change) < 0.1

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className={`h-4 w-4 ${color}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">
            {currentValue.toFixed(1)}
            {unit}
          </div>
          <div className="flex items-center gap-1 text-sm">
            {isNeutral ? (
              <Minus className="h-3 w-3 text-slate-400" />
            ) : isPositive ? (
              <TrendingUp className="h-3 w-3 text-red-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-green-500" />
            )}
            <span
              className={`text-xs ${isNeutral ? "text-slate-500" : isPositive ? "text-red-600" : "text-green-600"}`}
            >
              {isNeutral ? "No change" : `${isPositive ? "+" : ""}${changePercent}%`}
            </span>
            <span className="text-xs text-slate-500">vs 24h ago</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function HistoryPage({ selectedPatient, onBack, onSwitchPatient, patients }: HistoryPageProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<"24h" | "7d" | "30d">("24h")
  const [selectedVital, setSelectedVital] = useState<"all" | "hr" | "spo2" | "temp">("all")

  const historicalData = generateHistoricalData()
  const currentData = historicalData[historicalData.length - 1]
  const previousData = historicalData[0]

  const criticalEvents = historicalData.filter((d) => d.alerts.length > 0 || d.riskLevel === "High")

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      {/* Header */}
      <header className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Patient History</h1>
              <p className="text-sm text-slate-600">
                {selectedPatient.name} • {selectedPatient.id} • Room {selectedPatient.room}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Time Range and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Time Range:</span>
            <div className="flex gap-1">
              {(["24h", "7d", "30d"] as const).map((range) => (
                <Button
                  key={range}
                  variant={selectedTimeRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeRange(range)}
                  className="text-xs"
                >
                  {range === "24h" ? "Last 24 Hours" : range === "7d" ? "Last 7 Days" : "Last 30 Days"}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Filter:</span>
            <select
              value={selectedVital}
              onChange={(e) => setSelectedVital(e.target.value as any)}
              className="text-sm border border-slate-200 rounded-md px-2 py-1"
            >
              <option value="all">All Vitals</option>
              <option value="hr">Heart Rate</option>
              <option value="spo2">SpO₂</option>
              <option value="temp">Temperature</option>
            </select>

            <Button variant="outline" size="sm" className="ml-2 bg-transparent">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Vital Signs Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <VitalTrendCard
          title="Heart Rate"
          icon={Heart}
          currentValue={currentData.heartRate}
          previousValue={previousData.heartRate}
          unit=" BPM"
          color="text-red-500"
        />
        <VitalTrendCard
          title="SpO₂"
          icon={Activity}
          currentValue={currentData.spO2}
          previousValue={previousData.spO2}
          unit="%"
          color="text-blue-500"
        />
        <VitalTrendCard
          title="Temperature"
          icon={Thermometer}
          currentValue={currentData.temperature}
          previousValue={previousData.temperature}
          unit="°F"
          color="text-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Historical Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Vital Signs Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Historical chart visualization</p>
                  <p className="text-xs">Chart component will be integrated here</p>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Heart Rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>SpO₂</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Temperature</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Critical Events & Alerts */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Critical Events ({criticalEvents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {criticalEvents.length === 0 ? (
                  <div className="text-center text-slate-500 py-4">
                    <AlertTriangle className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No critical events</p>
                  </div>
                ) : (
                  criticalEvents.slice(0, 10).map((event, index) => (
                    <div key={index} className="border-l-4 border-red-500 pl-3 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="destructive" className="text-xs">
                          {event.riskLevel}
                        </Badge>
                        <span className="text-xs text-slate-500">{event.timestamp.toLocaleTimeString()}</span>
                      </div>
                      {event.alerts.map((alert, alertIndex) => (
                        <p key={alertIndex} className="text-sm text-slate-700">
                          {alert}
                        </p>
                      ))}
                      <div className="text-xs text-slate-500 mt-1">
                        HR: {event.heartRate.toFixed(0)} | SpO₂: {event.spO2.toFixed(0)}% | Temp:{" "}
                        {event.temperature.toFixed(1)}°F
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">24h Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Avg Heart Rate:</span>
                  <span className="font-medium">
                    {(historicalData.reduce((sum, d) => sum + d.heartRate, 0) / historicalData.length).toFixed(0)} BPM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Avg SpO₂:</span>
                  <span className="font-medium">
                    {(historicalData.reduce((sum, d) => sum + d.spO2, 0) / historicalData.length).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Avg Temperature:</span>
                  <span className="font-medium">
                    {(historicalData.reduce((sum, d) => sum + d.temperature, 0) / historicalData.length).toFixed(1)}°F
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-slate-600">High Risk Periods:</span>
                  <span className="font-medium text-red-600">
                    {historicalData.filter((d) => d.riskLevel === "High").length}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Alerts:</span>
                  <span className="font-medium text-orange-600">
                    {historicalData.reduce((sum, d) => sum + d.alerts.length, 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
