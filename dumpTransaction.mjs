#!/usr/bin/env npx zx

// Dump everything we know about a given transaction (helpful for finding subtransactions)

import dotenv from "dotenv";
import { API } from "ynab";

dotenv.config();

// env ACCESS_TOKEN required
// env BUDGET_ID is required
// --transactionId arg is required

const { ACCESS_TOKEN, BUDGET_ID } = process.env;
const { transactionId } = argv;

const ynab = new API(ACCESS_TOKEN);

const { data } = await ynab.transactions.getTransactionById(BUDGET_ID, transactionId);
const { transaction } = data;

console.log(transaction);
