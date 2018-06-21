import { forkJoin } from 'rxjs/observable/forkJoin';
import { Account } from './../account';
import { AccountService } from './../services/account.service';
import { FileService } from './../services/file.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable/src';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-accounts-table',
  templateUrl: './accounts-table.component.html',
  styleUrls: ['./accounts-table.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AccountsTableComponent implements OnInit {

  rows: Account [] = [];
  columns = Account.getVisibleColumns();
  allColumns = this.columns.map((col, index) => Object.assign({ id: index }, col));
  selected: Account [] = [];
  cachedRows: Account [] = [];
  editing = {};
  actionsIsClicked = false;
  dispListCol = false;
  pageSize = 10;
  env = '';
  limitOptions = [
    {
        key: '10',
        value: 10
    },
    {
        key: '25',
        value: 25
    },
    {
        key: '50',
        value: 50
    },
    {
        key: '100',
        value: 100
    }
  ];

  @ViewChild('table') table: DatatableComponent;

  constructor(
    private fileManager: FileService,
    private modalService: NgbModal,
    private accountService: AccountService,
    private route: ActivatedRoute
    ) { }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }
  updateFilter(event) {
    const term = event.target.value.toLowerCase();
    const filteredRows = this.cachedRows.filter(row =>
        Object.keys(row).reduce((accumulator, current) =>
                (accumulator || (row[current].toString().toLowerCase().indexOf(term) !== -1)), false)
            );
    this.rows = filteredRows;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  onPageSizeChanged(event) {
    this.table.limit = event;
    this.table.offset = 0;
    this.rows = this.rows.slice();
  }

  onToggle(col) {
    const colIsChecked = this.colIsChecked(col);

    if (colIsChecked) {
      this.columns = this.columns.filter(c => {
        return c.name !== col.name;
      });
    } else {
      this.columns.splice(col.id, 0, col);
    }
  }

  colIsChecked(col) {
    return this.columns.find(c => {
      return c.name === col.name;
    });
  }

  onUpload(uploadPopup) {
    this.modalService.open(uploadPopup, { centered: true }).result.then((result) => {
        if (result.files[0] && result.files[0].name.split('.').pop().toLowerCase() === 'csv') {
            this.fileManager.importCsv(result.files[0], this.fileManager.csvToJson)
            .subscribe(res => {
                // cant add res to this.rows directly because table will not refresh
                const temp = [...this.rows];
                const ids = temp.map(row => row.account_id);
                let shiftedCells = 0;
                res.map(rowR => {
                    const index = ids.indexOf(rowR.account_id);
                    if (index < 0) {
                        // add type --> useful to differentiate update and new (PUT and POST)
                        rowR['change_type'] = 'POST';
                        temp.unshift(rowR);
                        this.cachedRows.unshift(rowR);
                        this.selected.push(rowR);
                        shiftedCells++;
                    } else {
                        const rowToUpdate = temp[index + shiftedCells];
                        // POST has always the highest priority
                        if (rowToUpdate['change_type'] !== 'POST') {
                          rowToUpdate['change_type'] = 'PUT';
                        }
                        Object.keys(rowR).forEach(key => {
                          if (key !== 'last_changed_at' && key !== 'last_changed_by') {
                           rowToUpdate[key] = rowR[key];
                          }
                        });
                        temp.splice(index + shiftedCells, 1, rowToUpdate);
                        this.cachedRows.splice(index + shiftedCells, 1, rowToUpdate);

                        this.selected = [...this.accountService.findAndReplace(this.selected, [rowToUpdate])];

                    }
                });
                this.rows = temp;
            });
        }
      }, (reason) => {
        console.log(`Dismissed with: ${reason}`);
      });
  }
  onDownload() {
    this.fileManager.exportCsv(this.rows);
  }
  onRemove() {

    this.accountService.deleteAccounts(this.selected).subscribe(
      // data contains only the _id of failed delete calls; _id inserted via the account service's error handler
      data => {
        const successItems = this.selected.filter(row => data.indexOf(row._id) < 0).map(row => row._id);
        const temp = this.rows.filter(row => successItems.indexOf(row._id) < 0);
        this.rows = temp;
        this.cachedRows = this.cachedRows.filter(row => successItems.indexOf(row._id) < 0);
        this.selected = [];
      });
  }
  onRefresh() {
    this.accountService.getAccounts(this.env)
    .subscribe((accounts: Account[]) => {
      this.rows = accounts;
      this.cachedRows = [...this.rows];
      this.selected = [];
     });
  }
  onUpdate() {
    const listObservables = [];
    // UPDATE accounts
    const accountsToUpdate = this.selected.filter(account => account.change_type === 'PUT');
    if (accountsToUpdate.length > 0) {
      listObservables.push(this.accountService.updateAccounts(accountsToUpdate));
    }
    // Create accounts
    // remove last_changed_at as we need this information to be added by the server
    // remove change_type since this is not a schema's field and used only to catch PUT/POST rows
    // add the user id in last_changed_by
    const accountsToCreate = this.selected.filter(account => account.change_type === 'POST')
                                          .map(account => {
                                            const { change_type, last_changed_at, ...res} = account;
                                            res.last_changed_by = '5ae6cb417594bf2608f51125';
                                            return res;
                                           });

    if (accountsToCreate.length > 0) {
      listObservables.push(this.accountService.postAccounts(accountsToCreate));
    }

    forkJoin(listObservables).subscribe(data => {
        const updatedAccounts = data[0] as Account[];
        const newAccounts = data[1] as Account[];
        // undefined if there is no PUT or POST are filtered
        const all = updatedAccounts.concat(newAccounts).filter(acct => acct !== undefined);
        this.rows = [...this.accountService.findAndReplace(this.rows, all)];
        this.selected = [];
    });

  }
  updateValue(event, cell, rowIndex, row) {
    const currentIndex = this.rows.indexOf(row);
    console.log('inline editing rowIndex', currentIndex);
    const isRequired = this.columns.filter(col => col.name === cell)[0]['required'];
    this.editing[rowIndex + '-' + cell] = false;
    const currentRow =  this.rows[currentIndex];
    // tslint:disable-next-line:triple-equals
    if (currentRow[cell] != event.target.value) {
      if (isRequired && ! event.target.value) {
        console.log('This field cannot be empty');
      } else {
          currentRow[cell] = event.target.value;
          // add type --> useful to differentiate update and new (PUT and POST)
          // POST has always the highest priority
          if (currentRow['change_type'] !== 'POST') {
            currentRow['change_type'] = 'PUT';
          }
          this.rows = [...this.rows];

          this.selected = [...this.accountService.findAndReplace(this.selected, [currentRow])];
          console.log('UPDATED!', currentRow[cell]);
        }
    }
  }
  onSend(email) {
    this.modalService.open(email, { size: 'lg' }).result.then((result) => {
        console.log(`Closed with: ${result}`);
      }, (reason) => {
        console.log(`Dismissed with: ${reason}`);
      });
  }

  ngOnInit() {

    this.route.queryParamMap
    .pipe(
      switchMap((params: ParamMap) => {
         this.env = params.get('environment');
         return this.accountService.getAccounts(this.env);
      })
    )
    .subscribe((accounts: Account[]) => {
      this.rows = accounts;
      this.cachedRows = this.rows;
      this.selected = [];
     });

  }

}
