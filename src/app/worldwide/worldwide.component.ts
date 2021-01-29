import { Component, OnInit } from '@angular/core';
import { CovidService } from '../covid.service';
import { User } from '../user.module';
import { ChartType, ChartOptions, ChartDataSets } from 'chart.js';
import { Color, SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';
import { News } from '../news.module';


@Component({
  selector: 'app-worldwide',
  templateUrl: './worldwide.component.html',
  styleUrls: ['./worldwide.component.css']
})
export class WorldwideComponent implements OnInit {

  user: User;
  news: News[];
  isAdmin: boolean;

  public pieChartOptions: ChartOptions = {
    responsive: true,
  };

  public pieChartLabels: Label[] = [['Dead cases'], ['Recovered cases'], ['Active cases']];
  public pieChartData: SingleDataSet = [];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];
  public pieChartColors = [
    {
      backgroundColor: ['rgba(255,0,0,0.3)', 'rgba(0,127,255,0.3)', 'rgba(255,255,0,0.3)'],
    }
  ];
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


  constructor(public covidService: CovidService) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  }

  ngOnInit(): void {
    this.user = this.covidService.getUser();
    this.covidService.getWorldSummary();
    this.covidService.getDailyWorldData();
    this.covidService.getLastMonthWorldData();
    if (this.covidService.userSignedIn()){
      this.covidService.checkAdminRights();
    }
    this.covidService.getNews("worldwide").subscribe((news) => {
      this.news = news as News[];
    });
  }
}
