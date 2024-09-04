import { EventEmitter } from 'node:events';
import type { ComponentConstructor } from '../interfaces/defines.mjs';
import type { Component } from '../component/Component.mjs';
import { initLogger, logErr, logger } from '../logger/Logger.mjs';

export class Server {
	readonly eventEmitter = new EventEmitter();
	private components = new Map<new () => Component, Component>();
	constructor(
		public readonly serverType: string,
		public readonly uuid: number,
	) {
		initLogger(this.name);
	}

	get name() {
		return `${this.serverType}-${String(this.uuid)}`;
	}
	/**
	 * get component
	 * @param classConstructor
	 * @returns
	 */
	getComponent<T extends Component>(
		classConstructor: ComponentConstructor<T>,
	): T | undefined {
		return this.components.get(classConstructor) as T;
	}

	addComponent<T extends Component>(classConstructor: ComponentConstructor<T>) {
		const comp = new classConstructor(this);
		this.components.set(classConstructor, comp);
		return comp;
	}

	async start() {
		for (const pair of this.components) {
			const comp = pair[1];
			try {
				await comp.init?.call(comp);
			} catch (e) {
				logErr(e);
			}
		}

		for (const pair of this.components) {
			const comp = pair[1];
			try {
				await comp.start?.call(comp);
			} catch (e) {
				logErr(e);
			}
		}

		process.on('SIGTERM', this.exit);
		process.on('SIGINT', this.exit);
	}

	/**
	 * have to be tested under k8s
	 */
	private exit = () => {
		this.shutdown()
			.then(() => {
				logger.info(`${this.name} is about to die peacefully...`);
				process.exit(0);
			})
			.catch(() => {
				logErr(`${this.name} was killed`);
				process.exit(1);
			});
	};

	async shutdown() {
		process.off('SIGTERM', this.exit);
		process.off('SIGINT', this.exit);
		const promises: Promise<unknown>[] = [];
		for (const pair of this.components) {
			const comp = pair[1];
			if (typeof comp.dispose !== 'function') continue;
			promises.push(
				comp.dispose.call(comp).catch((e: unknown) => {
					logErr(e);
					return Promise.resolve(e);
				}),
			);
		}
		const results = await Promise.all(promises);
		if (results.some((r) => r instanceof Error)) {
			throw new Error('some components failed to dispose');
		}
	}
}
