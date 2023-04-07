import { inject, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ListComponent } from './list/list.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table'  
import { FileListComponent } from './file-list/file-list.component';
import { CookieService } from 'ngx-cookie-service';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import { FilterChipsComponent } from './filter-chips/filter-chips.component';
import {MatMenuModule} from '@angular/material/menu';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatProgressSpinner, MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import { RecentlyAccessedComponent } from './recently-accessed/recently-accessed.component';
import {MatGridListModule} from '@angular/material/grid-list';
import { MomentDateModule } from '@angular/material-moment-adapter';
import { FiletreeComponent } from './filetree/filetree.component';
import {MatTreeModule} from '@angular/material/tree';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatTabsModule} from '@angular/material/tabs';
import { ItemDetailsComponent } from './item-details/item-details.component';
import { ItemDetailsTitleComponent } from './item-details-title/item-details-title.component';
import { ItemTabsComponent } from './item-tabs/item-tabs.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatDialogModule} from '@angular/material/dialog';



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ListComponent,
    FileListComponent,
    FilterChipsComponent,
    RecentlyAccessedComponent,
    FiletreeComponent,
    ItemDetailsComponent,
    ItemDetailsTitleComponent,
    ItemTabsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatIconModule,
    MatMenuModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    MatAutocompleteModule,
    FormsModule,
    MatCardModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    FormsModule,
    MomentDateModule,
    MatTreeModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatTabsModule,
    MatSidenavModule,
    MatDialogModule,
  ],
  providers: [CookieService],
  entryComponents:[MatDialogModule],
  bootstrap: [AppComponent]
})
export class AppModule { 

}
