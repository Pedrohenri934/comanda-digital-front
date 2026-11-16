import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RelatorioBcg } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  private http = inject(HttpClient);
  bcg(dias: number): Observable<RelatorioBcg> {
    return this.http.get<RelatorioBcg>(`${environment.apiUrl}/api/admin/relatorios/bcg`, { params: new HttpParams().set('dias', dias) });
  }
}
