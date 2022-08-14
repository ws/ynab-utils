import { question } from "zx";

export const renderUSD = (milliunits) => {
  const units = milliunits / 1000;

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  });

  if (milliunits < 0) {
    return chalk.red(`-${formatter.format(-units)}`);
  }
  return chalk.green(`+${formatter.format(units)}`);
};

// parse a X-Rate-Limit response
// https://api.youneedabudget.com/#rate-limiting
export const remainingRateLimitCalls = (rateLimit) => {
  const m = rateLimit.match(/([0-9]{1,3})\/([0-9]{1,3})/);
  if (!m) return 0;
  const used = parseInt(m[1]);
  const remaining = parseInt(m[2]);
  return remaining - used;
};

export const confirm = async (prompt) => {
  const c = await question(`${prompt} (y/n) `, { choices: ["y", "n"] });
  return ["y", "yes"].includes((c || "").trim().toLowerCase());
};
