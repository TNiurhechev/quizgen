import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface FlashCard { 
    front: string; 
    back: string; 
}
export interface Question {
    text: string;
    options: string[];
    answers: string[];
}
export interface Deck {
  id?: string;
  title: string;
  subject: string;
  username?: string;
  flashCards: FlashCard[];
  questions: Question[];
}

export interface DeckRequest {
  topic?: string | null;
  source: string | null;
  difficulty: string;
  flashcardCount: number;
  questionCount: number;
  questionType: string;
  language: string;
}

@Injectable({
    providedIn: 'root'
})
export class DeckService {
  private apiUrl = 'http://localhost:8080/api/decks';

  constructor(private http: HttpClient) {}

  getById(id: string): Observable<Deck> {
    return this.http.get<Deck>(`${this.apiUrl}/${id}`);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAll(): Observable<Deck[]> {
    return this.http.get<Deck[]>(this.apiUrl);
  }

  generateFromText(request: DeckRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/generate`, request);
  }

  generateFromFile(file: File, params: Omit<DeckRequest, 'source' | 'topic'>): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('difficulty', params.difficulty);
    formData.append('flashcardCount', params.flashcardCount.toString());
    formData.append('questionCount', params.questionCount.toString());
    formData.append('questionType', params.questionType);
    formData.append('language', params.language);

    return this.http.post<any>(`${this.apiUrl}/generate/file`, formData);
  }
}
