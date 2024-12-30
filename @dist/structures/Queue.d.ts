import { Track, UnresolvedTrack } from "./Player";
export declare class Queue extends Array<Track | UnresolvedTrack> {
    current: Track | UnresolvedTrack | null;
    previous: Track | UnresolvedTrack | null;
    get totalSize(): number;
    get size(): number;
    get duration(): number;
    add(track: (Track | UnresolvedTrack) | (Track | UnresolvedTrack)[], offset?: number): void;
    remove(position?: number): (Track | UnresolvedTrack)[];
    remove(start: number, end: number): (Track | UnresolvedTrack)[];
    clear(): void;
    shuffle(): void;
}
//# sourceMappingURL=Queue.d.ts.map