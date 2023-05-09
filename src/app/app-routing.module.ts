import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { LoginComponent } from './login/login.component';
import {ItemDetailsComponent} from './item-details/item-details.component'

const routes: Routes = [
  {path:'login',component:LoginComponent},
  {path:'list',component:ListComponent},
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {path: 'item/:id', component: ItemDetailsComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes,{
    useHash: true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
