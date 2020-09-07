import { asyncLocalStorage } from '..';
import { IBroker, IBrokerNode } from './IBroker';
import { EventSignatures } from '../lib/Events';

export interface IServiceContext {
	id: string; // Context ID
	broker: IBroker; // Instance of the broker.
	nodeID: string | null; // The caller or target Node ID.
	// action: Object; // Instance of action definition.
	// event: Object; // Instance of event definition.
	// eventName: Object; // The emitted event name.
	// eventType: String; // Type of event (“emit” or “broadcast”).
	// eventGroups: Array; // String>	Groups of event.
	// caller: String; // Service full name of the caller. E.g.: v3.myService
	requestID: string | null; // Request ID. If you make nested-calls, it will be the same ID.
	// parentID: String; // Parent context ID (in nested-calls).
	// params: Any; // Request params. Second argument from broker.call.
	// meta: Any; // Request metadata. It will be also transferred to nested-calls.
	// locals: any; // Local data.
	// level: Number; // Request level (in nested-calls). The first level is 1.
	// span: Span; // Current active span.
}

export interface IServiceClass {
	getName(): string;
	onNodeConnected?({ node, reconnected }: {node: IBrokerNode; reconnected: boolean}): void;
	onNodeUpdated?({ node }: {node: IBrokerNode }): void;
	onNodeDisconnected?({ node, unexpected }: {node: IBrokerNode; unexpected: boolean}): Promise<void>;

	created?(): Promise<void>;
	started?(): Promise<void>;
	stopped?(): Promise<void>;
}

export abstract class ServiceClass implements IServiceClass {
	protected name: string;

	protected events = new Map<string, Function>();

	getName(): string {
		return this.name;
	}

	get context(): IServiceContext | undefined {
		return asyncLocalStorage.getStore();
	}

	protected onEvent<T extends keyof EventSignatures>(event: T, handler: EventSignatures[T]): void {
		if (this.events.has(event)) {
			throw new Error('event already registered');
		}

		this.events.set(event, handler);
	}
}
