function statement(invoice, plays) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `Statement for ${invoice.customer}\n`;
  const format = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format;

  for (let perf of invoice.performances) {
    const play = plays[perf.playID];
    let Play;
    let thisAmount = 0;
    switch (play.type) {
      case "tragedy":
        Play = new TragedyPlay(perf);
        break;
      case "comedy":
        Play = new ComedyPlay(perf);
        break;
      default:
        throw new Error(`unknown type: ${play.type}`);
    }

    thisAmount = Play.amount;
    volumeCredits += Play.volumeCredits;
    // print line for this order
    result += ` ${play.name}: ${format(thisAmount / 100)} (${
      perf.audience
    } seats)\n`;
    totalAmount += thisAmount;
  }
  result += `Amount owed is ${format(totalAmount / 100)}\n`;
  result += `You earned ${volumeCredits} credits\n`;
  return result;
}

class Play {
  constructor(perf) {
    this.audience = perf.audience;
  }

  get volumeCredits() {
    return Math.max(this.audience - 30, 0);
  }
}

class TragedyPlay extends Play {
  constructor(perf) {
    super(perf);
    this.bigAudienceThreshold = 30;
  }

  get baseAmount() {
    return 40_000;
  }

  get amount() {
    if (this.audience > this.bigAudienceThreshold) {
      return this.amountWithBigAudience;
    }

    return this.baseAmount;
  }

  get amountWithBigAudience() {
    return this.baseAmount + 1000 * (this.audience - this.bigAudienceThreshold);
  }
}

class ComedyPlay extends Play {
  constructor(perf) {
    super(perf);
    this.bigAudienceThreshold = 20;
  }

  get baseAmount() {
    return 30_000 + 300 * this.audience;
  }

  get amount() {
    if (this.audience > this.bigAudienceThreshold) {
      return this.amountWithBigAudience;
    }

    return this.baseAmount;
  }

  get volumeCredits() {
    return super.volumeCredits + Math.floor(this.audience / 5);
  }

  get amountWithBigAudience() {
    return this.baseAmount + 10000 + 500 * (this.audience - 20);
  }
}

module.exports = statement;
