import { Component, OnInit } from '@angular/core';
import { AccountService } from './../services/account.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Environment';
  showYAxisLabel = true;
  yAxisLabel = 'Number of accounts';

  // data
  accounts = [];
  deliveryStatus = [];
  prodTypes = [];
  stageTypes = [];
  prodPackages = [{
    'name': 'init',
    'value': 0
  }];
  stagePackages = [{
    'name': 'init',
    'value': 0
  }];

  constructor(private accountService: AccountService) { }

   // data from server
  initialize(stats) {

    this.accounts = stats.map(row => {
      const newRow = {};
      newRow['name'] = row._id;
      newRow['value'] = row.count;
      return newRow;
    });

    this.deliveryStatus = stats.map(row => {
      const newRow = {};
      newRow['name'] = row._id;
      const delivered = row.status.filter(status => status.type === 'Delivered')
                                    .map(elem => elem.count);
      newRow['series'] = [];
      newRow['series'].push({'name': 'Delivered', 'value': delivered});
      newRow['series'].push({'name': 'Not Delivered', 'value': row.count - delivered});
      return newRow;
    });

    this.getPackages('production', stats);
    this.getPackages('staging', stats);
    this.getTypes('production', stats);
    this.getTypes('staging', stats);

    // only way to refresh data for treemap and cards
    this.prodPackages = [...this.prodPackages];
    this.stagePackages = [...this.stagePackages];
    this.prodTypes = [...this.prodTypes];
    this.stageTypes = [...this.stageTypes];

  }

  getTypes(env: string, stats: any): void {

    stats.filter(row => row._id === env)
    .map(elem =>
      elem.acct_types.map(types => {
        const newElem = {};
        newElem['name'] = types.type;
        newElem['value'] = types.count;
        if (env === 'production') { this.prodTypes.push(newElem); }
        if (env === 'staging') { this.stageTypes.push(newElem); }
      }));
  }

  getPackages(env: string, stats: any): void {

    stats.filter(row => row._id === env)
    .map(elem =>
      elem.acct_pkgs.map(pck => {
        const newElem = {'name': '', 'value': 0};
        newElem['name'] = pck.pkg;
        newElem['value'] = pck.count;
        if (env === 'production') { this.prodPackages.push(newElem); }
        if (env === 'staging') { this.stagePackages.push(newElem); }
      }));
  }

  ngOnInit() {
    this.accountService.getStats().subscribe(stats => this.initialize(stats));
  }

}
