/* eslint-disable @typescript-eslint/no-explicit-any */
export declare type ComponentConstructor<T> = new (...args: any[]) => T;
export declare type AbstractedConstructor<T = unknown> = abstract new (...args: any[]) => T;
export declare type Constructor<T = unknown> = new (...args: unknown[]) => T;
