import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Define the database schema
// This tells Convex what our data looks like
export default defineSchema({
  // Table for meditation entries
  meditations: defineTable({
    date: v.string(), // Format: 'YYYY-MM-DD'
    person1: v.boolean(), // Did Michał meditate?
    person2: v.boolean(), // Did Magda meditate?
  })
    // Index allows fast lookup by date
    .index("by_date", ["date"]),
});
