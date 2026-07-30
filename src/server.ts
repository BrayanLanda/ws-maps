import { SERVER_CONFIG } from './config/server-config';

import indexHtml from '../public/index.html';
import { generateUuid } from './utils/generate-uuid';
import type { WebSocketData } from './types';
import { handleMessage } from './handlers/message.handler';

export const createServer = () => {
  const server = Bun.serve<WebSocketData>({
    port: SERVER_CONFIG.port,

    routes: {
      '/': indexHtml,
    },

    fetch(req, server) {
      const cookies = new Bun.CookieMap(req.headers.get('cookie')!);
      const clientId = generateUuid();
      const name = cookies.get('name')
      const color = cookies.get('color') || 'gray';
      const coords = cookies.get('coords')
        ? JSON.parse(cookies.get('coords')!)
        : null;

      if (!name || !coords)
        return new Response('Missing required cookies (name, coord)', { status: 400 });


      const upgraded = server.upgrade(req, {
        data: { clientId, name, color, coords },
      });

      if (upgraded) {
        return undefined;
      }

      return new Response('Upgrade failed', { status: 500 });
    },
    websocket: {
      open(ws) {
        //! Una nueva conexión
        // console.log(`Cliente: ${ws.data.clientId}`);
        //! Suscribir el cliente a un canal por defecto
        // ws.subscribe(SERVER_CONFIG.defaultChannelName);
        // ! (opcional) Aquí se puede emitir el primer mensaje al cliente
        // Emitir el primer mensaje al cliente que se acaba de conectar
        // ws.send({ type: 'my_type', payload: { message: 'Some Payload' } });
        //! Emitir el mensaje a todos los clientes conectados (-1 cliente que se acaba de conectar)
        // ws.publish(SERVER_CONFIG.defaultChannelName, JSON.stringify(handleGetParties()));
      },
      message(ws, message: string) {
        //* Todos los mensajes que llegan al servidor de la misma forma
        // Se envía a un Handler General
        const response = handleMessage(message);
        const responseString = JSON.stringify(response);

        //! Envía el mensaje al cliente que lo envió
        if (response.type === 'ERROR') {
          ws.send(responseString);
          return;
        }

        //! Si el mensaje es exclusivo del cliente que lo envió (No llamar el publish)
        if (response.type === 'PERSONAL_RESPONSE_MESSAGE') {
          ws.send(responseString);
          return;
        }

        //! Si hay que enviar a todos los clientes conectados (publish + send)
        // ws.send(responseString);
        // ws.publish(SERVER_CONFIG.defaultChannelName, responseString);
      },
      close(ws, code, message) {
        //! Una vez que el cliente se desconecta, "de-suscribir" del canal por defecto
        // console.log(`Cliente desconectado: ${ws.data.clientId}`);
        ws.unsubscribe(SERVER_CONFIG.defaultChannelName);
      }, // a socket is closed
    }, // handlers
  });

  return server;
};
