import { Injectable } from '@angular/core';
import { Subject, Observable, interval, Subscription } from 'rxjs';
import { CommentModel } from '../models/comment.model';
import { HttpClient } from '@angular/common/http';
import { Client } from '@stomp/stompjs';
import SockJS from "sockjs-client";

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: Client | null = null;
  private connected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private commentSubject = new Subject<CommentModel>();

  // 👇 fallback polling
  private pollingSub?: Subscription;
  private isPolling = false;
  private pollingInterval = 5000; // 5s
  private readonly baseUrl = 'http://localhost:8888/lumix/movie';

  constructor(private http: HttpClient) {}

  /** ✅ Kết nối WebSocket */
  connect(): void {
    const socket = new SockJS('http://localhost:8888/lumix/ws');
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (msg) => console.log('STOMP Debug:', msg)
    });

    console.log('🔌 WebSocket: connecting...');

    this.stompClient.onConnect = () => {
      this.connected = true;
      this.reconnectAttempts = 0;
      console.log('✅ WebSocket connected');
    };

    this.stompClient.onStompError = (frame) => {
      console.error('❌ Broker reported error:', frame.headers['message']);
      console.error('Details:', frame.body);
      this.connected = false;
    };

    this.stompClient.onWebSocketClose = () => {
      console.warn('⚠️ WebSocket closed');
      this.connected = false;
      this.handleConnectionError();
    };

    this.stompClient.activate();
  }

  /** ✅ Ngắt kết nối WebSocket */
  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
      console.log('❌ WebSocket disconnected');
    }
    this.stopPolling();
  }

  /** ✅ Gửi comment */
  sendComment(movieId: string, comment: any): void {
    if (this.connected && this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: `/app/comment/${movieId}`,
        body: JSON.stringify(comment)
      });
      console.log('📤 Sent comment to', `/app/comment/${movieId}`);
    } else {
      console.warn('⚠️ WebSocket not connected, fallback to HTTP');
      this.http.post(`${this.baseUrl}/${movieId}`, comment).subscribe();
    }
  }

  /** ✅ Nhận comment realtime */
  subscribeToMovieComments(movieId: string): Observable<CommentModel> {
    if (this.connected && this.stompClient) {
      const topic = `/topic/comments/${movieId}`;
      console.log('📡 Subscribing to', topic);

      this.stompClient.subscribe(topic, (message) => {
        if (message.body) {
          const newComment = JSON.parse(message.body);
          this.commentSubject.next(newComment);
        }
      });
    } else {
      console.warn('⚠️ WebSocket not connected, using polling instead');
      this.startPolling(movieId);
    }

    return this.commentSubject.asObservable();
  }

  /** 🔄 Nếu WS lỗi nhiều lần → fallback sang polling */
  private handleConnectionError(): void {
    this.reconnectAttempts++;

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => this.connect(), 3000);
    } else {
      console.warn('❌ WebSocket failed, switching to polling');
      this.connected = false;
      this.startPollingAllMovies();
    }
  }

  /** 🕒 Polling toàn bộ comment (fallback mode) */
  private startPollingAllMovies(): void {
    this.startPolling('global');
  }

  private startPolling(movieId: string): void {
    if (this.isPolling) return;
    this.isPolling = true;
    console.log('📡 Started polling fallback every', this.pollingInterval, 'ms');

    this.pollingSub = interval(this.pollingInterval).subscribe(() => {
      this.http.get<CommentModel[]>(`${this.baseUrl}/${movieId}/comments`).subscribe({
        next: (comments) => {
          comments.forEach(c => this.commentSubject.next(c));
        },
        error: (err) => console.error('Polling error:', err)
      });
    });
  }

  private stopPolling(): void {
    this.pollingSub?.unsubscribe();
    this.isPolling = false;
  }
}
