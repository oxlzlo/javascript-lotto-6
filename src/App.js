import { MissionUtils } from "@woowacourse/mission-utils";
import Lotto from "./Lotto.js";

class App {
  constructor() {
    this.lottos = [];
    this.lottoNumbers = [];
    this.prizeMoney = 0;
    this.purchaseAmount = 0;
    this.matchedCount = { 3: 0, 4: 0, 5: 0, '5B': 0, 6: 0 };
  }

  async play() {
    try {
      this.purchaseAmount = await this.#requestPurchaseAmount();
      this.generateLottos();
      const winningNumbers = await this.requestWinningNumbers();
      this.#calculatePrize(winningNumbers);
      this.#printResult();
    } catch (error) {
      MissionUtils.Console.print(error.message);
    }
  }

  async #requestPurchaseAmount() {
    const input = await MissionUtils.Console.readLineAsync();
    const amount = parseInt(input, 10);

    if (isNaN(amount) || amount < 1000 || amount % 1000 !== 0) {
      throw new Error ("[ERROR] 구입 금액은 1,000 단위의 정수여야 합니다.");
    }
    return amount;
  }

  generateLottos() {
    const count = this.purchaseAmount / 1000;
    this.createLottos(count);
    this.#printLottos();
  }

  createLottos(count) {
    for (let i= 0; i<count; i++) {
      const numbers = MissionUtils.Random.pickUniqueNumbersInRange(1, 45, 6);
      this.lottos.push(new Lotto(numbers));
      this.lottoNumbers.push(numbers);
    }
  }

  #printLottos() {
    MissionUtils.Console.print(`${this.lottos.length}개를 구매했습니다.\n`);
    this.lottoNumbers.forEach(numbers =>
      MissionUtils.Console.print(`[${numbers.join(', ')}]`));
  }

  async requestWinningNumbers() {
    const winningNumbers = await this.#requestNumbers("당첨 번호를 입력해 주세요.\n");
    const bonusNumber = await this.#requestNumbers("보너스 번호를 입력해 주세요\n", true);
    return [...winningNumbers, bonusNumber];
  }

  async #requestNumbers (promptMessage, isBonus = false) {
    MissionUtils.Console.print(promptMessage);
    let input = await MissionUtils.Console.readLineAsync();

    if (isBonus) {
      return parseInt (input.trim(), 10);
    }

    let numbers = input.split(',').map (s => parseInt(s.trim(), 10));
    const lotto = new Lotto(numbers);
    return lotto.numbers;
  }

  #calculatePrize(winningNumbers) {
    const bonusNumber = winningNumbers.pop();
    this.#matchNumbers(winningNumbers, bonusNumber);
  }

  #matchNumbers(winningNumbers, bonusNumber) {
    this.lottos.forEach(lotto => {
      const matchedCount = lotto.numbers.filter(number => winningNumbers.includes(number)).length;
      const hasBonus = lotto.numbers.includes(bonusNumber);
      this.prizeMoney += this.#calculateIndividualPrize(matchedCount, hasBonus);
      
      if (matchedCount >= 3) {
        const matchKey = matchedCount === 5 && hasBonus ? '5B' : matchedCount;
        this.matchedCount[matchKey]++;
      }
      });
    };
  
  #calculateIndividualPrize(matchedCount, hasBonus) {
    switch (matchedCount) {
      case 3: return 5000;
      case 4: return 50000;
      case 5: return hasBonus ? 30000000 : 1500000;
      case 6: return 2000000000;
      default: return 0;
    }
  }

  #printResult() {
    const profit = this.prizeMoney
    const rateOfReturn = ((profit / this.purchaseAmount) * 100)
    const resultString = `
    당첨 통계\n
    ---\n
    3개 일치 (5,000원) - ${this.matchedCount[3]}개\n
    4개 일치 (50,000원) - ${this.matchedCount[4]}개\n
    5개 일치 (1,500,000원) - ${this.matchedCount[5]}개\n
    5개 일치, 보너스 볼 일치 (30,000,000원) - ${this.matchedCount['5B']}개\n
    6개 일치 (2,000,000,000원) - ${this.matchedCount[6]}개\n
    총 수익률은 ${rateOfReturn}%입니다.
    `;

    MissionUtils.Console.print(resultString);
  }
}


export default App;
