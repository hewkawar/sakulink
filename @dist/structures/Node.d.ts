import { PlayerEvent, PlayerEvents, TrackEndEvent, TrackExceptionEvent, TrackStartEvent, TrackStuckEvent, WebSocketClosedEvent } from "./Utils";
import { Manager } from "./Manager";
import { Player, Track, UnresolvedTrack } from "./Player";
import WebSocket from "ws";
import { V4RestHandler } from "./rest/V4RestHandler";
import { V3RestHandler } from "./rest/V3RestHandler";
export declare class Node {
    options: NodeOptions;
    readonly rest: V4RestHandler | V3RestHandler;
    private static _manager;
    socket: WebSocket | null;
    calls: number;
    stats: NodeStats;
    manager: Manager;
    sessionId: string | null;
    private reconnectTimeout?;
    private reconnectAttempts;
    private lastWSMessage;
    get connected(): boolean;
    get address(): string;
    static init(manager: Manager): void;
    constructor(options: NodeOptions);
    connect(): void;
    destroy(): void;
    private reconnect;
    protected open(): void;
    protected close(code: number, reason: string): void;
    protected error(error: Error): void;
    protected message(d: Buffer | string): Promise<void>;
    protected handleEvent(payload: PlayerEvent & PlayerEvents): void;
    protected trackStart(player: Player, track: Track, payload: TrackStartEvent): void;
    protected trackEnd(player: Player, track: Track, payload: TrackEndEvent): Promise<void>;
    protected queueEnd(player: Player, track: Track, payload: TrackEndEvent): Promise<void>;
    protected trackStuck(player: Player, track: Track, payload: TrackStuckEvent): void;
    protected trackError(player: Player, track: Track | UnresolvedTrack, payload: TrackExceptionEvent): void;
    protected socketClosed(player: Player, payload: WebSocketClosedEvent): void;
    private handleAutoplay;
}
export interface NodeOptions {
    host: string;
    port?: number;
    password?: string;
    secure?: boolean;
    identifier?: string;
    retryAmount?: number;
    retryDelay?: number;
    requestTimeout?: number;
    search?: boolean;
    playback?: boolean;
    version?: "v4" | "v3";
}
export interface NodeStats {
    players: number;
    playingPlayers: number;
    uptime: number;
    memory: MemoryStats;
    cpu: CPUStats;
    frameStats: FrameStats;
}
export interface MemoryStats {
    free: number;
    used: number;
    allocated: number;
    reservable: number;
}
export interface CPUStats {
    cores: number;
    systemLoad: number;
    lavalinkLoad: number;
}
export interface FrameStats {
    sent?: number;
    nulled?: number;
    deficit?: number;
}
//# sourceMappingURL=Node.d.ts.map