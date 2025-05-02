import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


let stompClient = null;
let connectedPromise = null;

export function connectWebSocket(onCodeUpdate, onUsersUpdate, onProblemEvent) {
  if (!connectedPromise) {
    connectedPromise = new Promise((resolve, reject) => {
      const socket = new SockJS(`${API_BASE_URL}/ws`);

      stompClient = new Client({
        webSocketFactory: () => socket,
        onConnect: () => {
          stompClient.subscribe('/topic/code', (message) => {
            onCodeUpdate(message.body);
          });
          stompClient.subscribe('/topic/users', (message) => {
            if (message?.body) {
              onUsersUpdate(JSON.parse(message.body));
            } else {
              console.warn("Empty message body received on /topic/users");
            }
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
  stompClient.publish({
    destination: '/app/user.join',
    body: JSON.stringify({ userName, problemId }),
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

export function disconnectWebSocket() {
  if (stompClient && stompClient.connected) {
    stompClient.deactivate(); // safer alternative than disconnect in some STOMP versions
    console.log('WebSocket deactivated on logout.');
    connectedPromise = null; // reset for future logins
  }
}


