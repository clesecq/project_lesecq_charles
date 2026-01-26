import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { AuthState } from '../auth/state/auth.store';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { Logout } from '../auth/state/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  const router = inject(Router);
  const token = store.selectSnapshot(AuthState.accessToken);

  // Clone request and add Authorization header if token exists
  let authReq = req;
  if (token) {
    // For multipart/form-data requests (FormData), don't set Content-Type
    // Let the browser set it automatically with the correct boundary
    const headers: { [key: string]: string } = {
      Authorization: `Bearer ${token}`,
    };
    
    authReq = req.clone({
      setHeaders: headers,
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      // If 401 or 403, logout user
      if (error.status === 401 || error.status === 403) {
        store.dispatch(new Logout());
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
