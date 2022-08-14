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
// todo: run it through a regex before assuming it's in the correct shape
// https://api.youneedabudget.com/#rate-limiting
export const remainingRateLimitCalls = (rateLimit) => {
  const used = parseInt(rateLimit.split("/")[0]);
  const remaining = parseInt(rateLimit.split("/")[1]);
  return remaining - used;
};
