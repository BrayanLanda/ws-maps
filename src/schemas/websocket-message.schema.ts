import { z } from 'zod';

const latLngSchema = z.object({
  lat: z.number('Latitude is required'),
  lng: z.number('Longitude is required'),
});

export const messageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('GET_CLIENTS'),
    payload: z.undefined().optional()
  }),
  z.object({
    type: z.literal('CLIENT_REGISTER'),
    payload: z.object({
      clientId: z.string('Client ID is required').min(1),
      name: z.string('Client name is required').min(2),
      color: z.string('Client color is required').min(1).optional(),
      coords: latLngSchema,
    })
  }),
  z.object({
    type: z.literal('CLIENT_MOVE'),
    payload: z.object({
      clientId: z.string('Client ID is required').min(1),
      coords: latLngSchema,
    })
  })
]);

export type MessageParsed = z.infer<typeof messageSchema>;
export type ClientRegisterPayload = Extract<z.infer<MessageParsed>, { type: 'CLIENT_REGISTER' }>['payload'];
export type ClientMovePayload = Extract<z.infer<MessageParsed>, { type: 'CLIENT_MOVE' }>['payload'];
export type GetClientsPayload = Extract<z.infer<MessageParsed>, { type: 'GET_CLIENTS' }>['payload'];
