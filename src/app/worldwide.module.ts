export class Worldwide {

    totalCases: number;
    newCases: number;
    activeCases: number;
    totalRecovered: number;
    newRecovered: number;
    recoveryRate: number;
    totalDeaths: number;
    newDeaths: number;
    mortalityRate: number;


    constructor(totalCases, newCases, totalRecovered, newRecovered, totalDeaths, newDeaths){
                    this.totalCases = totalCases;
                    this.newCases = newCases;
                    this.totalRecovered = totalRecovered;
                    this.newRecovered = newRecovered;

                    if (totalCases == 0)
                        this.recoveryRate = 0;
                    else
                        this.recoveryRate = 100 * totalRecovered / totalCases;

                    this.totalDeaths = totalDeaths;
                    this.newDeaths = newDeaths;

                    if (totalCases == 0)
                        this.mortalityRate = 0;
                    else
                        this.mortalityRate = 100 * totalDeaths / totalCases;

                    this.activeCases = totalCases - (totalDeaths + totalRecovered)

        }
}
