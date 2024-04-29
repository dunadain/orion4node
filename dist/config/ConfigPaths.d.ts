declare class ConfigPaths {
    /**
     * first find the configs directory in ./ then in ../ then in ../../
     */
    get nats(): string;
    private getConfigDir;
}
export declare const configPaths: ConfigPaths;
export {};
