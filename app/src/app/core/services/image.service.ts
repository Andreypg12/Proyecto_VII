import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/api-response.model';
import { ImageUploadResponse } from '../models/image.model';

export interface ImageUploadData {
    filename: string;
}

@Injectable({
    providedIn: 'root',
})

export class ImageService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/images`;

    

upload(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<ImageUploadResponse>(
        `${this.apiUrl}/upload`,
        formData
    );
}

    getImageUrl(imageName: string): string {
        return `${environment.imageUrl}/${imageName}`;
    }

    listar() {
        return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/files`);
    }
}