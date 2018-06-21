import { AlertService } from './alert.service';
import { Account } from './../account';
import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver/FileSaver';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class FileService {

  constructor(private alert: AlertService) { }

  exportCsv(rows: Account[]) {
    const separator = ';';
    // copy only columns to display
    const colToDisplay = Account.getVisibleColumns().map(col => col.name);
    const rowsToDisplay = rows.map(row => Object.keys(row)
                                                .filter(key => colToDisplay.includes(key))
                                                .reduce((obj, key) => { obj[key] = row[key]; return obj; } , {}));

    const header = typeof rowsToDisplay[0] === 'undefined' ? '' : Object.keys(rowsToDisplay[0]).join(separator) + '\n';
    const csv = rowsToDisplay.map(row =>
      Object.keys(row).reduce((line, element) => `${line}${separator}${row[element]}`, '').slice(1) + '\n'
    );

    const fileName = 'Accounts_' + Date.now() + '.csv';
    csv.splice(0, 0, header);
    const blob = new Blob(csv, {type : 'text/csv'});
    saveAs(blob, fileName);
  }

  importCsv(file, csvToJson) {

    const reader = new FileReader();

    const fileReaderObs = Observable.create((observer: any) => {
      reader.onloadend = (e) => {
        observer.next(this.csvToJson(reader.result));
        observer.complete();
      };
    });
    reader.readAsText(file);

    return fileReaderObs;

  }

  csvToJson(csv) {

    const separator = ';';
    let result: Account[] = [];

    const lines = csv.split('\n');
    const header = lines[0].replace(/[\n\r]+/g, '').split(separator);

    // Check if we have all columns otherwise return and log error
    if (header.slice().sort().join() !== Account.getVisibleColumns().map(col => col.name).sort().join()) {
      this.alert.add('danger', 'Error uploading accounts: number of header\'s columns is not correct');
      return result;
    }

    // Discard header
    lines.shift(1);

    result = lines.filter(line => line !== '').map(line => {
      const obj = {} as Account;
      line.replace(/[\n\r]+/g, '');
      line.split(separator).map((element, index) => {
        obj[header[index]] = element;
      });
      try {
        Account.isValid(obj);
        return obj;
      } catch (error) {
        this.alert.add('danger', `Error in line: ${line} => ${error.message}`);
      }
    }).filter(line => line !== undefined); // non valid lines return undefined

    return result;
  }

}
