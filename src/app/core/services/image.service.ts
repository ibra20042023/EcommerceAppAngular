import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GeneralResponse } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private apiUrl = environment.API_URL;
  private http = inject(HttpClient);

  // Upload images
  uploadImage(file: File, productId: number): Observable<GeneralResponse<string>> {
    const formData = new FormData();
    formData.append('request', file, file.name);

    return this.http.post<GeneralResponse<string>>(`${this.apiUrl}/images/${productId}`, formData);
  }

  // Delete image
  deleteImage(id: number): Observable<GeneralResponse<string>> {
    return this.http.delete<GeneralResponse<string>>(`${this.apiUrl}/images/${id}`);
  }
}
