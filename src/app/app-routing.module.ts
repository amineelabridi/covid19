import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddNewsComponent } from './add-news/add-news.component';
import { CountryComponent } from './country/country.component';
import { SigninComponent } from './signin/signin.component';
import { WorldwideComponent } from './worldwide/worldwide.component';

const routes: Routes = [
  { path:"signin", component: SigninComponent},
  { path: "worldwide", component: WorldwideComponent},
  { path: "country/:Country", component: CountryComponent},
  { path: "add_news_admin", component: AddNewsComponent},
  { path: "", pathMatch:"full", redirectTo:"worldwide"},
  { path: "**", redirectTo:"worldwide"}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
