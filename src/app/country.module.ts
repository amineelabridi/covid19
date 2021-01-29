export class Country{
    ID: number;
    Country: string;
    NewCases: number;
    TotalCases: number;
    NewDeaths: number;
    TotalDeaths: number;
    NewRecovered: number;
    TotalRecovered: number;
    recoveryRate: number;
    mortalityRate: number;
    activeCases: number;

    constructor(ID: number,
                Country: string,
                NewCases: number,
                TotalCases: number,
                NewDeaths: number,
                TotalDeaths: number,
                NewRecovered: number,
                TotalRecovered: number){
                    this.ID = ID,
                    this.Country = Country;
                    this.NewCases = NewCases;
                    this.TotalCases = TotalCases;
                    this.NewDeaths = NewDeaths;
                    this.TotalDeaths = TotalDeaths;
                    this.NewRecovered = NewRecovered;
                    this.TotalRecovered = TotalRecovered;

                    if (TotalCases == 0)
                        this.recoveryRate = 0;
                    else
                        this.recoveryRate = 100 * TotalRecovered / TotalCases;

                    this.TotalDeaths = TotalDeaths;
                    this.NewDeaths = NewDeaths;

                    if (TotalCases == 0)
                        this.mortalityRate = 0;
                    else
                        this.mortalityRate = 100 * TotalDeaths / TotalCases;

                    this.activeCases = TotalCases - (TotalDeaths + TotalRecovered)
                }
}