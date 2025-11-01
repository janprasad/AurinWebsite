import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

// Example query - you can remove this if not needed
export const listNumbers = query({
  args: {
    count: v.number(),
  },
  returns: v.object({
    viewer: v.union(v.string(), v.null()),
    numbers: v.array(v.number()),
  }),
  handler: async (ctx, args) => {
    // This is a placeholder example - the "numbers" table doesn't exist in the schema
    // You can remove this function or update it to use an existing table
    return {
      viewer: (await ctx.auth.getUserIdentity())?.name ?? null,
      numbers: [],
    };
  },
});

// Example mutation - you can remove this if not needed
export const addNumber = mutation({
  args: {
    value: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // This is a placeholder example - the "numbers" table doesn't exist in the schema
    // You can remove this function or update it to use an existing table
    console.log("Example mutation called with value:", args.value);
    return null;
  },
});

// Example action - you can remove this if not needed
export const myAction = action({
  args: {
    first: v.number(),
    second: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    //// Use the browser-like `fetch` API to send HTTP requests.
    //// See https://docs.convex.dev/functions/actions#calling-third-party-apis-and-using-npm-packages.
    // const response = await ctx.fetch("https://api.thirdpartyservice.com");
    // const data = await response.json();

    //// Query data by running Convex queries.
    const data = await ctx.runQuery(api.myFunctions.listNumbers, {
      count: 10,
    });
    console.log(data);

    //// Write data by running Convex mutations.
    await ctx.runMutation(api.myFunctions.addNumber, {
      value: args.first,
    });
    return null;
  },
});
