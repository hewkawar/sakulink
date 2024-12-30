import { Filters } from "./Filters";
import { Manager, SearchQuery, SearchResult } from "./Manager";
import { Node } from "./Node";
import { Queue } from "./Queue";
import { Sizes, State, VoiceState } from "./Utils";
export declare class Player {
    options: PlayerOptions;
    readonly queue: Queue;
    filters: Filters;
    trackRepeat: boolean;
    queueRepeat: boolean;
    dynamicRepeat: boolean;
    position: number;
    playing: boolean;
    paused: boolean;
    volume: number;
    isAutoplay: boolean;
    node: Node;
    guild: string;
    voiceChannel: string | null;
    textChannel: string | null;
    nowPlayingMessage?: NowPlayingMessage;
    state: State;
    bands: number[];
    voiceState: VoiceState;
    manager: Manager;
    readonly data: Record<string, unknown>;
    private static _manager;
    private dynamicLoopInterval;
    set(key: string, value: unknown): void;
    get<T>(key: string): T;
    static init(manager: Manager): void;
    constructor(options: PlayerOptions);
    search(query: string | SearchQuery, requester?: unknown): Promise<SearchResult>;
    connect(): this;
    disconnect(): this;
    destroy(disconnect?: boolean): void;
    setVoiceChannel(channel: string): this;
    setTextChannel(channel: string): this;
    moveNode(node?: string): Promise<this>;
    setNowPlayingMessage(message: NowPlayingMessage): NowPlayingMessage;
    play(optionsOrTrack?: PlayOptions | Track | UnresolvedTrack, playOptions?: PlayOptions): Promise<void>;
    setVolume(volume: number): this;
    setAutoplay(state: boolean): this;
    setTrackRepeat(repeat: boolean): this;
    setQueueRepeat(repeat: boolean): this;
    setDynamicRepeat(repeat: boolean, ms: number): this;
    restart(): void;
    stop(amount?: number): this;
    pause(pause: boolean): this;
    previous(): this;
    skip(): this;
    seek(position: number): this;
    save(): void;
}
export interface PlayerOptions {
    guild: string;
    textChannel: string;
    voiceChannel?: string;
    node?: string;
    volume?: number;
    selfMute?: boolean;
    selfDeafen?: boolean;
    data?: {
        [k: string]: any;
    };
}
export interface Track {
    track: string;
    artworkUrl: string;
    sourceName: string;
    title: string;
    identifier: string;
    author: string;
    duration: number;
    isSeekable: boolean;
    isStream: boolean;
    uri: string;
    thumbnail: string | null;
    requester: unknown | null;
    displayThumbnail(size?: Sizes): string;
}
export interface UnresolvedTrack extends Partial<Track> {
    title: string;
    author?: string;
    duration?: number;
    resolve(): Promise<void>;
}
export interface PlayOptions {
    startTime?: number;
    endTime?: number;
    noReplace?: boolean;
}
export interface EqualizerBand {
    band: number;
    gain: number;
}
export interface NowPlayingMessage {
    channelId: string;
    deleted?: boolean;
    delete(): Promise<any>;
}
//# sourceMappingURL=Player.d.ts.map