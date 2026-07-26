import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class Auth {
    private readonly apiUrl = 'http://localhost:8080/api/auth';
    private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasValidToken());
    public isLoggedIn$ = this.isLoggedInSubject.asObservable();

    constructor(private http: HttpClient) {}

    setSession(token: string, username: string) {
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        this.isLoggedInSubject.next(true);
    }

    register(user: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, user);
    }

    login(credentials: any): Observable<any> {
        return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.isLoggedInSubject.next(true);
        try {
                const payload = JSON.parse(atob(response.token.split('.')[1]));
                const username = payload.sub || payload.username; 
                if (username) 
                    localStorage.setItem('username', username);
            } catch (e) {
                console.error('Failed to extract username from token', e);
            }
      })
    );
    }

    verifyEmail(email: string, code: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/verify-email`, { email, code }).pipe(
            tap(response => {
                localStorage.setItem('token', response.token);
                this.isLoggedInSubject.next(true);
                try {
                    const payload = JSON.parse(atob(response.token.split('.')[1]));
                    const username = payload.sub || payload.username;
                    if (username) {
                        localStorage.setItem('username', username);
                    }
                } catch (e) {
                    console.error('Failed to extract username from token', e);
                }
            })
        );
    }

    forgotPassword(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/forgot-password`, { email });
    }

    resetPassword(email: string, code: string, newPassword: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/reset-password`, { email, code, newPassword });
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        this.isLoggedInSubject.next(false);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getUsername(): string | null {
        return localStorage.getItem('username');
    }

    public hasValidToken(): boolean {
        const token = this.getToken();
        if (!token) return false;

        try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp;
        const now = Math.floor(Date.now() / 1000);
        return expiry > now;
        } catch (e) {
            return false;
        }
    }
}
