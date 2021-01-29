import { Component, OnInit } from '@angular/core';
import { News } from '../news.module';
import { CovidService } from '../covid.service';
import { User } from '../user.module';

@Component({
  selector: 'app-add-news',
  templateUrl: './add-news.component.html',
  styleUrls: ['./add-news.component.css']
})
export class AddNewsComponent implements OnInit {

  user: User;
  description: string;
  country: string;
  date: any;
  constructor(private covidService: CovidService) { }

  ngOnInit(): void {
    this.user = this.covidService.getUser();
  }

  addNews(){
    let news: News = {
      description: this.description,
      country: this.country,
      date: new Date(this.date),
    };
    this.covidService.addNews(news);
    this.description = undefined;
    this.country = undefined;
    this.date = undefined;
  }

}