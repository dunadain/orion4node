/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Component } from '../component/Component';
import * as path from 'node:path';
import * as fs from 'fs/promises';
import { existsSync } from 'node:fs';
import { addRpcCall } from '../rpc/RpcUtils';
import { logErr } from '../logger/Logger';

/**
 * load handler files and rpc files
 */
export class FileLoader extends Component {
	async init() {
		if (!require.main) return;
		const handlerDir = path.join(require.main.path, 'handler');
		let handlerPromise: Promise<unknown> = Promise.resolve();
		let rpcPromise: Promise<unknown> = Promise.resolve();
		if (existsSync(handlerDir)) {
			handlerPromise = fs
				.readdir(handlerDir)
				.then((list) => {
					// const promises: Promise<unknown>[] = [];
					for (const fileName of list) {
						const filePath = path.join(handlerDir, fileName);
						require(filePath);
					}
					// return Promise.all(promises);
				})
				.catch((e: unknown) => {
					logErr(e);
				});
		}
		const remoteDir = path.join(require.main.path, 'remote');
		if (existsSync(remoteDir)) {
			rpcPromise = fs
				.readdir(remoteDir)
				.then((list) => {
					const promises: Promise<unknown>[] = [];
					for (const fileName of list) {
						promises.push(
							import(path.join(remoteDir, fileName)).then((m) => {
								for (const className in m) {
									const prototype = m[className].prototype;
									const propNames = Object.getOwnPropertyNames(prototype);
									for (const key of propNames) {
										if (key === 'constructor') continue;
										if (typeof prototype[key] === 'function') {
											// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
											addRpcCall(`${className}.${key}`, prototype[key]);
										}
									}
								}
							}),
						);
					}
					return Promise.all(promises);
				})
				.catch((e: unknown) => {
					logErr(e);
				});
		}
		await Promise.all([handlerPromise, rpcPromise]);
	}
}
