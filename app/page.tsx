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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // State for celebration animation
  const [celebrating, setCelebrating] = useState<'person1' | 'person2' | null>(null)

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]
  const todayEntry = entries.find(entry => entry.date === today)

  // Handle meditation toggle with celebration effect
  const handleMeditation = async (person: 'person1' | 'person2') => {
    const wasCompleted = todayEntry?.[person]

    await toggleMeditation({
      date: today,
      person: person
    });

    // Show celebration animation when marking as complete (not when unchecking)
    if (!wasCompleted) {
      setCelebrating(person)
      setTimeout(() => setCelebrating(null), 1000)
    }
  }

  // Generate heatmap data for selected month
  const generateMonthHeatmap = (person: 'person1' | 'person2') => {
    const year = selectedYear
    const month = selectedMonth
    const daysInMonth = new Date(year, month + 1, 0).getDate()

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

  // Change selected month
  const changeMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedMonth(11)
        setSelectedYear(selectedYear - 1)
      } else {
        setSelectedMonth(selectedMonth - 1)
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0)
        setSelectedYear(selectedYear + 1)
      } else {
        setSelectedMonth(selectedMonth + 1)
      }
    }
  }

  // Get month name
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  const selectedMonthName = monthNames[selectedMonth]

  // Calculate streak
  const calculateStreak = (person: 'person1' | 'person2') => {
    let streak = 0
    const today = new Date()

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dateString = checkDate.toISOString().split('T')[0]
      const entry = entries.find(e => e.date === dateString)

      if (entry && entry[person]) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  const michalStreak = calculateStreak('person1')
  const magdaStreak = calculateStreak('person2')

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Today's Meditation - Enhanced cards */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-orange-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Today's Practice</h2>
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Michał's Card */}
            <div className="relative group">
              <button
                onClick={() => handleMeditation('person1')}
                className={`w-full p-8 rounded-2xl font-medium text-lg transition-all duration-300 relative overflow-hidden ${
                  todayEntry?.person1
                    ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-2xl scale-[1.02] hover:scale-[1.03]'
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:from-orange-50 hover:to-amber-50 hover:shadow-lg border-2 border-gray-200 hover:border-orange-200'
                }`}
              >
                {/* Celebration sparkles */}
                {celebrating === 'person1' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-6xl animate-ping">✨</span>
                  </div>
                )}

                <div className="text-5xl mb-3">🧘‍♂️</div>
                <div className="text-2xl font-bold mb-2">Michał</div>
                <div className="text-sm opacity-90">
                  {todayEntry?.person1 ? '✓ Practice complete!' : 'Tap to log session'}
                </div>
              </button>

              {/* Streak Display */}
              <div className="mt-4 flex items-center justify-center gap-3 bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl p-3">
                <div className={`text-3xl ${michalStreak > 0 ? 'animate-pulse' : 'opacity-50'}`}>
                  🔥
                </div>
                <div className="flex flex-col">
                  <span className={`text-3xl font-bold ${
                    michalStreak > 0 ? 'text-orange-600' : 'text-gray-400'
                  }`}>
                    {michalStreak}
                  </span>
                  <span className="text-xs text-gray-600 font-medium -mt-1">
                    day streak
                  </span>
                </div>
              </div>
            </div>

            {/* Magda's Card */}
            <div className="relative group">
              <button
                onClick={() => handleMeditation('person2')}
                className={`w-full p-8 rounded-2xl font-medium text-lg transition-all duration-300 relative overflow-hidden ${
                  todayEntry?.person2
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-2xl scale-[1.02] hover:scale-[1.03]'
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:from-purple-50 hover:to-pink-50 hover:shadow-lg border-2 border-gray-200 hover:border-purple-200'
                }`}
              >
                {/* Celebration sparkles */}
                {celebrating === 'person2' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-6xl animate-ping">✨</span>
                  </div>
                )}

                <div className="text-5xl mb-3">🧘‍♀️</div>
                <div className="text-2xl font-bold mb-2">Magda</div>
                <div className="text-sm opacity-90">
                  {todayEntry?.person2 ? '✓ Practice complete!' : 'Tap to log session'}
                </div>
              </button>

              {/* Streak Display */}
              <div className="mt-4 flex items-center justify-center gap-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3">
                <div className={`text-3xl ${magdaStreak > 0 ? 'animate-pulse' : 'opacity-50'}`}>
                  🔥
                </div>
                <div className="flex flex-col">
                  <span className={`text-3xl font-bold ${
                    magdaStreak > 0 ? 'text-purple-600' : 'text-gray-400'
                  }`}>
                    {magdaStreak}
                  </span>
                  <span className="text-xs text-gray-600 font-medium -mt-1">
                    day streak
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Month Selector - Cleaner design */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-100 p-5 mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <button
              onClick={() => changeMonth('prev')}
              className="p-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 transition-all hover:scale-110"
              title="Previous month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="text-xl font-semibold text-gray-800">
              {selectedMonthName} {selectedYear}
            </div>

            <button
              onClick={() => changeMonth('next')}
              className="p-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 transition-all hover:scale-110"
              title="Next month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Monthly Heatmaps - Refined cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Michał's Heatmap */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧘‍♂️</span>
                <h3 className="text-xl font-semibold text-gray-800">Michał</h3>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {generateMonthHeatmap('person1').filter(d => d.meditated).length}
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {generateMonthHeatmap('person1').map(({ day, meditated }) => (
                <div
                  key={day}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm font-semibold transition-all ${
                    meditated
                      ? 'bg-gradient-to-br from-orange-400 to-amber-400 text-white shadow-md'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                  title={`Day ${day}`}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Magda's Heatmap */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧘‍♀️</span>
                <h3 className="text-xl font-semibold text-gray-800">Magda</h3>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {generateMonthHeatmap('person2').filter(d => d.meditated).length}
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {generateMonthHeatmap('person2').map(({ day, meditated }) => (
                <div
                  key={day}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm font-semibold transition-all ${
                    meditated
                      ? 'bg-gradient-to-br from-purple-400 to-pink-400 text-white shadow-md'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                  title={`Day ${day}`}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Synced in real-time across all devices ✨</p>
        </div>
      </div>
    </main>
  )
}
