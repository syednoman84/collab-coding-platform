import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let stompClient = null;
let connectedPromise = null;

export function connectWebSocket(onCodeUpdate, onUsersUpdate, onProblemEvent) {
  if (!connectedPromise) {
    connectedPromise = new Promise((resolve, reject) => {
      const socket = new SockJS('http://192.168.1.196:8080/ws');

      stompClient = new Client({
        webSocketFactory: () => socket,
        onConnect: () => {
          stompClient.subscribe('/topic/code', (message) => {
            onCodeUpdate(message.body);
          });
          stompClient.subscribe('/topic/users', (message) => {
            onUsersUpdate(JSON.parse(message.body));
          });
          stompClient.subscribe('/topic/problem', (message) => {
            onProblemEvent(JSON.parse(message.body));
          });
          resolve(); 
          console.log("Connected to WebSocket")
        },
        onStompError: (frame) => {
          console.error('STOMP error', frame);
          reject(frame);
        },
      });

      stompClient.activate();
    });
  }

  return connectedPromise;
}


export async function sendUserJoin(userName, problemId) {
  await connectedPromise; // ✅ wait for socket to be ready
  const sessionId = sessionStorage.getItem('sessionId');
  stompClient.publish({
    destination: '/app/user.join',
    body: JSON.stringify({ sessionId, userName, problemId }),
  });
}

export async function sendCodeSync(code) {
  await connectedPromise;
  stompClient.publish({
    destination: '/app/code.sync',
    body: code,
  });
}

export async function sendUserSolved(finalTime) {
  await connectedPromise;
  const sessionId = sessionStorage.getItem('sessionId');
  stompClient.publish({
    destination: '/app/user.solved',
    body: JSON.stringify({ sessionId, finalTime }),
  });
}
