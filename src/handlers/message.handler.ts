import {
  messageSchema,
  type MessageParsed,
} from '../schemas/websocket-message.schema';
import type { OutgoingWsMessage, } from '../types';

interface HandlerResult {
  personal: OutgoingWsMessage[];
  broadcast: OutgoingWsMessage[];
}

const createErrorResponse = (error: string): OutgoingWsMessage => {
  return {
    type: 'ERROR',
    payload: { error: error },
  };
};

//! Handlers específicos
export const handleGetClients = (): HandlerResult => {
  return {
    broadcast: [],
    personal: [],
  };
}

export const handleClientRegister = (clientId: string, payload: MessageParsed['payload']): HandlerResult => {
  return {
    broadcast: [],
    personal: [],
  };
}

export const handleClientMoved = (clientId: string, payload: MessageParsed['payload']): HandlerResult => {
  return {
    broadcast: [],
    personal: [],
  };
}

//! General Handler o controlador general
export const handleMessage = (message: string): HandlerResult => {
  try {
    const jsonData: unknown = JSON.parse(message);
    const parsedResult = messageSchema.safeParse(jsonData);

    if (!parsedResult.success) {
      console.log(parsedResult.error);
      const errorMessage = parsedResult.error.issues
        .map((issue) => issue.message)
        .join(', ');

      return {
        broadcast: [],
        personal: [createErrorResponse(`Validation error: ${errorMessage}`)],
      }
    }

    const { type, payload } = parsedResult.data;

    switch (type) {
      case 'GET_CLIENTS':
        return handleGetClients();

      case 'CLIENT_REGISTER':
        return handleClientRegister(clientId, payload);

      case 'CLIENT_MOVE':
        return handleClientMoved(clientId, payload);


      default:
        return {
          broadcast: [],
          personal: [createErrorResponse(`Unknown message type: ${type}`)],
        };
      }
    } catch (error) {
      return {
        broadcast: [],
        personal: [createErrorResponse(`Unknown error found`)],
      }
    }
  };
