#!/usr/bin/env npx zx

// If a category name has an emoji, the format should be "{emoji(s)} {name}"

import dotenv from "dotenv";
import { API } from "ynab";
import { onlyEmoji, withoutEmoji } from "emoji-aware";
import { confirm } from "./util.mjs";

dotenv.config();
// env ACCESS_TOKEN required
// env BUDGET_ID is required

const { ACCESS_TOKEN, BUDGET_ID } = process.env;

const ynab = new API(ACCESS_TOKEN);
const l = chalk.blue("|");

const { data } = await ynab.categories.getCategories(BUDGET_ID);
const categoryGroups = data.category_groups; // my brain thinks in camelcase

const categories = {};

// https://twitter.com/dan_abramov/status/1338253118199508992
categoryGroups.map((group) => {
  (group.categories || []).map((c) => (categories[c.id] = { id: c.id, name: c.name, group: group.name }));
});

for (const category of Object.values(categories)) {
  const emojis = onlyEmoji(category.name).join("");

  // skip categories without emojis
  if (emojis.length >= 1) {
    const name = withoutEmoji(category.name).join("").trim();

    const newName = `${emojis} ${name}`;

    if (category.name != newName) {
      const shouldContinue = await confirm(`Confirm you'd like to rename ${l}${category.name}${l} to ${l}${newName}${l}?`);
      if (shouldContinue) {
        await ynab.categories.updateMonthCategory(BUDGET_ID, "current", category.id, {
          category: {
            name: newName
          }
        });
        console.log("Success");
      } else {
        console.log("Skipping...");
      }
    }
  }
}

console.log("Done");
