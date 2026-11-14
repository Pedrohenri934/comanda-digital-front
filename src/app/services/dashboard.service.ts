import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Dashboard } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  obter(dias: number): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${environment.apiUrl}/api/admin/dashboard`, { params: new HttpParams().set('dias', dias) });
  }
}
