#!/usr/bin/env npx zx

// Dump all the category names/ids

import dotenv from "dotenv";
import { API } from "ynab";

dotenv.config();

// env ACCESS_TOKEN required
// env BUDGET_ID is required

const { ACCESS_TOKEN, BUDGET_ID } = process.env;

const ynab = new API(ACCESS_TOKEN);

const { data } = await ynab.categories.getCategories(BUDGET_ID);
const categoryGroups = data.category_groups; // my brain thinks in camelcase

const categories = {};

// https://twitter.com/dan_abramov/status/1338253118199508992
categoryGroups.map((group) => {
	(group.categories || []).map((c) => (categories[c.id] = { name: c.name, group: group.name }));
});

console.table(categories);

