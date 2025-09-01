import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingCounter = 0;

  /**
   * Observable para el estado de loading
   */
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  /**
   * Mostrar loading
   */
  show(): void {
    this.loadingCounter++;
    if (this.loadingCounter === 1) {
      this.loadingSubject.next(true);
    }
  }

  /**
   * Ocultar loading
   */
  hide(): void {
    this.loadingCounter--;
    if (this.loadingCounter <= 0) {
      this.loadingCounter = 0;
      this.loadingSubject.next(false);
    }
  }

  /**
   * Forzar ocultar loading
   */
  forceHide(): void {
    this.loadingCounter = 0;
    this.loadingSubject.next(false);
  }

  /**
   * Obtener estado actual de loading
   */
  get isLoading(): boolean {
    return this.loadingSubject.value;
  }
}