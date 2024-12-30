import { Manager } from "./Manager";
import { Node, NodeStats } from "./Node";
import { Player, Track, UnresolvedTrack } from "./Player";
import { Queue } from "./Queue";
export declare const TRACK_SYMBOL: unique symbol;
export declare const UNRESOLVED_TRACK_SYMBOL: unique symbol;
export declare const SIZES: readonly ["0", "1", "2", "3", "default", "mqdefault", "hqdefault", "maxresdefault"];
export declare class TrackUtils {
    static trackPartial: string[] | null;
    private static manager;
    static init(manager: Manager): void;
    static setTrackPartial(partial: string[]): void;
    static validate(trackOrTracks: unknown): boolean;
    static isTrack(track: unknown): boolean;
    static isUnresolvedTrack(track: unknown): boolean;
    static build(data: TrackData, requester?: unknown): Track;
    static buildUnresolved(query: string | UnresolvedQuery, requester?: unknown): UnresolvedTrack;
    static getClosestTrack(unresolvedTrack: UnresolvedTrack): Promise<Track>;
}
export declare abstract class Structure {
    static extend<K extends keyof Extendable, T extends Extendable[K]>(name: K, extender: (target: Extendable[K]) => T): T;
    static get<K extends keyof Extendable>(name: K): Extendable[K];
}
export declare class Plugin {
    load(manager: Manager): void;
    unload(manager: Manager): void;
}
export interface UnresolvedQuery {
    title: string;
    author?: string;
    duration?: number;
}
export type Sizes = "0" | "1" | "2" | "3" | "default" | "mqdefault" | "hqdefault" | "maxresdefault";
export type LoadType = "track" | "playlist" | "search" | "empty" | "error";
export type State = "CONNECTED" | "CONNECTING" | "DISCONNECTED" | "DISCONNECTING" | "DESTROYING" | "MOVING" | "RESUMING";
export type PlayerEvents = TrackStartEvent | TrackEndEvent | TrackStuckEvent | TrackExceptionEvent | WebSocketClosedEvent;
export type PlayerEventType = "TrackStartEvent" | "TrackEndEvent" | "TrackExceptionEvent" | "TrackStuckEvent" | "WebSocketClosedEvent";
export type TrackEndReason = "finished" | "loadFailed" | "stopped" | "replaced" | "cleanup";
export type Severity = "common" | "suspicious" | "fault";
export interface TrackData {
    encoded: string;
    info: TrackDataInfo;
    pluginInfo: object;
}
export interface TrackDataInfo {
    identifier: string;
    isSeekable: boolean;
    author: string;
    length: number;
    isStream: boolean;
    title: string;
    uri?: string;
    artworkUrl?: string;
    sourceName?: string;
}
export interface Extendable {
    Player: typeof Player;
    Queue: typeof Queue;
    Node: typeof Node;
}
export interface VoiceState {
    op: "voiceUpdate";
    guildId: string;
    event: VoiceServer;
    sessionId?: string;
}
export interface VoiceServer {
    token: string;
    guild_id: string;
    endpoint: string;
}
export interface VoiceState {
    guild_id: string;
    user_id: string;
    session_id: string;
    channel_id: string;
}
export interface VoicePacket {
    t?: "VOICE_SERVER_UPDATE" | "VOICE_STATE_UPDATE";
    d: VoiceState | VoiceServer;
}
export interface NodeMessage extends NodeStats {
    type: PlayerEventType;
    op: "stats" | "playerUpdate" | "event";
    guildId: string;
}
export interface PlayerEvent {
    op: "event";
    type: PlayerEventType;
    guildId: string;
}
export interface Exception {
    message: string;
    severity: Severity;
    cause: string;
}
export interface TrackStartEvent extends PlayerEvent {
    type: "TrackStartEvent";
    track: TrackData;
}
export interface TrackEndEvent extends PlayerEvent {
    type: "TrackEndEvent";
    track: TrackData;
    reason: TrackEndReason;
}
export interface TrackExceptionEvent extends PlayerEvent {
    exception?: Exception;
    guildId: string;
    type: "TrackExceptionEvent";
}
export interface TrackStuckEvent extends PlayerEvent {
    type: "TrackStuckEvent";
    thresholdMs: number;
}
export interface WebSocketClosedEvent extends PlayerEvent {
    type: "WebSocketClosedEvent";
    code: number;
    reason: string;
    byRemote: boolean;
}
export interface PlayerUpdate {
    op: "playerUpdate";
    guildId: string;
    state: {
        time: number;
        position: number;
        connected: boolean;
        ping: number;
    };
}
//# sourceMappingURL=Utils.d.ts.map