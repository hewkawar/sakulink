type Data = Record<string, any>;
export declare class Database {
    data: Data;
    id: string;
    shards: number;
    constructor(clientId: string, shards: number);
    set<T>(key: string, value: T): void;
    get<T>(key: string): T | undefined;
    push<T>(key: string, value: T): void;
    delete(key: string): boolean;
    private updateData;
    private getFilePath;
    fetch(): void;
    private save;
}
export {};
//# sourceMappingURL=Database.d.ts.map