import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from '../models/auth.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/api/v1`;
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user';

  currentUser = signal<User | null>(this.getStoredUser());
  isAuthenticated = signal<boolean>(this.hasValidToken());

  private refreshTokenSubject = new BehaviorSubject<string | null>(this.getRefreshToken());
  refreshToken$ = this.refreshTokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkTokenValidity();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, data)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(error => {
          console.error('Register error:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): Observable<ApiResponse<null>> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<ApiResponse<null>>(`${this.API_URL}/auth/logout`, { refreshToken })
      .pipe(
        tap(() => this.clearAuthData()),
        catchError(() => {
          this.clearAuthData();
          return throwError(() => ({ error: { message: 'Logout completed' } }));
        })
      );
  }

  refreshToken(): Observable<{ accessToken: string; refreshToken: string }> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<{ accessToken: string; refreshToken: string }>(
      `${this.API_URL}/auth/refresh`,
      { refreshToken }
    ).pipe(
      tap(response => {
        this.setTokens(response.accessToken, response.refreshToken);
        this.refreshTokenSubject.next(response.refreshToken);
      }),
      catchError(error => {
        this.clearAuthData();
        this.router.navigate(['/auth/login']);
        return throwError(() => error);
      })
    );
  }

  getCurrentUser(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.API_URL}/auth/me`)
      .pipe(
        tap(response => this.currentUser.set(response.data)),
        catchError(error => {
          console.error('Get current user error:', error);
          return throwError(() => error);
        })
      );
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.API_URL}/auth/forgot-password`, data);
  }

  resetPassword(data: ResetPasswordRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.API_URL}/auth/reset-password`, data);
  }

  verifyEmail(token: string): Observable<ApiResponse<null>> {
    return this.http.get<ApiResponse<null>>(`${this.API_URL}/auth/verify-email`, { params: { token } });
  }

  resendVerification(email: string): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.API_URL}/auth/resend-verification`, { email });
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private handleAuthSuccess(response: AuthResponse): void {
    const { accessToken, refreshToken, user } = response.data;
    this.setTokens(accessToken, refreshToken);
    this.currentUser.set(user);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    this.isAuthenticated.set(true);
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.refreshTokenSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  private hasValidToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  private checkTokenValidity(): void {
    const token = this.getAccessToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiresIn = payload.exp * 1000 - Date.now();
        
        if (expiresIn < 60000 && expiresIn > 0) {
          this.refreshToken().subscribe();
        }
      } catch {
        this.clearAuthData();
      }
    }
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.role?.name === 'ADMIN';
  }
}