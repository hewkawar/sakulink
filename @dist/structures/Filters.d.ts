import { Band } from "../utils/FiltersEqualizers";
import { Player } from "./Player";
export declare class Filters {
    distortion: distortionOptions | null;
    equalizer: Band[];
    karaoke: karaokeOptions | null;
    player: Player;
    rotation: rotationOptions | null;
    timescale: timescaleOptions | null;
    vibrato: vibratoOptions | null;
    volume: number;
    private filterStatus;
    constructor(player: Player);
    updateFilters(): Promise<this>;
    private applyFilter;
    private setFilterStatus;
    setEqualizer(bands?: Band[]): this;
    eightD(): this;
    bassBoost(): this;
    nightcore(): this;
    slowmo(): this;
    soft(): this;
    tv(): this;
    trebleBass(): this;
    vaporwave(): this;
    distort(): this;
    setKaraoke(karaoke?: karaokeOptions): this;
    setTimescale(timescale?: timescaleOptions): this;
    setVibrato(vibrato?: vibratoOptions): this;
    setRotation(rotation?: rotationOptions): this;
    setDistortion(distortion?: distortionOptions): this;
    clearFilters(): Promise<this>;
    getFilterStatus(filter: keyof availableFilters): boolean;
}
interface timescaleOptions {
    speed?: number;
    pitch?: number;
    rate?: number;
}
interface vibratoOptions {
    frequency: number;
    depth: number;
}
interface rotationOptions {
    rotationHz: number;
}
interface karaokeOptions {
    level?: number;
    monoLevel?: number;
    filterBand?: number;
    filterWidth?: number;
}
interface distortionOptions {
    sinOffset?: number;
    sinScale?: number;
    cosOffset?: number;
    cosScale?: number;
    tanOffset?: number;
    tanScale?: number;
    offset?: number;
    scale?: number;
}
interface availableFilters {
    bassboost: boolean;
    distort: boolean;
    eightD: boolean;
    karaoke: boolean;
    nightcore: boolean;
    slowmo: boolean;
    soft: boolean;
    trebleBass: boolean;
    tv: boolean;
    vaporwave: boolean;
}
export {};
//# sourceMappingURL=Filters.d.ts.map