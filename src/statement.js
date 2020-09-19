function statement(invoice, plays) {
  let recap = new PerformanceRecap(invoice.performances, plays).generate();

  let statement = new Statement(invoice, recap).generate();

  return TextPrinter.printable(statement);
}

class TextPrinter {
  static printable(statement) {
    let new_line = "\n";

    let str = "";

    str += `Statement for ${statement.customer}`;
    str += new_line;

    for (let perf of statement.performances) {
      str += ` ${perf.name}: ${perf.amount} (${perf.audience} seats)`;
      str += new_line;
    }

    str += `Amount owed is ${statement.totalAmount}`;
    str += new_line;
    str += `You earned ${statement.volumeCredits} credits`;
    str += new_line;

    return str;
  }
}

class Statement {
  constructor(invoice, recap) {
    this.invoice = invoice;
    this.recap = recap;
  }

  generate() {
    return {
      customer: this.invoice.customer,
      volumeCredits: this.recap.volumeCredits,
      totalAmount: this.formatAmount(this.recap.totalAmount),
      performances: this.formatPerformances(this.recap.performances),
    };
  }

  formatAmount(amount) {
    return CurrencyFormatter.formatUSD(amount / 100);
  }

  formatPerformances(perfs) {
    return perfs.map((perf) => ({
      ...perf,
      amount: this.formatAmount(perf.amount),
    }));
  }
}

class PerformanceRecap {
  constructor(performances, plays) {
    this.performances = performances;
    this.plays = plays;

    this.individualRecap = this.individualRecap.bind(this);
  }

  generate() {
    let performances = this.performances.map(this.individualRecap);
    let totalAmount = this.getTotalAmountFrom(performances);
    let volumeCredits = this.getVolumeCreditsFrom(performances);

    return {
      totalAmount,
      volumeCredits,
      performances,
    };
  }

  getTotalAmountFrom(performances) {
    return performances.reduce((acc, perf) => acc + perf.amount, 0);
  }

  getVolumeCreditsFrom(performances) {
    return performances.reduce((acc, perf) => acc + perf.volumeCredits, 0);
  }

  individualRecap(perf) {
    const play = this.plays[perf.playID];
    let Klass = PlayKlassForType(play.type);
    let Play = new Klass(perf);

    return {
      name: play.name,
      audience: perf.audience,
      amount: Play.amount,
      volumeCredits: Play.volumeCredits,
    };
  }
}

class CurrencyFormatter {
  static formatUSD(amount) {
    const format = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format;

    return format(amount);
  }
}

function PlayKlassForType(type) {
  let klass = {
    tragedy: TragedyPlay,
    comedy: ComedyPlay,
  }[type];

  if (!klass) {
    throw new Error("unknown type");
  }

  return klass;
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
