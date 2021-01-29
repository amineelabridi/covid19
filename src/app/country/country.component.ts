import { Component, OnInit } from '@angular/core';
import { CovidService } from '../covid.service';
import { ChartType, ChartOptions, ChartDataSets } from 'chart.js';
import { Color, SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';
import { User } from '../user.module';
import { News } from '../news.module';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css']
})
export class CountryComponent implements OnInit {

  public pieChartOptions: ChartOptions = {
    responsive: true,
  };

  public pieChartLabels: Label[] = [['Dead cases'], ['Recovered cases'], ['Active cases']];
  public pieChartData: SingleDataSet = [];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];

  public barChartOptions: ChartOptions = {
    responsive: true,
  };
  public barChartLabels: Label[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];
  public barChartData: ChartDataSets[] = [];

  public lineChartOptions: (ChartOptions ) = {
    responsive: true,
    scales: {xAxes: [{type: 'time',
                      time: {unit: 'day',
                        displayFormats: {
                          day: 'DD/MM/YY', // This is the default
                        },
                      } ,
                    },],
            }
  };

  public lineChartData: ChartDataSets[] = [];
  public lineChartLabels: Label[] = [];
  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';
  public lineChartPlugins = [];

  public user: User;
  news: News[];


  constructor(public covidService: CovidService) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  }

  ngOnInit(): void {
    this.user = this.covidService.getUser();
    if (this.covidService.userSignedIn()){
      this.covidService.checkAdminRights();
    }    this.covidService.getWorldSummary();
    this.covidService.checkCountryUpdate();
    this.covidService.getCountrySummaryAndPieChart();
    this.covidService.getDailyCountryData();
    this.covidService.getLastMonthCountryData();
    this.covidService.getNews(this.covidService.current_country.Country).subscribe((news) => {
      this.news = news as News[];
    });
  }

}