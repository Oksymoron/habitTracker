'use client' // This makes it a Client Component - needed because we use React hooks

import { useState } from 'react'
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export default function Home() {
  // useQuery hook fetches data from Convex database
  // Automatically updates when database changes (real-time!)
  const entries = useQuery(api.meditations.getAll) ?? [];

  // useMutation hook creates a function to modify database
  const toggleMeditation = useMutation(api.meditations.toggleMeditation);

  // State for selected month/year for heatmap view
  // Initialize with current month and year
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()) // 0-11
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Get today's date in YYYY-MM-DD format for comparison
  const today = new Date().toISOString().split('T')[0]

  // Find today's entry (if it exists)
  const todayEntry = entries.find(entry => entry.date === today)

  // Function to handle when someone clicks "I meditated today"
  const handleMeditation = async (person: 'person1' | 'person2') => {
    // Call Convex mutation to toggle meditation in database
    // This will automatically sync across all devices!
    await toggleMeditation({
      date: today,
      person: person
    });
  }

  // Generate heatmap data for selected month
  const generateMonthHeatmap = (person: 'person1' | 'person2') => {
    // Use selected month and year instead of current
    const year = selectedYear
    const month = selectedMonth // 0-11

    // Get number of days in selected month
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Create array of all days in selected month
    const days = []
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const entry = entries.find(e => e.date === date)
      days.push({
        day,
        meditated: entry ? entry[person] : false
      })
    }

    return days
  }

  // Function to change selected month
  const changeMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      // Go to previous month
      if (selectedMonth === 0) {
        // If January, go to December of previous year
        setSelectedMonth(11)
        setSelectedYear(selectedYear - 1)
      } else {
        setSelectedMonth(selectedMonth - 1)
      }
    } else {
      // Go to next month
      if (selectedMonth === 11) {
        // If December, go to January of next year
        setSelectedMonth(0)
        setSelectedYear(selectedYear + 1)
      } else {
        setSelectedMonth(selectedMonth + 1)
      }
    }
  }

  // Get month name for display
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  const selectedMonthName = monthNames[selectedMonth]

  // Calculate current streak for a person
  // Streak = consecutive days of meditation up to today
  const calculateStreak = (person: 'person1' | 'person2') => {
    let streak = 0
    const today = new Date()

    // Start from today and go backwards
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i) // Go back i days
      const dateString = checkDate.toISOString().split('T')[0]

      // Find entry for this date
      const entry = entries.find(e => e.date === dateString)

      if (entry && entry[person]) {
        // Person meditated on this day
        streak++
      } else {
        // Person didn't meditate - streak is broken
        break
      }
    }

    return streak
  }

  // Get streak values for both people
  const michalStreak = calculateStreak('person1')
  const magdaStreak = calculateStreak('person2')

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          🧘‍♀️ Meditation Tracker
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Track your daily meditation practice together
        </p>

        {/* Today's Meditation Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Today</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Michał's Button */}
            <div className="relative">
              <button
                onClick={() => handleMeditation('person1')}
                className={`w-full p-6 rounded-lg font-semibold text-lg transition-all ${
                  todayEntry?.person1
                    ? 'bg-green-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-3xl mb-2">🧘‍♂️</div>
                Michał
                <div className="text-sm mt-1">
                  {todayEntry?.person1 ? '✓ Meditated today!' : 'Click when done'}
                </div>
              </button>
              {/* Streak Display - Duolingo style */}
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className={`text-2xl ${michalStreak > 0 ? 'animate-pulse' : ''}`}>
                  🔥
                </div>
                <div className="flex flex-col">
                  <span className={`text-2xl font-bold ${
                    michalStreak > 0 ? 'text-orange-500' : 'text-gray-400'
                  }`}>
                    {michalStreak}
                  </span>
                  <span className="text-xs text-gray-500 -mt-1">day streak</span>
                </div>
              </div>
            </div>

            {/* Magda's Button */}
            <div className="relative">
              <button
                onClick={() => handleMeditation('person2')}
                className={`w-full p-6 rounded-lg font-semibold text-lg transition-all ${
                  todayEntry?.person2
                    ? 'bg-green-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-3xl mb-2">🧘‍♀️</div>
                Magda
                <div className="text-sm mt-1">
                  {todayEntry?.person2 ? '✓ Meditated today!' : 'Click when done'}
                </div>
              </button>
              {/* Streak Display - Duolingo style */}
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className={`text-2xl ${magdaStreak > 0 ? 'animate-pulse' : ''}`}>
                  🔥
                </div>
                <div className="flex flex-col">
                  <span className={`text-2xl font-bold ${
                    magdaStreak > 0 ? 'text-orange-500' : 'text-gray-400'
                  }`}>
                    {magdaStreak}
                  </span>
                  <span className="text-xs text-gray-500 -mt-1">day streak</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Month Selector */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {/* Previous Month Button */}
            <button
              onClick={() => changeMonth('prev')}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Previous month"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Current Month Display */}
            <div className="text-xl font-semibold text-gray-800">
              {selectedMonthName} {selectedYear}
            </div>

            {/* Next Month Button */}
            <button
              onClick={() => changeMonth('next')}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Next month"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Monthly Heatmaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Michał's Heatmap */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                🧘‍♂️ Michał
              </h3>
              {/* Stats counter displayed inline */}
              <div className="text-2xl font-bold text-purple-600">
                {generateMonthHeatmap('person1').filter(d => d.meditated).length}
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {generateMonthHeatmap('person1').map(({ day, meditated }) => (
                <div
                  key={day}
                  className={`aspect-square rounded flex items-center justify-center text-sm font-medium ${
                    meditated
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                  title={`Day ${day}`}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Magda's Heatmap */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                🧘‍♀️ Magda
              </h3>
              {/* Stats counter displayed inline */}
              <div className="text-2xl font-bold text-blue-600">
                {generateMonthHeatmap('person2').filter(d => d.meditated).length}
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {generateMonthHeatmap('person2').map(({ day, meditated }) => (
                <div
                  key={day}
                  className={`aspect-square rounded flex items-center justify-center text-sm font-medium ${
                    meditated
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                  title={`Day ${day}`}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
