'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export default function Home() {
  const entries = useQuery(api.meditations.getAll) ?? [];

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => console.log("[PWA] Service Worker registered:", registration),
          (error) => console.log("[PWA] Service Worker registration failed:", error)
        );
      });
    }
  }, []);

  const toggleMeditation = useMutation(api.meditations.toggleMeditation);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [celebrating, setCelebrating] = useState<'person1' | 'person2' | null>(null)

  // Collection of Stoic and Cynic philosophy quotes
  const quotes = [
    // Marcus Aurelius - Meditations
    { text: "You have power over your mind — not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
    { text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius" },
    { text: "Dwell on the beauty of life. Watch the stars, and see yourself running with them.", author: "Marcus Aurelius" },
    { text: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius" },
    { text: "The best revenge is to be unlike him who performed the injury.", author: "Marcus Aurelius" },
    { text: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.", author: "Marcus Aurelius" },
    { text: "If you are distressed by anything external, the pain is not due to the thing itself, but to your estimate of it.", author: "Marcus Aurelius" },
    { text: "When you arise in the morning, think of what a precious privilege it is to be alive.", author: "Marcus Aurelius" },
    { text: "Confine yourself to the present.", author: "Marcus Aurelius" },
    { text: "Everything we hear is an opinion, not a fact. Everything we see is a perspective, not the truth.", author: "Marcus Aurelius" },

    // Seneca - Letters and Essays
    { text: "We suffer more often in imagination than in reality.", author: "Seneca" },
    { text: "Luck is what happens when preparation meets opportunity.", author: "Seneca" },
    { text: "It is not the man who has too little, but the man who craves more, that is poor.", author: "Seneca" },
    { text: "Difficulties strengthen the mind, as labor does the body.", author: "Seneca" },
    { text: "As long as you live, keep learning how to live.", author: "Seneca" },
    { text: "While we wait for life, life passes.", author: "Seneca" },
    { text: "True happiness is to enjoy the present, without anxious dependence upon the future.", author: "Seneca" },
    { text: "He who is brave is free.", author: "Seneca" },
    { text: "Life is long if you know how to use it.", author: "Seneca" },
    { text: "Begin at once to live, and count each separate day as a separate life.", author: "Seneca" },

    // Diogenes of Sinope - Cynic wisdom
    { text: "The foundation of every state is the education of its youth.", author: "Diogenes" },
    { text: "I am a citizen of the world.", author: "Diogenes" },
    { text: "The sun too penetrates into privies, but is not polluted by them.", author: "Diogenes" },
    { text: "Why not whip the teacher when the pupil misbehaves?", author: "Diogenes" },
    { text: "It is the privilege of the gods to want nothing, and of godlike men to want little.", author: "Diogenes" },
    { text: "I am looking for an honest man.", author: "Diogenes" },
    { text: "The mob is the mother of tyrants.", author: "Diogenes" },
    { text: "Dogs and philosophers do the greatest good and get the fewest rewards.", author: "Diogenes" }
  ]

  // Select a random quote on component mount (happens once per page load)
  const [randomQuote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)])

  const today = new Date().toISOString().split('T')[0]
  const todayEntry = entries.find(entry => entry.date === today)

  const handleMeditation = async (person: 'person1' | 'person2') => {
    const wasCompleted = todayEntry?.[person]
    await toggleMeditation({ date: today, person: person });
    if (!wasCompleted) {
      setCelebrating(person)
      setTimeout(() => setCelebrating(null), 1000)
    }
  }

  const generateMonthHeatmap = (person: 'person1' | 'person2') => {
    const year = selectedYear
    const month = selectedMonth
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const entry = entries.find(e => e.date === date)
      days.push({ day, meditated: entry ? entry[person] : false })
    }
    return days
  }

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

          {/* Header */}
          <div className="text-center mb-6 pt-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-wide drop-shadow-lg">
              MEDITATIONS
            </h1>
            <p className="text-xs sm:text-sm text-white/90 italic max-w-md mx-auto leading-relaxed drop-shadow">
              "{randomQuote.text}"<br className="sm:hidden"/> — {randomQuote.author}
            </p>
          </div>

          {/* Today's Practice Cards */}
          <div className="space-y-4 mb-6">
            {/* Michał */}
            <div className="relative">
              <button
                onClick={() => handleMeditation('person1')}
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
                        MICHAŁ
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
                    <div className={`text-2xl ${michalStreak > 0 ? '' : 'opacity-40'}`}>🔥</div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        todayEntry?.person1 ? 'text-white' : 'text-white drop-shadow'
                      }`}>
                        {michalStreak}
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

            {/* Magda */}
            <div className="relative">
              <button
                onClick={() => handleMeditation('person2')}
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
                        MAGDA
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
                    <div className={`text-2xl ${magdaStreak > 0 ? '' : 'opacity-40'}`}>🔥</div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        todayEntry?.person2 ? 'text-white' : 'text-white drop-shadow'
                      }`}>
                        {magdaStreak}
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
          </div>

          {/* Month Selector */}
          <div className="bg-stone-800/60 backdrop-blur-sm border-4 border-stone-600 rounded-none p-3 mb-4"
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

          {/* Monthly Heatmaps */}
          <div className="space-y-4">
            {/* Michał's Heatmap */}
            <div className="bg-stone-800/60 backdrop-blur-sm border-4 border-stone-600 rounded-none p-4"
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏛️</span>
                  <h3 className="text-lg font-semibold text-white drop-shadow tracking-wide">MICHAŁ</h3>
                </div>
                <div className="text-2xl font-bold text-amber-300 drop-shadow">
                  {generateMonthHeatmap('person1').filter(d => d.meditated).length}
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {generateMonthHeatmap('person1').map(({ day, meditated }) => (
                  <div
                    key={day}
                    className={`aspect-square rounded-none flex items-center justify-center text-xs font-bold transition-all border-2 ${
                      meditated
                        ? 'bg-amber-700 border-amber-500 text-white shadow-lg'
                        : 'bg-stone-700/40 border-stone-600 text-white/50'
                    }`}
                    style={meditated ? { boxShadow: '0 2px 8px rgba(217, 119, 6, 0.4)' } : {}}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {/* Magda's Heatmap */}
            <div className="bg-stone-800/60 backdrop-blur-sm border-4 border-stone-600 rounded-none p-4"
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏺</span>
                  <h3 className="text-lg font-semibold text-white drop-shadow tracking-wide">MAGDA</h3>
                </div>
                <div className="text-2xl font-bold text-rose-300 drop-shadow">
                  {generateMonthHeatmap('person2').filter(d => d.meditated).length}
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {generateMonthHeatmap('person2').map(({ day, meditated }) => (
                  <div
                    key={day}
                    className={`aspect-square rounded-none flex items-center justify-center text-xs font-bold transition-all border-2 ${
                      meditated
                        ? 'bg-rose-800 border-rose-600 text-white shadow-lg'
                        : 'bg-stone-700/40 border-stone-600 text-white/50'
                    }`}
                    style={meditated ? { boxShadow: '0 2px 8px rgba(190, 18, 60, 0.4)' } : {}}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Quote */}
          <div className="mt-6 text-center text-xs text-white/80 italic pb-4 drop-shadow">
            <p>"{randomQuote.text}" — {randomQuote.author}</p>
          </div>
        </div>
      </div>
    </main>
  )
}
