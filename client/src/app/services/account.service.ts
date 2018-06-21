import { AuthService } from './auth.service';
import { AlertService } from './alert.service';
import { Account } from './../account';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { catchError, map, tap } from 'rxjs/operators';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { of } from 'rxjs/observable/of';

@Injectable()
export class AccountService {

  private accountUrl = 'http://localhost:3000/accounts/';
  private httpOptions = {};

  constructor(
    private http: HttpClient,
    private alert: AlertService,
    private authService: AuthService
  ) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${this.authService.getToken()}`
      })
    };
  }

  private handleError<T> (operation = 'operation', accountId?: number, result?: T) {
    return (error: any): Observable<T> => {
      // send error to server's log
      console.error(error); // log to console instead

      let msg = '';
      if (typeof accountId === 'undefined') {
        // Get the standard http error
        msg = `${operation} failed: ${error.message}`;
      } else {
        // Get the rest service error
        msg = `${operation} '${accountId}' failed: ${JSON.stringify(error.error)}`;
      }

      this.alert.add('danger', msg);

      return of(result as T);
    };
  }

  private handlePostError<T> (accounts: Account[]) {
    return (error: any): Observable<Account[]> => {
      // send error to server's log
      console.error(error); // log to console instead

      // get successful accounts from the rest call error response
      const successAccts = <Account[]>error.error['successful accounts'];
      // get failed accounts
      const failedAccts = accounts.filter(account => !successAccts.map(acct => acct.account_id).includes(account.account_id));

      // alert the user
      this.alert.add('warning', `${successAccts.length} accounts created successfully out of ${accounts.length}`);
      this.alert.add('success', `Creation success ids: ${successAccts.map(acct => acct.account_id)}`);
      this.alert.add('danger', `Creation failed ids: ${failedAccts.map(acct => acct.account_id)}`);

      // return the successful accounts to the main app
      return of(successAccts as Account[]);
    };
  }

  // Get Accounts from the server
  getAccounts(env: string): Observable<Account[]> {
    const url = `${this.accountUrl}?environment=${env}`;
    return this.http.get<Account[]>(url, this.httpOptions)
      .pipe(
        tap(_ => this.alert.add('info', 'Get ' + env  +  ' accounts')),
        catchError(this.handleError('Get Accounts', undefined, []))
      );
  }

  // Get stats for the dashboard
  getStats(): Observable<any> {
    const url = `${this.accountUrl}stats`;
    return this.http.get(url, this.httpOptions)
      .pipe(
        tap(_ => this.alert.add('info', 'Get dashboard stats')),
        catchError(this.handleError('Get Stats', undefined,  []))
      );
  }

  // Delete accounts from the server
  deleteAccounts(accounts: Account[]): Observable<any> {
    const listObservables = [];
    accounts.forEach(account => {
      const _id = account._id;
      const id = account.account_id;
      const url = `${this.accountUrl}${_id}`;
      listObservables.push(this.http.delete(url, this.httpOptions)
                          .pipe(
                            tap(_ => this.alert.add('success', 'Deleted successfully account id: ' + id)),
                            catchError(this.handleError('Delete Account', id, _id))
                          )
                        );
    });
    return forkJoin(listObservables);
  }

  // Update accounts
  updateAccounts(accounts: Account[]): Observable<any> {
    const listObservables = [];
    accounts.forEach(account => {
      const _id = account._id;
      const id = account.account_id;
      const url = `${this.accountUrl}${_id}`;
      listObservables.push(this.http.put(url, account, this.httpOptions)
                          .pipe(
                            tap(_ => this.alert.add('success', 'Updated successfully account id: ' + id)),
                            catchError(this.handleError('Update account', id, _id))
                          )
                        );
    });
    return forkJoin(listObservables);
  }

  // Create accounts
  postAccounts(accounts: Account[]): Observable<Account[]> {
    const accountsId = accounts.map(acct => acct.account_id);
    return this.http.post<Account[]>(this.accountUrl, accounts, this.httpOptions)
            .pipe(
              tap(_ => this.alert.add('success', 'Created successfully accounts: ' + accountsId)),
              catchError(this.handlePostError(accounts))
            );
  }

  /** List of account's table helpers */

  /** This function reads newAccounts and compare it to oldAccounts
   * Any account in newAccounts but not in oldAccounts will be added to oldAccounts
   * Any account in oldAccounts but not in newAccounts will be saved
   * Any account in both arrays will be updated in old accounts using values of new accounts
  */
  findAndReplace(oldAccounts: Account[], newAccounts: Account[]): Account[] {

    const oldAccountsIds = oldAccounts.map(oldAccount => oldAccount.account_id);
    newAccounts.forEach(newAccount => {
      const index = oldAccountsIds.indexOf(newAccount.account_id);
      if (index > -1) {
        oldAccounts.splice(index, 1, newAccount);
      } else {
        oldAccounts.push(newAccount);
      }
    });

    return oldAccounts;
  }

}
