import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

@Injectable()
export class AuthService {
  errorMsg = '';
  // For Dev
  // private authUrl = 'http://localhost:3000/auth/';

  private authUrl = '/auth/';

  constructor(private http: HttpClient) { }

  private handleError () {
    return (error: any): Observable<any> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      if (error.status === 401) {
        this.errorMsg = error.error.message;
      } else {
        this.errorMsg = 'Ooops something went wrong';
      }
      return of();
    };
  }

  login(username: string, password: string): Observable<any> {
    const loginUrl = `${this.authUrl}login`;
    const body = {username: username, password: password};
    return this.http.post(loginUrl, body)
                    .pipe(
                      tap(response => {
                        const token = response['accessToken'];
                        localStorage.setItem('accessToken', token);
                        localStorage.setItem('currentUser', username);
                      }),
                      catchError(this.handleError())
                    );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
  }

  isLoggedIn(): boolean {
    if (localStorage.getItem('accessToken')) { return true; }
    return false;
  }

  getToken(): string {
    return localStorage.getItem('accessToken');
  }

  getUser(): string {
    return localStorage.getItem('currentUser');
  }

  getUserDetails(): Observable<{}> {
    const userUrl = `${this.authUrl}${this.getUser()}`;
    const httpOptions = {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${this.getToken()}` })
    };
    return this.http.get(userUrl, httpOptions);
  }
}
