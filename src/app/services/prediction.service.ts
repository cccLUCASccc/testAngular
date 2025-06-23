import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root', // Le service est disponible globalement
})
export class PredictionService {
  constructor(private http: HttpClient) {}

  predictHospitalization(data: any) {
    return this.http.post(
      'https://canalytics.comunicare.io/api/predictionHospitalizationCovidFhir',
      data,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
