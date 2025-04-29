import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let client;
let sessionId = Math.random().toString(36).substring(2);

export function connectWebSocket(onCodeMessage, onUsersUpdate, onProblemEvent) {
  client = new Client({
    webSocketFactory: () => new SockJS('http://192.168.1.196:8080/ws'),
    onConnect: () => {
    //   console.log('WebSocket connected');
      client.subscribe('/topic/code', (message) => {
        onCodeMessage(message.body);
      });
      client.subscribe('/topic/users', (message) => {
        onUsersUpdate(JSON.parse(message.body));
      });
      client.subscribe('/topic/problem', (message) => {
        const payload = JSON.parse(message.body);
        onProblemEvent(payload); // << this must exist
      });
    }
  });
  client.activate();
}

export function sendCodeSync(code) {
  if (client) {
    client.publish({ destination: '/app/code.sync', body: code });
  }
}

export function sendUserJoin(userName, problemId) {
  if (client) {
    client.publish({ destination: '/app/user.join', body: JSON.stringify({ sessionId, userName, problemId }) });
  }
}

export function sendUserSolved(finalTimeTaken) {
    client.publish({
      destination: '/app/user.solved',
      body: JSON.stringify({
        sessionId,
        finalTime: finalTimeTaken
      })
    });
  }  

export function getSessionId() {
  return sessionId;
}
