import type { ClientMovePayload, ClientRegisterPayload } from '../schemas/websocket-message.schema';
import { ClientsStore } from '../store/clients.store';
import type { ClientMarker } from '../types';
import { generateUuid } from '../utils/generate-uuid';

class ClientService {
    private readonly clientStore: ClientsStore;

    constructor() {
        this.clientStore = new ClientsStore();
    }

    getAllClients() {
        return this.clientStore.getAll();
    }

    registerClient(input: ClientRegisterPayload): { error: string } | ClientMarker {
        if (this.clientStore.hasClient(input.clientId)) {
            return { error: 'Client already registered' };
        }
        const client: ClientMarker = {
            ...input,
            updatedAt: Date.now(),
            color: input.color || 'gray',
        };
        this.clientStore.add(client);
        return client;
    }

    clientMoved(clientId: string, input: ClientMovePayload): ClientMarker | { error: string } {
        const client = this.clientStore.getById(clientId);

        if (!client) {
            return { error: 'Client not found' };
        }

        const updatedClient = this.clientStore.updateCoords(clientId, input.coords);

        if (!updatedClient) {
            return { error: 'Failed to update client coordinates' };
        }

        return updatedClient!;
    }

    removeClient(clientId: string) {
        return this.clientStore.remove(clientId);
    }
}



export const clientService = new ClientService();
