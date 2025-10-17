'use client'

import { useState } from 'react'
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"

interface HabitEntry {
  _id: Id<"habitEntries">
  habitId: Id<"habits">
  date: string
  person1: boolean
  person2?: boolean
}

interface Habit {
  _id: Id<"habits">
  name: string
  person1Name: string
  person2Name?: string
  icon: string
}

interface EditEntriesModalProps {
  isOpen: boolean
  onClose: () => void
  habit: Habit
  entries: HabitEntry[]
}

export default function EditEntriesModal({ isOpen, onClose, habit, entries }: EditEntriesModalProps) {
  const isSolo = !habit.person2Name

  // State for selected month/year to edit
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Convex mutation to toggle entries
  const toggleEntry = useMutation(api.habits.toggleEntry)

  if (!isOpen) return null

  // Generate calendar for selected month
  const generateMonthDays = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
    const days = []

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const entry = entries.find(e => e.date === date)
      days.push({
        day,
        date,
        person1: entry?.person1 || false,
        person2: entry?.person2 || false
      })
    }

    return days
  }

  // Handle toggling a day's completion
  const handleToggleDay = async (date: string, person: 'person1' | 'person2') => {
    await toggleEntry({
      habitId: habit._id,
      date,
      person
    })
  }

  // Navigate between months
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

  const days = generateMonthDays()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-stone-900 border-4 border-stone-600 rounded-none p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white tracking-wide">
            EDIT ENTRIES - {habit.icon} {habit.name.toUpperCase()}
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Month Selector */}
        <div className="bg-stone-800/60 backdrop-blur-sm border-2 border-stone-600 rounded-none p-3 mb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => changeMonth('prev')}
              className="p-2 rounded-none bg-stone-700/60 hover:bg-stone-600/60 text-white transition-all border-2 border-stone-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="text-lg font-semibold text-white tracking-wider">
              {monthNames[selectedMonth]} {selectedYear}
            </div>

            <button
              onClick={() => changeMonth('next')}
              className="p-2 rounded-none bg-stone-700/60 hover:bg-stone-600/60 text-white transition-all border-2 border-stone-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-6">
          {/* Person 1 Calendar */}
          <div className="bg-stone-800/60 backdrop-blur-sm border-2 border-stone-600 rounded-none p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🏛️</span>
              <h3 className="text-lg font-semibold text-white tracking-wide">
                {habit.person1Name.toUpperCase()}
              </h3>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {days.map(({ day, date, person1 }) => (
                <button
                  key={`p1-${day}`}
                  onClick={() => handleToggleDay(date, 'person1')}
                  className={`aspect-square rounded-none flex items-center justify-center text-sm font-bold transition-all border-2 ${
                    person1
                      ? 'bg-amber-700 border-amber-500 text-white shadow-lg hover:bg-amber-600'
                      : 'bg-stone-700/40 border-stone-600 text-white/50 hover:bg-stone-600/40'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Person 2 Calendar (only for duo habits) */}
          {!isSolo && (
            <div className="bg-stone-800/60 backdrop-blur-sm border-2 border-stone-600 rounded-none p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🏺</span>
                <h3 className="text-lg font-semibold text-white tracking-wide">
                  {habit.person2Name?.toUpperCase()}
                </h3>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {days.map(({ day, date, person2 }) => (
                  <button
                    key={`p2-${day}`}
                    onClick={() => handleToggleDay(date, 'person2')}
                    className={`aspect-square rounded-none flex items-center justify-center text-sm font-bold transition-all border-2 ${
                      person2
                        ? 'bg-rose-800 border-rose-600 text-white shadow-lg hover:bg-rose-700'
                        : 'bg-stone-700/40 border-stone-600 text-white/50 hover:bg-stone-600/40'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-700 hover:bg-amber-600 text-white font-semibold border-2 border-amber-500 transition-all"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  )
}
