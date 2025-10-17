import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// QUERY: Get all habits sorted by order
// Returns all habit tabs in the order they should be displayed
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    // Fetch all habits and sort by order field (ascending)
    return await ctx.db
      .query("habits")
      .withIndex("by_order")
      .collect();
  },
});

// QUERY: Get all entries for a specific habit
// Used to display the heatmap and calculate streaks for one habit
export const getEntries = query({
  args: {
    habitId: v.id("habits"), // Which habit's entries to fetch
  },
  handler: async (ctx, args) => {
    // Fetch all entries for this habit
    return await ctx.db
      .query("habitEntries")
      .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
      .collect();
  },
});

// MUTATION: Create a new habit tab
// Creates a new habit with 1 or 2 people
export const create = mutation({
  args: {
    name: v.string(), // Habit name (e.g., "Exercise")
    person1Name: v.string(), // Name for person 1 (required)
    person2Name: v.optional(v.string()), // Name for person 2 (optional - leave empty for solo)
    icon: v.string(), // Emoji icon
  },
  handler: async (ctx, args) => {
    // Find the highest order number to put new habit at the end
    const existingHabits = await ctx.db
      .query("habits")
      .withIndex("by_order")
      .collect();

    // New habit gets order = max existing order + 1 (or 0 if no habits exist)
    const maxOrder = existingHabits.length > 0
      ? Math.max(...existingHabits.map(h => h.order))
      : -1;

    // Insert the new habit
    const habitId = await ctx.db.insert("habits", {
      name: args.name,
      person1Name: args.person1Name,
      person2Name: args.person2Name, // undefined if solo habit
      icon: args.icon,
      order: maxOrder + 1,
      createdAt: Date.now(),
    });

    return habitId;
  },
});

// MUTATION: Toggle habit completion for a person on a specific date
// Works with person1 or person2
export const toggleEntry = mutation({
  args: {
    habitId: v.id("habits"), // Which habit
    date: v.string(), // Date in 'YYYY-MM-DD' format
    person: v.union(v.literal("person1"), v.literal("person2")), // Which person
  },
  handler: async (ctx, args) => {
    // Check if entry already exists for this habit and date
    const existing = await ctx.db
      .query("habitEntries")
      .withIndex("by_habit_and_date", (q) =>
        q.eq("habitId", args.habitId).eq("date", args.date)
      )
      .first();

    if (existing) {
      // Entry exists - toggle the person's completion status
      await ctx.db.patch(existing._id, {
        [args.person]: !existing[args.person],
      });
    } else {
      // No entry for this date - create new one
      await ctx.db.insert("habitEntries", {
        habitId: args.habitId,
        date: args.date,
        person1: args.person === "person1",
        person2: args.person === "person2" ? true : undefined,
      });
    }
  },
});

// MUTATION: Delete a habit and all its entries
// Use with caution - this is permanent!
export const deleteHabit = mutation({
  args: {
    habitId: v.id("habits"),
  },
  handler: async (ctx, args) => {
    // First, delete all entries for this habit
    const entries = await ctx.db
      .query("habitEntries")
      .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
      .collect();

    for (const entry of entries) {
      await ctx.db.delete(entry._id);
    }

    // Then delete the habit itself
    await ctx.db.delete(args.habitId);
  },
});

// MUTATION: Initialize default "Meditation" habit with migrated data
// This should be run once to migrate from old schema to new one
export const initializeDefaultHabit = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if we already have habits (to avoid duplicate initialization)
    const existingHabits = await ctx.db.query("habits").collect();
    if (existingHabits.length > 0) {
      return { message: "Habits already initialized" };
    }

    // Create the default "Meditation" habit with 2 people
    const meditationHabitId = await ctx.db.insert("habits", {
      name: "Meditation",
      person1Name: "Michał",
      person2Name: "Magda",
      icon: "🧘",
      order: 0,
      createdAt: Date.now(),
    });

    // Migrate all old meditation entries to new habitEntries table
    const oldEntries = await ctx.db.query("meditations").collect();

    for (const oldEntry of oldEntries) {
      await ctx.db.insert("habitEntries", {
        habitId: meditationHabitId,
        date: oldEntry.date,
        person1: oldEntry.person1,
        person2: oldEntry.person2,
      });
    }

    return {
      message: "Default habit initialized",
      habitId: meditationHabitId,
      migratedEntries: oldEntries.length
    };
  },
});
