"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { API_HUBS } from '@/core/config/api';

interface SignalRContextType {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
  joinWorkspace: (workspaceId: string) => Promise<void>;
  leaveWorkspace: (workspaceId: string) => Promise<void>;
}

const SignalRContext = createContext<SignalRContextType>({
  connection: null,
  isConnected: false,
  joinWorkspace: async () => {},
  leaveWorkspace: async () => {},
});

export const useSignalR = () => useContext(SignalRContext);

export const SignalRProvider = ({ children }: { children: React.ReactNode }) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // URL do backend - ajustar conforme ambiente
    const hubUrl = `${API_HUBS}/arc`;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        // Se precisar de token JWT:
        // accessTokenFactory: () => localStorage.getItem('auth_token') || ''
        withCredentials: true
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log('SignalR Connected');
          setIsConnected(true);
        })
        .catch((err) => console.error('SignalR Connection Error: ', err));

      return () => {
        connection.stop();
      };
    }
  }, [connection]);

  const joinWorkspace = async (workspaceId: string) => {
    if (connection && isConnected) {
      try {
        await connection.invoke('JoinWorkspace', workspaceId);
      } catch (err) {
        console.error('Error joining workspace:', err);
      }
    }
  };

  const leaveWorkspace = async (workspaceId: string) => {
    if (connection && isConnected) {
      try {
        await connection.invoke('LeaveWorkspace', workspaceId);
      } catch (err) {
        console.error('Error leaving workspace:', err);
      }
    }
  };

  return (
    <SignalRContext.Provider value={{ connection, isConnected, joinWorkspace, leaveWorkspace }}>
      {children}
    </SignalRContext.Provider>
  );
};
