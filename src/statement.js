function statement(invoice, plays) {
  let totalAmount = 0;
  let volumeCredits = 0;
  const format = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format;

  let statement = {};

  statement.customer = invoice.customer;

  statement.plays = [];

  for (let perf of invoice.performances) {
    let playRecap = {};

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
    totalAmount += thisAmount;

    playRecap.name = play.name;
    playRecap.amount = format(thisAmount / 100);
    playRecap.audience = perf.audience;

    statement.plays.push(playRecap);
  }

  statement.volumeCredits = volumeCredits;
  statement.totalAmount = format(totalAmount / 100);

  return new TextPrinter().print(statement);
}

class TextPrinter {
  print(statement) {
    let str = "";
    str += `Statement for ${statement.customer}\n`;

    for (let play of statement.plays) {
      str += ` ${play.name}: ${play.amount} (${play.audience} seats)\n`;
    }

    str += `Amount owed is ${statement.totalAmount}\n`;
    str += `You earned ${statement.volumeCredits} credits\n`;

    return str;
  }
}

class Play {
  constructor(perf) {
    this.audience = perf.audience;
  }

  get volumeCredits() {
    return Math.max(this.audience - 30, 0);
  }

  get bigAudience() {
    return this.audience > this.bigAudienceThreshold;
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
    if (this.bigAudience) {
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
    if (this.bigAudience) {
      return this.amountWithBigAudience;
    }

    return this.baseAmount;
  }

  get volumeCredits() {
    return super.volumeCredits + Math.floor(this.audience / 5);
  }

  get amountWithBigAudience() {
    return (
      this.baseAmount +
      10_000 +
      500 * (this.audience - this.bigAudienceThreshold)
    );
  }
}

module.exports = statement;
