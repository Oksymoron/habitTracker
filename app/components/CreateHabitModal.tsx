'use client'

import { useState } from 'react'
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"

type CreateHabitModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function CreateHabitModal({ isOpen, onClose }: CreateHabitModalProps) {
  const [habitName, setHabitName] = useState('')
  const [person1Name, setPerson1Name] = useState('')
  const [person2Name, setPerson2Name] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('💪')

  const createHabit = useMutation(api.habits.create)

  const availableIcons = ['🧘', '💪', '📚', '✍️', '🏃', '🎨', '🎵', '💻', '🥗', '💧', '😴', '🌅', '🧠', '🙏', '🎯']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!habitName.trim() || !person1Name.trim()) {
      alert('Please enter habit name and at least one person')
      return
    }

    try {
      await createHabit({
        name: habitName.trim(),
        person1Name: person1Name.trim(),
        person2Name: person2Name.trim() || undefined,
        icon: selectedIcon,
      })

      setHabitName('')
      setPerson1Name('')
      setPerson2Name('')
      setSelectedIcon('💪')
      onClose()
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to create habit')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-stone-800 border-4 border-stone-600 rounded-none p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white tracking-wide">NEW HABIT</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2 tracking-wide">HABIT NAME</label>
            <input type="text" value={habitName} onChange={(e) => setHabitName(e.target.value)} placeholder="e.g., Exercise" className="w-full px-4 py-3 bg-stone-700 border-2 border-stone-600 rounded-none text-white placeholder-white/40 focus:outline-none focus:border-amber-600" maxLength={30} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2 tracking-wide">PERSON 1</label>
            <input type="text" value={person1Name} onChange={(e) => setPerson1Name(e.target.value)} placeholder="Required" className="w-full px-4 py-3 bg-stone-700 border-2 border-stone-600 rounded-none text-white placeholder-white/40 focus:outline-none focus:border-amber-600" maxLength={20} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2 tracking-wide">PERSON 2 <span className="text-white/50 text-xs">(optional)</span></label>
            <input type="text" value={person2Name} onChange={(e) => setPerson2Name(e.target.value)} placeholder="Leave empty for solo" className="w-full px-4 py-3 bg-stone-700 border-2 border-stone-600 rounded-none text-white placeholder-white/40 focus:outline-none focus:border-rose-700" maxLength={20} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2 tracking-wide">ICON</label>
            <div className="grid grid-cols-5 gap-2">
              {availableIcons.map((icon) => (
                <button key={icon} type="button" onClick={() => setSelectedIcon(icon)} className={`aspect-square text-3xl flex items-center justify-center border-2 transition-all ${selectedIcon === icon ? 'bg-amber-700 border-amber-500 scale-110' : 'bg-stone-700 border-stone-600 hover:scale-105'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full py-3 bg-amber-700 hover:bg-amber-600 border-2 border-amber-500 text-white font-bold tracking-wider">
            CREATE HABIT
          </button>
        </form>
      </div>
    </div>
  )
}
