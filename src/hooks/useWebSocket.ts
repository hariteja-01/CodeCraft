import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

interface WebSocketState {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastMessage: any;
  connectedUsers: number;
  roomUsers: string[];
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    url = process.env.NODE_ENV === 'production' 
      ? 'wss://codecraft-server.herokuapp.com' 
      : 'ws://localhost:3001',
    autoConnect = true,
    reconnection = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000
  } = options;

  const [state, setState] = useState<WebSocketState>({
    socket: null,
    isConnected: false,
    isConnecting: false,
    error: null,
    lastMessage: null,
    connectedUsers: 0,
    roomUsers: []
  });

  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = () => {
    if (socketRef.current?.connected) return;

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const socket = io(url, {
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
        timeout: 20000,
        forceNew: true,
        reconnection,
        reconnectionAttempts,
        reconnectionDelay
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Connected to CodeCraft server');
        reconnectAttemptsRef.current = 0;
        setState(prev => ({
          ...prev,
          socket,
          isConnected: true,
          isConnecting: false,
          error: null
        }));
      });

      socket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason);
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false
        }));

        // Auto-reconnect logic
        if (reconnection && reconnectAttemptsRef.current < reconnectionAttempts) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectionDelay * reconnectAttemptsRef.current);
        }
      });

      socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: error.message || 'Connection failed'
        }));
      });

      // CodeCraft specific events
      socket.on('user_count', (count: number) => {
        setState(prev => ({ ...prev, connectedUsers: count }));
      });

      socket.on('room_users', (users: string[]) => {
        setState(prev => ({ ...prev, roomUsers: users }));
      });

      socket.on('message', (message: any) => {
        setState(prev => ({ ...prev, lastMessage: message }));
      });

      socket.on('code_update', (data: any) => {
        setState(prev => ({ ...prev, lastMessage: { type: 'code_update', data } }));
      });

      socket.on('match_found', (matchData: any) => {
        setState(prev => ({ ...prev, lastMessage: { type: 'match_found', data: matchData } }));
      });

      socket.on('competition_update', (update: any) => {
        setState(prev => ({ ...prev, lastMessage: { type: 'competition_update', data: update } }));
      });

    } catch (error) {
      console.error('Failed to create socket connection:', error);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: 'Failed to initialize connection'
      }));
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setState(prev => ({
      ...prev,
      socket: null,
      isConnected: false,
      isConnecting: false
    }));
  };

  const emit = (event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
      return true;
    }
    return false;
  };

  const joinRoom = (roomId: string, userData?: any) => {
    return emit('join_room', { roomId, userData });
  };

  const leaveRoom = (roomId: string) => {
    return emit('leave_room', { roomId });
  };

  const sendCode = (roomId: string, code: string, language: string = 'cpp') => {
    return emit('code_update', { roomId, code, language, timestamp: Date.now() });
  };

  const findMatch = (gameMode: string, difficulty?: string) => {
    return emit('find_match', { gameMode, difficulty, timestamp: Date.now() });
  };

  const cancelMatchmaking = () => {
    return emit('cancel_matchmaking');
  };

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [url, autoConnect]);

  return {
    ...state,
    connect,
    disconnect,
    emit,
    joinRoom,
    leaveRoom,
    sendCode,
    findMatch,
    cancelMatchmaking,
    isOnline: state.isConnected
  };
};