import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setIsConnected(true);
        reconnectCountRef.current = 0;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          setLastMessage(message);
          onMessage?.(message);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        onDisconnect?.();

        // Attempt reconnection
        if (reconnectCountRef.current < reconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectCountRef.current += 1;
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [url, onMessage, onConnect, onDisconnect, onError, reconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    disconnect,
    reconnect: connect,
  };
}

// Mock WebSocket hook for development (simulates real-time data)
export function useMockWebSocket() {
  const [isConnected, setIsConnected] = useState(true);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Simulate real-time updates
    intervalRef.current = setInterval(() => {
      const eventTypes = [
        'new_user',
        'new_listing',
        'new_exchange',
        'exchange_completed',
        'payment_received',
        'user_online',
      ];

      const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];

      const mockMessage: WebSocketMessage = {
        type: randomEvent,
        payload: generateMockPayload(randomEvent),
        timestamp: new Date().toISOString(),
      };

      setLastMessage(mockMessage);
    }, 5000); // Update every 5 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    lastMessage,
    sendMessage: () => {},
    disconnect: () => setIsConnected(false),
    reconnect: () => setIsConnected(true),
  };
}

function generateMockPayload(eventType: string): any {
  const names = ['Kwame', 'Ama', 'Kofi', 'Akua', 'Yaw', 'Efua', 'Kojo', 'Abena'];
  const lastNames = ['Mensah', 'Darko', 'Asante', 'Boateng', 'Agyei', 'Owusu', 'Osei', 'Adjei'];
  const books = [
    'Things Fall Apart',
    'Half of a Yellow Sun',
    'Americanah',
    'Purple Hibiscus',
    'Homegoing',
    'Ghana Must Go',
  ];
  const cities = ['Accra', 'Kumasi', 'Tamale', 'Bolgatanga', 'Cape Coast', 'Takoradi'];

  const randomName = `${names[Math.floor(Math.random() * names.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  const randomBook = books[Math.floor(Math.random() * books.length)];
  const randomCity = cities[Math.floor(Math.random() * cities.length)];

  switch (eventType) {
    case 'new_user':
      return {
        id: `user-${Date.now()}`,
        name: randomName,
        city: randomCity,
      };
    case 'new_listing':
      return {
        id: `listing-${Date.now()}`,
        book_title: randomBook,
        owner: randomName,
        city: randomCity,
      };
    case 'new_exchange':
      return {
        id: `exchange-${Date.now()}`,
        book_title: randomBook,
        initiator: randomName,
        type: Math.random() > 0.5 ? 'swap' : 'purchase',
      };
    case 'exchange_completed':
      return {
        id: `exchange-${Date.now()}`,
        book_title: randomBook,
        participants: [randomName, `${names[Math.floor(Math.random() * names.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`],
      };
    case 'payment_received':
      return {
        id: `payment-${Date.now()}`,
        amount: Math.floor(Math.random() * 50) + 10,
        currency: 'GH₵',
        from: randomName,
      };
    case 'user_online':
      return {
        id: `user-${Date.now()}`,
        name: randomName,
        city: randomCity,
      };
    default:
      return {};
  }
}
