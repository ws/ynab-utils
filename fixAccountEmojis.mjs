#!/usr/bin/env npx zx

// If an account name has an emoji, the format should be "{emoji(s)} {name}"

import dotenv from "dotenv";
import { API } from "ynab";
import { onlyEmoji, withoutEmoji } from "emoji-aware";

dotenv.config();
// env ACCESS_TOKEN required
// env BUDGET_ID is required

const { ACCESS_TOKEN, BUDGET_ID } = process.env;

const ynab = new API(ACCESS_TOKEN);
const l = chalk.blue("|");

const { data } = await ynab.accounts.getAccounts(BUDGET_ID);
const { accounts } = data;

console.log('YNAB currently does not have an API to update account name- instead you have to manually make the following updates:')

for (const account of accounts) {
  const emojis = onlyEmoji(account.name).join("");

  // skip accounts without emojis
  if (emojis.length >= 1) {
    const name = withoutEmoji(account.name).join("").trim();

    const newName = `${emojis} ${name}`; 

    if (account.name != newName) {
        console.log(`${l}${account.name}${l} to ${l}${newName}${l}`)
    //   const shouldContinue = await confirm(`Confirm you'd like to rename ${l}${account.name}${l} to ${l}${newName}${l}?`);
    //   if (shouldContinue) {
    //     // omg there's no account update API
    //     console.log("Success");
    //   } else {
    //     console.log("Skipping...");
    //   }
    }
  }
}

console.log("Done")