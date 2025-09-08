"use client"

import { useState } from "react"

interface SettingsPageProps {
  onBack: () => void
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  // Alert Settings
  const [heartRateMin, setHeartRateMin] = useState(60)
  const [heartRateMax, setHeartRateMax] = useState(100)
  const [spO2Min, setSpO2Min] = useState(95)
  const [tempMax, setTempMax] = useState(99.5)
  const [fallDetection, setFallDetection] = useState(true)
  const [soundAlerts, setSoundAlerts] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(true)
  
  // Display Settings
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light')
  const [refreshRate, setRefreshRate] = useState(1000)
  const [chartDuration, setChartDuration] = useState(60)
  const [highContrast, setHighContrast] = useState(false)
  
  // System Settings
  const [autoBackup, setAutoBackup] = useState(true)
  const [dataRetention, setDataRetention] = useState(30)
  const [networkTimeout, setNetworkTimeout] = useState(5000)
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const handleSave = async () => {
    setSaveStatus('saving')
    setHasUnsavedChanges(false)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 3000)
  }

  const handleReset = () => {
    // Reset to defaults
    setHeartRateMin(60)
    setHeart
