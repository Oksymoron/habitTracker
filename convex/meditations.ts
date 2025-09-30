import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// QUERY: Get all meditation entries
// Queries fetch data from the database
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    // Return all meditation entries from the database
    return await ctx.db.query("meditations").collect();
  },
});

// MUTATION: Toggle meditation for a person on a specific date
// Mutations modify data in the database
export const toggleMeditation = mutation({
  args: {
    date: v.string(), // Date in 'YYYY-MM-DD' format
    person: v.union(v.literal("person1"), v.literal("person2")), // Which person
  },
  handler: async (ctx, args) => {
    // Check if entry already exists for this date
    const existing = await ctx.db
      .query("meditations")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();

    if (existing) {
      // Entry exists - toggle the person's meditation status
      await ctx.db.patch(existing._id, {
        [args.person]: !existing[args.person],
      });
    } else {
      // No entry for this date - create new one
      await ctx.db.insert("meditations", {
        date: args.date,
        person1: args.person === "person1", // true if person1, false otherwise
        person2: args.person === "person2", // true if person2, false otherwise
      });
    }
  },
});
