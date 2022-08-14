#!/usr/bin/env npx zx

// Dump all your goals

import dotenv from "dotenv";
import { API } from "ynab";
import { humanReadableGoalType, asciiProgressBar } from "./util.mjs";

dotenv.config();

// env ACCESS_TOKEN required
// env BUDGET_ID is required

const { ACCESS_TOKEN, BUDGET_ID } = process.env;

const ynab = new API(ACCESS_TOKEN);

const { data } = await ynab.categories.getCategories(BUDGET_ID);
const categoryGroups = data.category_groups; // my brain thinks in camelcase

const goals = {};

categoryGroups.map((group) => {
  (group.categories || []).map((category) => {
    if (category.hidden || category.deleted) return; // we don't care about hidden or deleted categories
    if (category.goal_type === null) return; // we don't care about categories without goals

    goals[category.name] = {
      goalType: humanReadableGoalType(category.goal_type),
      progress: asciiProgressBar(category.goal_percentage_complete)
    };
  });
});

console.table(goals);
