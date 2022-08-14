#!/usr/bin/env npx zx

// Solves this problem: https://www.eshmoneycoach.com/tutorials/3-steps-to-combine-ynab-categories/
// Loops through each tagged transaction and (upon user confirmation):
//     1) Changes the transaction category to the new category
//     2) Moves the $ amount from the old category to the new category

import dotenv from "dotenv";
import { API } from "ynab";
import { renderUSD, remainingRateLimitCalls } from "./util.mjs";

dotenv.config();

// env ACCESS_TOKEN required
// env BUDGET_ID is required
// --categoryId arg is required
// --transactionIds arg is required (comma separated)

const { ACCESS_TOKEN, BUDGET_ID } = process.env;
let { categoryId } = argv;
let transactionIds = argv.transactionIds ? argv.transactionIds.split(",") : argv.transactionId ? [argv.transactionId] : [];

if (!ACCESS_TOKEN || !BUDGET_ID) throw new Error("Missing ENV variables");

if (!categoryId) categoryId = await question("Category ID: ");
if (!transactionIds || transactionIds.length < 1) transactionIds = [await question("Transaction ID: ")];

const ynab = new API(ACCESS_TOKEN);

transactionIds.map(async (tId) => {
  // if any YNAB devs are reading this please add an endpoint to fetch multiple transactions by ID <3
  const { data, rateLimit } = await ynab.transactions.getTransactionById(BUDGET_ID, tId);
  const { transaction } = data;

  if (transaction.category_id === categoryId) {
    console.log(`Skipping transaction ${transaction.id}, already in the correct category`);
    return;
  }

  if (remainingRateLimitCalls(rateLimit) <= 5) {
    throw new Error("Out of rate limit calls for this hour, bailing before we get into a weird partial update state. Try again later");
  } else {
    console.log(`Rate limit status: used ${rateLimit} this hour`);
  }

  const month = transaction.date;
  const oldCategoryId = transaction.category_id;
  const newCategoryId = categoryId;

  const {
    data: { category: oldCategory }
  } = await ynab.categories.getMonthCategoryById(BUDGET_ID, month, oldCategoryId);
  const {
    data: { category: newCategory }
  } = await ynab.categories.getMonthCategoryById(BUDGET_ID, month, newCategoryId);

  console.log(`Transaction: ${chalk.yellow(transaction.date)} ${transaction.memo} [${transaction.account_name}]`);
  console.log(`Category: ${oldCategory.name} (${renderUSD(transaction.amount)}) -> ${newCategory.name} (${renderUSD(-transaction.amount)})`); // note amount is negative

  const c = await question("Execute? (y/n) ");
  if (!["y", "Y", "yes"].includes(c)) {
    console.log("SKIPPING");
    return;
  }

  // take the $ amount from the previous category
  await ynab.categories.updateMonthCategory(BUDGET_ID, month, oldCategoryId, {
    category: {
      budgeted: oldCategory.budgeted + transaction.amount // amount is negative so this is actually SUBTRACTING
    }
  });

  // give it to the new category
  await ynab.categories.updateMonthCategory(BUDGET_ID, month, newCategoryId, {
    category: {
      budgeted: newCategory.budgeted - transaction.amount // amount is negative so this is actually ADDING
    }
  });

  // update the transaction to be in the new category
  // (at some point I could probably move all of these to a single bulk op)
  await ynab.transactions.updateTransaction(BUDGET_ID, transaction.id, {
    transaction: {
      category_id: newCategoryId
    }
  });

  console.log("Successfully updated categories and transaction!");
});
