import { Node } from "../Node";
export declare class V3RestHandler {
    private node;
    private sessionId;
    private readonly password;
    private readonly url;
    constructor(node: Node);
    setSessionId(sessionId: string): string;
    getAllPlayers(): Promise<unknown>;
    updatePlayer(options: {
        guildId: string;
        data: {
            encodedTrack?: string;
            identifier?: string;
            startTime?: number;
            endTime?: number;
            volume?: number;
            position?: number;
            paused?: boolean;
            filters?: object;
            voice?: {
                token: string;
                sessionId: string;
                endpoint: string;
            };
            noReplace?: boolean;
        };
    }): Promise<unknown>;
    destroyPlayer(guildId: string): Promise<unknown>;
    private request;
    get(endpoint: string): Promise<unknown>;
    patch(endpoint: string, body: unknown): Promise<unknown>;
    post(endpoint: string, body: unknown): Promise<unknown>;
    delete(endpoint: string): Promise<unknown>;
}
//# sourceMappingURL=V3RestHandler.d.ts.map