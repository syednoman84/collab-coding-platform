import { useEffect, useRef, useState } from 'react';
import {
  connectWebSocket,
  sendCodeSync,
  sendUserJoin,
  sendUserSolved,
} from '../websocket';

export function useCollaborativeSession({
  user,
  problem,
  onCodeMessage,
  onUsersUpdate,
  onProblemEvents,
  onJoin,
  setStartTime
}) {
  const [sessionReady, setSessionReady] = useState(false);
  const hasJoined = useRef(false);

  useEffect(() => {
    if (!user || hasJoined.current) return;

    connectWebSocket(
      (incomingCode) => onCodeMessage?.(incomingCode),
      (userMap) => onUsersUpdate?.(userMap),
      (payload) => onProblemEvents?.(payload)
    ).then(() => {
      if (hasJoined.current) return;
      hasJoined.current = true;

      let sessionId = sessionStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = generateUUID();
        sessionStorage.setItem('sessionId', sessionId);
      }

      sendUserJoin(user.username, problem?.id ?? null);
      setSessionReady(true);
      setStartTime?.(Date.now());

      // 🔄 Avoid immediate navigate inside render cycle
      setTimeout(() => {
        onJoin?.();
      }, 50);
    });
  }, [user, problem, onCodeMessage, onUsersUpdate, onProblemEvents, onJoin, setStartTime]);

  const generateUUID = () =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });

  const syncCode = (newCode) => {
    sendCodeSync(newCode);
  };

  const notifySolved = (finalTime) => {
    sendUserSolved(finalTime);
  };

  return {
    sessionReady,
    syncCode,
    notifySolved,
  };
}
