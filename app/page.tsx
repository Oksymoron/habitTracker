'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from "convex/react"
import { api } from "../convex/_generated/api"
import type { Id } from "../convex/_generated/dataModel"
import HabitView from "./components/HabitView"
import CreateHabitModal from "./components/CreateHabitModal"
import UpdateBanner from "./components/UpdateBanner"

export default function Home() {
  // Fetch all habits from Convex
  const habits = useQuery(api.habits.getAll) ?? []

  // State for which habit tab is currently active
  const [activeHabitIndex, setActiveHabitIndex] = useState(0)

  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Mutation to initialize default habit (run once on first load)
  const initializeDefaultHabit = useMutation(api.habits.initializeDefaultHabit)

  // Mutation to delete a habit
  const deleteHabit = useMutation(api.habits.deleteHabit)

  // Initialize default habit if no habits exist yet
  // This runs once to migrate old meditation data to new structure
  useEffect(() => {
    if (habits.length === 0) {
      initializeDefaultHabit()
    }
  }, [habits.length, initializeDefaultHabit])

  // Get entries for the currently active habit
  const activeHabit = habits[activeHabitIndex]
  const entries = useQuery(
    api.habits.getEntries,
    activeHabit ? { habitId: activeHabit._id } : "skip"
  ) ?? []

  // Long-press handling for mobile delete
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const [longPressHabitId, setLongPressHabitId] = useState<Id<"habits"> | null>(null)

  // Handle long press on tab (for mobile delete)
  const handleTabTouchStart = (habitId: Id<"habits">, e: React.TouchEvent) => {
    // Start long-press timer (800ms)
    longPressTimer.current = setTimeout(() => {
      setLongPressHabitId(habitId)
    }, 800)
  }

  const handleTabTouchEnd = () => {
    // Cancel long-press if touch ends before timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  // Handle deleting a habit
  const handleDeleteHabit = async (habitId: Id<"habits">, e?: React.MouseEvent) => {
    if (e) e.stopPropagation() // Prevent tab selection when clicking delete

    if (!confirm('Are you sure you want to delete this habit? All entries will be lost.')) {
      setLongPressHabitId(null)
      return
    }

    await deleteHabit({ habitId })
    setLongPressHabitId(null)

    // Adjust active index if needed (if we deleted the active tab)
    if (activeHabitIndex >= habits.length - 1 && activeHabitIndex > 0) {
      setActiveHabitIndex(activeHabitIndex - 1)
    }
  }

  // Show loading state while habits are being fetched or initialized
  if (!activeHabit) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-stone-900">
        <div className="text-white text-xl">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
        body {
          font-family: 'Crimson Text', serif;
        }
        h1, h2, h3, h4 {
          font-family: 'Cinzel', serif;
        }
      `}</style>

      {/* Athens Background Image */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/athens-background.png)',
            backgroundPosition: 'center 30%'
          }}
        ></div>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen p-4 pb-20">
        <div className="max-w-2xl mx-auto">

          {/* Tab Navigation */}
          <div className="mb-4 pt-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {/* Tab buttons for each habit */}
              {habits.map((habit, index) => (
                <div key={habit._id} className="relative">
                  <button
                    onClick={() => setActiveHabitIndex(index)}
                    onTouchStart={(e) => handleTabTouchStart(habit._id, e)}
                    onTouchEnd={handleTabTouchEnd}
                    onTouchMove={handleTabTouchEnd}
                    className={`flex items-center gap-2 px-4 py-2 border-2 transition-all whitespace-nowrap relative group ${
                      index === activeHabitIndex
                        ? 'bg-amber-700 border-amber-500 text-white shadow-lg'
                        : 'bg-stone-800/60 border-stone-600 text-white/70 hover:bg-stone-700/60'
                    } ${longPressHabitId === habit._id ? 'animate-pulse' : ''}`}
                    style={index === activeHabitIndex ? { boxShadow: '0 4px 12px rgba(217, 119, 6, 0.4)' } : {}}
                  >
                    <span className="text-xl">{habit.icon}</span>
                    <span className="font-semibold tracking-wide">{habit.name.toUpperCase()}</span>

                    {/* Delete button (desktop hover only - only show if there's more than 1 habit) */}
                    {habits.length > 1 && (
                      <button
                        onClick={(e) => handleDeleteHabit(habit._id, e)}
                        className="ml-1 w-5 h-5 flex items-center justify-center rounded-full bg-red-600/80 hover:bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
                        title="Delete habit"
                      >
                        ×
                      </button>
                    )}
                  </button>

                </div>
              ))}

              {/* Add new habit button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-stone-800/60 border-2 border-stone-600 text-white/70 hover:bg-stone-700/60 hover:text-white transition-all whitespace-nowrap"
              >
                <span className="text-xl">+</span>
                <span className="font-semibold tracking-wide">NEW</span>
              </button>
            </div>
          </div>

          {/* Render the active habit view */}
          <HabitView habit={activeHabit} entries={entries} />
        </div>
      </div>

      {/* Create Habit Modal */}
      <CreateHabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Delete Confirmation Popup (Mobile) */}
      {longPressHabitId && habits.length > 1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-stone-900 border-4 border-red-600 rounded-none p-6 max-w-sm w-full"
            style={{ boxShadow: '0 8px 32px rgba(220, 38, 38, 0.6)' }}
          >
            <h3 className="text-xl font-bold text-white mb-4 text-center tracking-wide">
              DELETE HABIT?
            </h3>
            <p className="text-white/80 text-center mb-6">
              Are you sure? All entries will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setLongPressHabitId(null)}
                className="flex-1 px-4 py-3 bg-stone-700 hover:bg-stone-600 text-white font-semibold border-2 border-stone-500 transition-all"
              >
                CANCEL
              </button>
              <button
                onClick={() => handleDeleteHabit(longPressHabitId)}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold border-2 border-red-500 transition-all"
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PWA Update Banner */}
      <UpdateBanner />
    </main>
  )
}
