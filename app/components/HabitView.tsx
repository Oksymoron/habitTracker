'use client'

import { useState, useEffect } from 'react'
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"
import EditEntriesModal from "./EditEntriesModal"

// Stoic philosophy quotes for inspiration
const quotes = [
  { text: "You have power over your mind - not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { text: "He who fears death will never do anything worth of a man who is alive.", author: "Seneca" },
  { text: "The mind is the ruler of the soul. It should remain unstirred by agitations of the flesh.", author: "Marcus Aurelius" },
  { text: "It is not that we have a short time to live, but that we waste a lot of it.", author: "Seneca" },
  { text: "Poverty is not having too little, it is wanting more.", author: "Seneca" },
  { text: "The man who has anticipated the coming of troubles takes away their power when they arrive.", author: "Seneca" },
  { text: "I am not afraid of an army of lions led by a sheep; I am afraid of an army of sheep led by a lion.", author: "Alexander the Great" },
  { text: "What we do now echoes in eternity.", author: "Marcus Aurelius" },
  { text: "Man is not worried by real problems so much as by his imagined anxieties about real problems.", author: "Epictetus" },
  { text: "In the end, it's not the years in your life that count. It's the life in your years.", author: "Diogenes" }
]

// TypeScript interfaces for habit data
interface Habit {
  _id: Id<"habits">
  name: string
  person1Name: string
  person2Name?: string // Optional - only for duo habits
  icon: string
  order: number
  createdAt: number
}

interface HabitEntry {
  _id: Id<"habitEntries">
  habitId: Id<"habits">
  date: string
  person1: boolean
  person2?: boolean // Optional - undefined for solo habits
}

interface HabitViewProps {
  habit: Habit
  entries: HabitEntry[]
}

export default function HabitView({ habit, entries }: HabitViewProps) {
  // Determine if this is a solo habit (1 person) or duo habit (2 people)
  const isSolo = !habit.person2Name

  // State for month/year selection in heatmap
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // State for celebration animation when completing habit
  const [celebrating, setCelebrating] = useState<'person1' | 'person2' | null>(null)

  // State for edit entries modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Random quote selection (avoiding hydration mismatch)
  const [randomQuote, setRandomQuote] = useState(quotes[0])
  useEffect(() => {
    setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)])
  }, [])

  // Convex mutation to toggle habit completion
  const toggleEntry = useMutation(api.habits.toggleEntry)

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]
  const todayEntry = entries.find(entry => entry.date === today)

  // Handle toggling habit completion for a person
  const handleToggle = async (person: 'person1' | 'person2') => {
    const wasCompleted = person === 'person1' ? todayEntry?.person1 : todayEntry?.person2

    await toggleEntry({
      habitId: habit._id,
      date: today,
      person: person
    })

    // Show celebration animation if marking complete (not uncomplete)
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
      const completed = person === 'person1' ? entry?.person1 : entry?.person2
      days.push({ day, completed: completed || false })
    }

    return days
  }

  // Navigate between months in heatmap
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

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  const selectedMonthName = monthNames[selectedMonth]

  // Calculate current streak (consecutive days)
  const calculateStreak = (person: 'person1' | 'person2') => {
    let streak = 0
    const today = new Date()

    // Count backwards from today until we find a day without completion
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dateString = checkDate.toISOString().split('T')[0]
      const entry = entries.find(e => e.date === dateString)
      const completed = person === 'person1' ? entry?.person1 : entry?.person2

      if (completed) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  const person1Streak = calculateStreak('person1')
  const person2Streak = calculateStreak('person2')

  return (
    <>
      {/* Header with random quote */}
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-wide drop-shadow-lg">
          {habit.name.toUpperCase()}
        </h1>
        <p className="text-xs sm:text-sm text-white/90 italic max-w-md mx-auto leading-relaxed drop-shadow">
          "{randomQuote.text}"<br className="sm:hidden"/> — {randomQuote.author}
        </p>
      </div>

      {/* Today's Practice Cards */}
      <div className="space-y-4 mb-6">
        {/* Person 1 Card (Always shown) */}
        <div className="relative">
          <button
            onClick={() => handleToggle('person1')}
            className={`w-full p-6 rounded-none backdrop-blur-sm border-4 transition-all duration-300 relative overflow-hidden ${
              todayEntry?.person1
                ? 'bg-amber-800/80 border-amber-600 shadow-2xl'
                : 'bg-stone-800/60 border-stone-600 hover:bg-stone-700/60 active:bg-stone-600/60'
            }`}
            style={{
              boxShadow: todayEntry?.person1 ? '0 8px 32px rgba(217, 119, 6, 0.3), inset 0 2px 4px rgba(255,255,255,0.1)' : '0 4px 16px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.05)'
            }}
          >
            {celebrating === 'person1' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-6xl animate-ping">⚡</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🏛️</span>
                <div className="text-left">
                  <div className={`text-2xl font-bold tracking-wide ${
                    todayEntry?.person1 ? 'text-white' : 'text-white drop-shadow'
                  }`}>
                    {habit.person1Name.toUpperCase()}
                  </div>
                  <div className={`text-xs italic ${
                    todayEntry?.person1 ? 'text-amber-100' : 'text-white/80'
                  }`}>
                    {todayEntry?.person1 ? 'Virtue achieved' : 'Begin practice'}
                  </div>
                </div>
              </div>

              {/* Streak */}
              <div className="flex items-center gap-2">
                <div className={`text-2xl ${person1Streak > 0 ? '' : 'opacity-40'}`}>🔥</div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    todayEntry?.person1 ? 'text-white' : 'text-white drop-shadow'
                  }`}>
                    {person1Streak}
                  </div>
                  <div className={`text-[9px] uppercase tracking-wide ${
                    todayEntry?.person1 ? 'text-amber-100' : 'text-white/70'
                  }`}>
                    days
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Person 2 Card (Only shown for duo habits) */}
        {!isSolo && (
          <div className="relative">
            <button
              onClick={() => handleToggle('person2')}
              className={`w-full p-6 rounded-none backdrop-blur-sm border-4 transition-all duration-300 relative overflow-hidden ${
                todayEntry?.person2
                  ? 'bg-rose-900/80 border-rose-700 shadow-2xl'
                  : 'bg-stone-800/60 border-stone-600 hover:bg-stone-700/60 active:bg-stone-600/60'
              }`}
              style={{
                boxShadow: todayEntry?.person2 ? '0 8px 32px rgba(190, 18, 60, 0.3), inset 0 2px 4px rgba(255,255,255,0.1)' : '0 4px 16px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.05)'
              }}
            >
              {celebrating === 'person2' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-6xl animate-ping">⚡</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🏺</span>
                  <div className="text-left">
                    <div className={`text-2xl font-bold tracking-wide ${
                      todayEntry?.person2 ? 'text-white' : 'text-white drop-shadow'
                    }`}>
                      {habit.person2Name?.toUpperCase()}
                    </div>
                    <div className={`text-xs italic ${
                      todayEntry?.person2 ? 'text-rose-100' : 'text-white/80'
                    }`}>
                      {todayEntry?.person2 ? 'Virtue achieved' : 'Begin practice'}
                    </div>
                  </div>
                </div>

                {/* Streak */}
                <div className="flex items-center gap-2">
                  <div className={`text-2xl ${person2Streak > 0 ? '' : 'opacity-40'}`}>🔥</div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      todayEntry?.person2 ? 'text-white' : 'text-white drop-shadow'
                    }`}>
                      {person2Streak}
                    </div>
                    <div className={`text-[9px] uppercase tracking-wide ${
                      todayEntry?.person2 ? 'text-rose-100' : 'text-white/70'
                    }`}>
                      days
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Month Selector + Edit Button */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 bg-stone-800/60 backdrop-blur-sm border-4 border-stone-600 rounded-none p-3"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => changeMonth('prev')}
              className="p-2 rounded-none bg-stone-700/60 hover:bg-stone-600/60 active:bg-stone-500/60 text-white transition-all border-2 border-stone-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="text-lg font-semibold text-white drop-shadow tracking-wider">
              {selectedMonthName} {selectedYear}
            </div>

            <button
              onClick={() => changeMonth('next')}
              className="p-2 rounded-none bg-stone-700/60 hover:bg-stone-600/60 active:bg-stone-500/60 text-white transition-all border-2 border-stone-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Edit Past Entries Button */}
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="px-4 py-3 bg-stone-800/60 hover:bg-stone-700/60 border-4 border-stone-600 text-white font-semibold transition-all whitespace-nowrap"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.05)' }}
          title="Edit past entries"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>

      {/* Monthly Heatmaps */}
      <div className="space-y-4">
        {/* Person 1 Heatmap (Always shown) */}
        <div className="bg-stone-800/60 backdrop-blur-sm border-4 border-stone-600 rounded-none p-4"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏛️</span>
              <h3 className="text-lg font-semibold text-white drop-shadow tracking-wide">{habit.person1Name.toUpperCase()}</h3>
            </div>
            <div className="text-2xl font-bold text-amber-300 drop-shadow">
              {generateMonthHeatmap('person1').filter(d => d.completed).length}
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {generateMonthHeatmap('person1').map(({ day, completed }) => (
              <div
                key={day}
                className={`aspect-square rounded-none flex items-center justify-center text-xs font-bold transition-all border-2 ${
                  completed
                    ? 'bg-amber-700 border-amber-500 text-white shadow-lg'
                    : 'bg-stone-700/40 border-stone-600 text-white/50'
                }`}
                style={completed ? { boxShadow: '0 2px 8px rgba(217, 119, 6, 0.4)' } : {}}
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Person 2 Heatmap (Only shown for duo habits) */}
        {!isSolo && (
          <div className="bg-stone-800/60 backdrop-blur-sm border-4 border-stone-600 rounded-none p-4"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.05)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏺</span>
                <h3 className="text-lg font-semibold text-white drop-shadow tracking-wide">{habit.person2Name?.toUpperCase()}</h3>
              </div>
              <div className="text-2xl font-bold text-rose-300 drop-shadow">
                {generateMonthHeatmap('person2').filter(d => d.completed).length}
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {generateMonthHeatmap('person2').map(({ day, completed }) => (
                <div
                  key={day}
                  className={`aspect-square rounded-none flex items-center justify-center text-xs font-bold transition-all border-2 ${
                    completed
                      ? 'bg-rose-800 border-rose-600 text-white shadow-lg'
                      : 'bg-stone-700/40 border-stone-600 text-white/50'
                  }`}
                  style={completed ? { boxShadow: '0 2px 8px rgba(190, 18, 60, 0.4)' } : {}}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Quote */}
      <div className="mt-6 text-center text-xs text-white/80 italic pb-4 drop-shadow">
        <p>"{randomQuote.text}" — {randomQuote.author}</p>
      </div>

      {/* Edit Entries Modal */}
      <EditEntriesModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        habit={habit}
        entries={entries}
      />
    </>
  )
}
