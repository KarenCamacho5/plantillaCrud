import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {

  private apiUrl = 'http://localhost:3000/api/campaigns'; // URL del backend

  constructor(private http: HttpClient) {}

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Obtiene la lista de campañas desde el backend
   * @returns Observable con la lista de campañas
   */
  getCampaigns(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Crea una nueva campaña en el backend
   * @param campaign - Datos de la campaña a crear
   * @returns Observable con la respuesta de la API
   */
  createCampaign(campaign: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, campaign);
  }
  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Actualiza una campaña existente en el backend
   * @param id - ID de la campaña a actualizar
   * @param campaign - Datos actualizados de la campaña
   * @returns Observable con la respuesta de la API
   */
  updateCampaign(id: number, campaign: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, campaign);
  }
  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Elimina una campaña del backend
   * @param id - ID de la campaña a eliminar
   * @returns Observable vacío que indica la eliminación
   */
  deleteCampaign(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
