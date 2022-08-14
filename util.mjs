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
