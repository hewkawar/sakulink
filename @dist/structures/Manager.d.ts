import { LoadType, Plugin, TrackData, TrackEndEvent, TrackExceptionEvent, TrackStartEvent, TrackStuckEvent, VoicePacket, VoiceServer, WebSocketClosedEvent } from "./Utils";
import { Collection } from "@discordjs/collection";
import { EventEmitter } from "events";
import { Node, NodeOptions } from "./Node";
import { Player, PlayerOptions, Track, UnresolvedTrack } from "./Player";
import { VoiceState } from "..";
import { Database } from "../utils/Database";
export declare const REQUIRED_KEYS: string[];
export declare const REQUIRED_PAYLOAD_KEYS: string[];
export interface Manager {
    on(event: "nodeCreate", listener: (node: Node) => void): this;
    on(event: "nodeDestroy", listener: (node: Node) => void): this;
    on(event: "nodeConnect", listener: (node: Node) => void): this;
    on(event: "nodeReconnect", listener: (node: Node) => void): this;
    on(event: "nodeDisconnect", listener: (node: Node, reason: {
        code?: number;
        reason?: string;
    }) => void): this;
    on(event: "nodeError", listener: (node: Node, error: Error) => void): this;
    on(event: "nodeRaw", listener: (payload: unknown) => void): this;
    on(event: "playerCreate", listener: (player: Player) => void): this;
    on(event: "playerDestroy", listener: (player: Player) => void): this;
    on(event: "queueEnd", listener: (player: Player, track: Track | UnresolvedTrack, payload: TrackEndEvent) => void): this;
    on(event: "playerMove", listener: (player: Player, initChannel: string, newChannel: string) => void): this;
    on(event: "playerDisconnect", listener: (player: Player, oldChannel: string) => void): this;
    on(event: "trackStart", listener: (player: Player, track: Track, payload: TrackStartEvent) => void): this;
    on(event: "trackEnd", listener: (player: Player, track: Track, payload: TrackEndEvent) => void): this;
    on(event: "trackStuck", listener: (player: Player, track: Track, payload: TrackStuckEvent) => void): this;
    on(event: "trackError", listener: (player: Player, track: Track | UnresolvedTrack, payload: TrackExceptionEvent) => void): this;
    on(event: "socketClosed", listener: (player: Player, payload: WebSocketClosedEvent) => void): this;
}
export declare class Manager extends EventEmitter {
    static readonly DEFAULT_SOURCES: Record<SearchPlatform, string>;
    readonly players: Collection<string, Player>;
    readonly nodes: Collection<string, Node>;
    readonly options: ManagerOptions;
    db: Database;
    private initiated;
    get leastUsedNodes(): Collection<string, Node>;
    get leastLoadNodes(): Collection<string, Node>;
    constructor(options: ManagerOptions);
    init(clientId?: string): this;
    search(query: string | SearchQuery, requester?: unknown): Promise<SearchResult>;
    decodeTracks(tracks: string[]): Promise<TrackData[]>;
    decodeTrack(track: string): Promise<TrackData>;
    create(options: PlayerOptions): Player;
    get(guild: string): Player | undefined;
    destroy(guild: string): void;
    createNode(options: NodeOptions): Node;
    destroyNode(identifier: string): void;
    updateVoiceState(data: VoicePacket | VoiceServer | VoiceState): Promise<void>;
}
export interface Payload {
    op: number;
    d: {
        guild_id: string;
        channel_id: string | null;
        self_mute: boolean;
        self_deaf: boolean;
    };
}
export interface ManagerOptions {
    nodes?: NodeOptions[];
    clientId?: string;
    clientName?: string;
    shards?: number;
    plugins?: Plugin[];
    autoPlay?: boolean;
    trackPartial?: string[];
    defaultSearchPlatform?: SearchPlatform;
    autoMove?: boolean;
    autoResume?: boolean;
    send(id: string, payload: Payload): void;
}
export type SearchPlatform = "deezer" | "soundcloud" | "youtube music" | "youtube";
export interface SearchQuery {
    source?: SearchPlatform | string;
    query: string;
}
export interface LavalinkResponse {
    loadType: LoadType;
    data: TrackData[] | PlaylistRawData;
}
export interface SearchResult {
    loadType: LoadType;
    tracks: Track[];
    playlist?: PlaylistData;
}
export interface PlaylistRawData {
    info: {
        name: string;
    };
    pluginInfo: {
        url: string;
    };
    tracks: TrackData[];
}
export interface PlaylistData {
    name: string;
    duration: number;
    tracks: Track[];
    url: string;
}
//# sourceMappingURL=Manager.d.ts.map