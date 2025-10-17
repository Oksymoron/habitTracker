import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Define the database schema
// This tells Convex what our data looks like
export default defineSchema({
  // Table for different habit types/tabs (Meditation, Exercise, etc.)
  // Each habit is a separate tab with its own tracking
  // Can have 1 person (solo) or 2 people (duo)
  habits: defineTable({
    name: v.string(), // Habit name (e.g., "Meditation", "Exercise")
    person1Name: v.string(), // Name of person 1 (required)
    person2Name: v.optional(v.string()), // Name of person 2 (optional - for solo habits)
    icon: v.string(), // Emoji icon for this habit (e.g., "🧘", "💪")
    order: v.number(), // Display order (lower = shown first)
    createdAt: v.number(), // Timestamp when habit was created
  })
    // Index for sorting habits by order
    .index("by_order", ["order"]),

  // Table for daily entries for each habit
  // Links to a specific habit and tracks both users' completion
  habitEntries: defineTable({
    habitId: v.id("habits"), // Which habit this entry belongs to
    date: v.string(), // Format: 'YYYY-MM-DD'
    person1: v.boolean(), // Did person1 complete this habit?
    person2: v.optional(v.boolean()), // Did person2 complete (undefined if solo habit)?
  })
    // Index for finding entries by habit and date
    .index("by_habit_and_date", ["habitId", "date"])
    // Index for finding all entries for a habit
    .index("by_habit", ["habitId"]),

  // LEGACY: Keep old meditations table for backward compatibility
  // We'll migrate this data to the new structure
  meditations: defineTable({
    date: v.string(), // Format: 'YYYY-MM-DD'
    person1: v.boolean(), // Did Michał meditate?
    person2: v.boolean(), // Did Magda meditate?
  })
    // Index allows fast lookup by date
    .index("by_date", ["date"]),
});
