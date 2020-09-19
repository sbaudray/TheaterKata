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
        thisAmount = Play.amount;
        break;
      case "comedy":
        Play = new ComedyPlay(perf);
        thisAmount = Play.amount;
        break;
      default:
        throw new Error(`unknown type: ${play.type}`);
    }
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

// volumeCredits += Math.max(perf.audience - 30, 0);
// // add extra credit for every ten comedy attendees
// if ("comedy" === play.type) volumeCredits += Math.floor(perf.audience / 5);
class TragedyPlay {
  constructor(perf) {
    this.bigAudienceThreshold = 30;

    this.audience = perf.audience;
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

  get volumeCredits() {
    return Math.max(this.audience - 30, 0);
  }
}

class ComedyPlay {
  constructor(perf) {
    this.bigAudienceThreshold = 20;

    this.audience = perf.audience;
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
    return this.baseVolumeCredits + Math.floor(this.audience / 5);
  }

  get baseVolumeCredits() {
    return Math.max(this.audience - 30, 0);
  }

  get amountWithBigAudience() {
    return this.baseAmount + 10000 + 500 * (this.audience - 20);
  }
}

module.exports = statement;
