import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { HttpClientModule } from '@angular/common/http';


import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { SideMenuComponent } from './side-menu/side-menu.component';
import { AccountsTableComponent } from './accounts-table/accounts-table.component';
import { FileService } from './services/file.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AccountService } from './services/account.service';
import { AppRoutingModule } from './/app-routing.module';
import { AlertsComponent } from './alerts/alerts.component';
import { AlertService } from './services/alert.service';
import { AuthService } from './services/auth.service';
import { AuthGuardService } from './services/auth-guard.service';
import { LoginComponent } from './login/login.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SideMenuComponent,
    AccountsTableComponent,
    DashboardComponent,
    AlertsComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgxDatatableModule,
    NgbModule.forRoot(),
    NgxChartsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [FileService, AccountService, AlertService, AuthService, AuthGuardService],
  bootstrap: [AppComponent]
})
export class AppModule { }
