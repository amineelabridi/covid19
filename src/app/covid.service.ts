import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from './user.module';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Worldwide } from './worldwide.module';
import { Country } from './country.module';
import { News } from './news.module';


@Injectable({
  providedIn: 'root'
})

export class CovidService {

  private user: User;

  public country: Country[];
  public current_country:  Country;
  public cur_country_pie_data = [0, 0, 0];
  public cur_country_bar_data = [];
  public cur_country_bar_label = [];
  public cur_country_chart_data = [];
  public cur_country_chart_label= [];

  public worldwide = new Worldwide(0,0,0,0,0,0);
  public world_pie_data = [];
  public world_bar_data = [];
  public world_bar_label = [];
  public world_chart_data = [];
  public world_chart_label= [];
  public isAdmin = false;


  world_data_api      = "https://api.covid19api.com/summary";
  world_last_week_api = "https://corona.lmao.ninja/v2/historical/all?lastdays=8";
  world_day_one_API   = "https://corona.lmao.ninja/v2/historical/all";
  current_country_last_week_API = "https://corona.lmao.ninja/v2/historical/" ;
  current_country_last_month_API= "https://corona.lmao.ninja/v2/historical/" ;

  world_data_last_month = [];
  world_data_last_week   = [];
  country_data_last_month = [];
  country_data_last_week   = [];

  constructor(private afAuth: AngularFireAuth,
              private router: Router,
              private firestore: AngularFirestore,
              private http: HttpClient){
  }

  async signInWithGoogle(){
    const credentials = await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    this.user = {
      uid: credentials.user.uid,
      displayName: credentials.user.displayName,
      email: credentials.user.email
    };
    localStorage.setItem("user", JSON.stringify(this.user));
    this.updateUserData();
    this.router.navigate(["worldwide"]);
  }

  private updateUserData(){

    this.firestore.collection("user").doc(this.user.uid).set({
      uid: this.user.uid,
      displayName: this.user.displayName,
      email: this.user.email
    }, {merge: true});

  }

  getUser(){
    if(this.user == null && this.userSignedIn()){
      this.user = JSON.parse(localStorage.getItem("user"));
    }
    else if (!this.userSignedIn()){
      this.router.navigate(["signin"]);
    }
    return this.user;
  }

  userSignedIn(): boolean{
    return JSON.parse(localStorage.getItem("user")) != null;
  }

  signOut(){
    this.afAuth.signOut();
    localStorage.removeItem("user");
    this.user = null;
    this.router.navigate(["signin"]);
  }

  checkAdminRights() {
    this.firestore.collection("admin").doc(this.user.email).get().subscribe((doc) => {
      if (doc.exists){
        console.log(this.user.displayName, "is an administrator. He has the rights to add news!");
        this.isAdmin = true;
      }
      else{
        console.log(this.user.displayName, "is not an administrator. He doesn't have the rights to add news!")
      }
    });
  }


  getWorldSummaryURL(){
    let options: { responseType?: "json" }
    return this.http.get(this.world_data_api, options);
  }

  getWorldSummary(){
    this.getWorldSummaryURL().subscribe(data =>  {
      this.worldwide = new Worldwide( data["Global"]["TotalConfirmed"],
                                      data["Global"]["NewConfirmed"],
                                      data["Global"]["TotalRecovered"],
                                      data["Global"]["NewRecovered"],
                                      data["Global"]["TotalDeaths"],
                                      data["Global"]["NewDeaths"])
                                      this.world_pie_data = [this.worldwide.totalDeaths, this.worldwide.totalRecovered, this.worldwide.activeCases];

      this.country = new Array<Country>();

      for (let index=0; index < data["Countries"].length; index++){
        let country = data["Countries"][index];
        country = new Country(country["ID"],
                              country["Country"],
                              country["NewConfirmed"],
                              country["TotalConfirmed"],
                              country["NewDeaths"],
                              country["TotalDeaths"],
                              country["NewRecovered"],
                              country["TotalRecovered"])
        this.country.push(country);
        this.firestore.collection("countries").doc(country.Country).get().subscribe((doc) => {
          if (doc.exists){
          }
          else{
            this.firestore.collection("countries").doc(country.Country).set({
              Country: country.Country,
              TotalCases: country.TotalCases,
              NewCases: country.NewCases,
              TotalDeaths: country.TotalDeaths,
              NewDeaths: country.NewDeaths,
              TotalRecovered: country.TotalRecovered,
              NewRecovered: country.NewRecovered,
              ActiveCases: country.activeCases,
              mortalityRate: country.mortalityRate,
              recoveryRate: country.recoveryRate,
              lastUpdated: new Date()
            }, {merge: true});
          }
        });
      }
    });
  }

  getDailyWorldURL(){
    let options: { responseType?: "json" }
    return this.http.get(this.world_last_week_api, options);
  }

  getDailyWorldData(){
    this.getDailyWorldURL().subscribe(data =>  {
    this.world_data_last_week.push(Object.values(data["cases"]));
    this.world_data_last_week.push(Object.values(data["deaths"]));
    this.world_data_last_week.push(Object.values(data["recovered"]));
    this.world_data_last_week.push(Object.keys(data["cases"]));
    let new_deaths = [];
    let new_recovered = [];
    let new_cases = [];
    for (let index=0; index < 7; index++){
      new_cases.push(this.world_data_last_week[0][index+1] - this.world_data_last_week[0][index]);
      new_deaths.push(this.world_data_last_week[1][index+1] - this.world_data_last_week[1][index]);
      new_recovered.push(this.world_data_last_week[2][index+1] - this.world_data_last_week[2][index]);

    }
    this.world_bar_data = [ { data: new_deaths, label: 'Daily Deaths' },
                            { data: new_recovered, label: 'Daily Recovered' },
                            { data: new_cases, label: 'Daily New Cases' }
                          ];
    this.world_bar_label= this.world_data_last_week[3];
    });
  }

  getLastMonthWorldURL(){
    let options: { responseType?: "json" }
    return this.http.get(this.world_day_one_API, options);
  }

  getLastMonthWorldData(){
    this.getLastMonthWorldURL().subscribe(data =>  {
    this.world_data_last_month.push(Object.values(data["cases"]));
    this.world_data_last_month.push(Object.values(data["deaths"]));
    this.world_data_last_month.push(Object.values(data["recovered"]));
    this.world_data_last_month.push(Object.keys(data["cases"]));
    this.world_chart_data = [ { data: this.world_data_last_month[1], label: 'Daily Deaths' },
                              { data: this.world_data_last_month[2], label: 'Daily Recovered' },
                              { data: this.world_data_last_month[0], label: 'Daily New Cases' }
                          ];
    this.world_chart_label= this.world_data_last_month[3];
  });
  }

  goToWorldwidePage(){
    this.router.navigate(['worldwide']);
  }

  GoToCountryURL(country){
    this.current_country = new Country(0,country,0,0,0,0,0,0)
    localStorage.setItem("country", JSON.stringify(this.current_country.Country));
    this.router.navigate(['/country', country]);
  }

  checkCountryUpdate(){

    if(this.current_country == null )
    {
      let country_name = JSON.parse(localStorage.getItem("country"));
      this.current_country = new Country(0, country_name, 0,0,0,0,0,0);
    }

    let today_date = new Date();
    this.firestore.collection("countries").doc(this.current_country.Country).get().subscribe((doc) => {
      if (doc.exists && (doc.data()["lastUpdated"].toDate() < today_date )){
        this.UpdateCountryData();
      }
    });
  }

  UpdateCountryData(){
    this.current_country =  this.country.filter(x => x.Country == this.current_country.Country)[0];
    let country = this.current_country;
    this.firestore.collection("countries").doc(country.Country).set({
      Country: country.Country,
      TotalCases: country.TotalCases,
      NewCases: country.NewCases,
      TotalDeaths: country.TotalDeaths,
      NewDeaths: country.NewDeaths,
      TotalRecovered: country.TotalRecovered,
      NewRecovered: country.NewRecovered,
      ActiveCases: country.activeCases,
      mortalityRate: country.mortalityRate,
      recoveryRate: country.recoveryRate,
      lastUpdated: new Date()
    }, {merge: true});
  }

  getLastWeekCountryURL(){
    let options: { responseType?: "json" }
    let url = this.current_country_last_week_API + this.current_country.Country+"?all?lastdays=8";
    return this.http.get( url, options);
  }

  getLastMonthCountryURL(){
    let options: { responseType?: "json" }
    let url = this.current_country_last_week_API + this.current_country.Country;
    return this.http.get(url, options);
  }

  getDailyCountryData(){
    this.getLastWeekCountryURL().subscribe(data =>  {
    data = data["timeline"];
    this.country_data_last_week.push(Object.values(data["cases"]));
    this.country_data_last_week.push(Object.values(data["deaths"]));
    this.country_data_last_week.push(Object.values(data["recovered"]));
    this.country_data_last_week.push(Object.keys(data["cases"]));
    let new_deaths = [];
    let new_recovered = [];
    let new_cases = [];
    for (let index=22; index < 30; index++){
      new_cases.push(this.country_data_last_week[0][index+1] - this.country_data_last_week[0][index]);
      new_deaths.push(this.country_data_last_week[1][index+1] - this.country_data_last_week[1][index]);
      new_recovered.push(this.country_data_last_week[2][index+1] - this.country_data_last_week[2][index]);

    }
    this.cur_country_bar_data = [ { data: new_deaths, label: 'Daily Deaths' },
                                  { data: new_recovered, label: 'Daily Recovered' },
                                  { data: new_cases, label: 'Daily New Cases' }
                                ];
    this.cur_country_bar_label= this.country_data_last_week[3].slice(23,31);
    });
  }

  getLastMonthCountryData(){
    this.getLastMonthCountryURL().subscribe(data =>  {
      data = data["timeline"]
      this.country_data_last_month.push(Object.values(data["cases"]));
      this.country_data_last_month.push(Object.values(data["deaths"]));
      this.country_data_last_month.push(Object.values(data["recovered"]));
      this.country_data_last_month.push(Object.keys(data["cases"]));
      this.cur_country_chart_data = [ { data: this.country_data_last_month[1], label: 'Daily Deaths' },
                                      { data: this.country_data_last_month[2], label: 'Daily Recovered' },
                                      { data: this.country_data_last_month[0], label: 'Daily New Cases' }
                            ];
      this.cur_country_chart_label= this.country_data_last_month[3];
    });
    }

  getCountrySummaryAndPieChart(){
    this.firestore.collection("countries").doc(this.current_country.Country).get().subscribe((doc) => {
        this.current_country.Country = doc.data()["Country"];
        this.current_country.TotalCases = doc.data()["TotalCases"];
        this.current_country.NewCases = doc.data()["NewCases"];
        this.current_country.TotalDeaths = doc.data()["TotalDeaths"];
        this.current_country.NewDeaths = doc.data()["NewDeaths"];
        this.current_country.TotalRecovered = doc.data()["TotalRecovered"];
        this.current_country.NewRecovered = doc.data()["NewRecovered"];
        this.current_country.activeCases = doc.data()["ActiveCases"];
        this.current_country.NewRecovered = doc.data()["NewRecovered"];
        this.current_country.mortalityRate = doc.data()["mortalityRate"];
        this.current_country.recoveryRate = doc.data()["recoveryRate"];
        this.cur_country_pie_data = [this.current_country.TotalDeaths, this.current_country.TotalRecovered, this.current_country.activeCases]


    });
  }

  getNews(country:string){
    return this.firestore.collection("news")
    .doc(country).collection("news", ref => ref.orderBy('date', 'desc')).valueChanges();
  }

  addNews(news: News){
    let uid = this.firestore.createId();
    if (news.country != "worldwide")
    {
      this.firestore.collection("news").doc(news.country)
      .collection("news").doc(uid)
      .set({
        uid: this.firestore.createId(),
        name: this.user.displayName,
        description: news.description,
        country: news.country,
        date: news.date
        }, {merge: true});

        this.firestore.collection("news").doc("worldwide")
        .collection("news").doc(uid)
        .set({
          uid: this.firestore.createId(),
          name: this.user.displayName,
          description: news.description,
          country: news.country,
          date: news.date
          }, {merge: true});
    }
    else
    {
      this.firestore.collection("news").doc(news.country)
      .collection("news").doc(uid)
      .set({
        uid: this.firestore.createId(),
        name: this.user.displayName,
        description: news.description,
        country: news.country,
        date: news.date
        }, {merge: true});
    }
  }

}


