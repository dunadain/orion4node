import * as $protobuf from "protobufjs";
import Long = require("long");
/** Represents a Greeter */
export class Greeter extends $protobuf.rpc.Service {

    /**
     * Constructs a new Greeter service.
     * @param rpcImpl RPC implementation
     * @param [requestDelimited=false] Whether requests are length-delimited
     * @param [responseDelimited=false] Whether responses are length-delimited
     */
    constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

    /**
     * Creates new Greeter service using the specified rpc implementation.
     * @param rpcImpl RPC implementation
     * @param [requestDelimited=false] Whether requests are length-delimited
     * @param [responseDelimited=false] Whether responses are length-delimited
     * @returns RPC service. Useful where requests and/or responses are streamed.
     */
    public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): Greeter;

    /**
     * Calls SayHello.
     * @param request HelloRequest message or plain object
     * @param callback Node-style callback called with the error, if any, and HelloReply
     */
    public sayHello(request: IHelloRequest, callback: Greeter.SayHelloCallback): void;

    /**
     * Calls SayHello.
     * @param request HelloRequest message or plain object
     * @returns Promise
     */
    public sayHello(request: IHelloRequest): Promise<HelloReply>;

    /**
     * Calls Bar.
     * @param request Empty message or plain object
     * @param callback Node-style callback called with the error, if any, and Empty
     */
    public bar(request: google.protobuf.IEmpty, callback: Greeter.BarCallback): void;

    /**
     * Calls Bar.
     * @param request Empty message or plain object
     * @returns Promise
     */
    public bar(request: google.protobuf.IEmpty): Promise<google.protobuf.Empty>;
}

export namespace Greeter {

    /**
     * Callback as used by {@link Greeter#sayHello}.
     * @param error Error, if any
     * @param [response] HelloReply
     */
    type SayHelloCallback = (error: (Error|null), response?: HelloReply) => void;

    /**
     * Callback as used by {@link Greeter#bar}.
     * @param error Error, if any
     * @param [response] Empty
     */
    type BarCallback = (error: (Error|null), response?: google.protobuf.Empty) => void;
}

/** Properties of a HelloRequest. */
export interface IHelloRequest {

    /** HelloRequest name */
    name?: (string|null);
}

/** Represents a HelloRequest. */
export class HelloRequest implements IHelloRequest {

    /**
     * Constructs a new HelloRequest.
     * @param [properties] Properties to set
     */
    constructor(properties?: IHelloRequest);

    /** HelloRequest name. */
    public name: string;

    /**
     * Creates a new HelloRequest instance using the specified properties.
     * @param [properties] Properties to set
     * @returns HelloRequest instance
     */
    public static create(properties?: IHelloRequest): HelloRequest;

    /**
     * Encodes the specified HelloRequest message. Does not implicitly {@link HelloRequest.verify|verify} messages.
     * @param message HelloRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IHelloRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified HelloRequest message, length delimited. Does not implicitly {@link HelloRequest.verify|verify} messages.
     * @param message HelloRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IHelloRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a HelloRequest message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns HelloRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): HelloRequest;

    /**
     * Decodes a HelloRequest message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns HelloRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): HelloRequest;

    /**
     * Verifies a HelloRequest message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a HelloRequest message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns HelloRequest
     */
    public static fromObject(object: { [k: string]: any }): HelloRequest;

    /**
     * Creates a plain object from a HelloRequest message. Also converts values to other types if specified.
     * @param message HelloRequest
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: HelloRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this HelloRequest to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for HelloRequest
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a HelloReply. */
export interface IHelloReply {

    /** HelloReply message */
    message?: (string|null);
}

/** Represents a HelloReply. */
export class HelloReply implements IHelloReply {

    /**
     * Constructs a new HelloReply.
     * @param [properties] Properties to set
     */
    constructor(properties?: IHelloReply);

    /** HelloReply message. */
    public message: string;

    /**
     * Creates a new HelloReply instance using the specified properties.
     * @param [properties] Properties to set
     * @returns HelloReply instance
     */
    public static create(properties?: IHelloReply): HelloReply;

    /**
     * Encodes the specified HelloReply message. Does not implicitly {@link HelloReply.verify|verify} messages.
     * @param message HelloReply message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IHelloReply, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified HelloReply message, length delimited. Does not implicitly {@link HelloReply.verify|verify} messages.
     * @param message HelloReply message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IHelloReply, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a HelloReply message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns HelloReply
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): HelloReply;

    /**
     * Decodes a HelloReply message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns HelloReply
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): HelloReply;

    /**
     * Verifies a HelloReply message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a HelloReply message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns HelloReply
     */
    public static fromObject(object: { [k: string]: any }): HelloReply;

    /**
     * Creates a plain object from a HelloReply message. Also converts values to other types if specified.
     * @param message HelloReply
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: HelloReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this HelloReply to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for HelloReply
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents an Attacker */
export class Attacker extends $protobuf.rpc.Service {

    /**
     * Constructs a new Attacker service.
     * @param rpcImpl RPC implementation
     * @param [requestDelimited=false] Whether requests are length-delimited
     * @param [responseDelimited=false] Whether responses are length-delimited
     */
    constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

    /**
     * Creates new Attacker service using the specified rpc implementation.
     * @param rpcImpl RPC implementation
     * @param [requestDelimited=false] Whether requests are length-delimited
     * @param [responseDelimited=false] Whether responses are length-delimited
     * @returns RPC service. Useful where requests and/or responses are streamed.
     */
    public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): Attacker;

    /**
     * Calls Attack.
     * @param request AttackRequest message or plain object
     * @param callback Node-style callback called with the error, if any, and AttackReply
     */
    public attack(request: IAttackRequest, callback: Attacker.AttackCallback): void;

    /**
     * Calls Attack.
     * @param request AttackRequest message or plain object
     * @returns Promise
     */
    public attack(request: IAttackRequest): Promise<AttackReply>;
}

export namespace Attacker {

    /**
     * Callback as used by {@link Attacker#attack}.
     * @param error Error, if any
     * @param [response] AttackReply
     */
    type AttackCallback = (error: (Error|null), response?: AttackReply) => void;
}

/** Properties of an AttackRequest. */
export interface IAttackRequest {

    /** AttackRequest name */
    name?: (string|null);
}

/** Represents an AttackRequest. */
export class AttackRequest implements IAttackRequest {

    /**
     * Constructs a new AttackRequest.
     * @param [properties] Properties to set
     */
    constructor(properties?: IAttackRequest);

    /** AttackRequest name. */
    public name: string;

    /**
     * Creates a new AttackRequest instance using the specified properties.
     * @param [properties] Properties to set
     * @returns AttackRequest instance
     */
    public static create(properties?: IAttackRequest): AttackRequest;

    /**
     * Encodes the specified AttackRequest message. Does not implicitly {@link AttackRequest.verify|verify} messages.
     * @param message AttackRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IAttackRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified AttackRequest message, length delimited. Does not implicitly {@link AttackRequest.verify|verify} messages.
     * @param message AttackRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IAttackRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an AttackRequest message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns AttackRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): AttackRequest;

    /**
     * Decodes an AttackRequest message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns AttackRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): AttackRequest;

    /**
     * Verifies an AttackRequest message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates an AttackRequest message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns AttackRequest
     */
    public static fromObject(object: { [k: string]: any }): AttackRequest;

    /**
     * Creates a plain object from an AttackRequest message. Also converts values to other types if specified.
     * @param message AttackRequest
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: AttackRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this AttackRequest to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for AttackRequest
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of an AttackReply. */
export interface IAttackReply {

    /** AttackReply message */
    message?: (string|null);
}

/** Represents an AttackReply. */
export class AttackReply implements IAttackReply {

    /**
     * Constructs a new AttackReply.
     * @param [properties] Properties to set
     */
    constructor(properties?: IAttackReply);

    /** AttackReply message. */
    public message: string;

    /**
     * Creates a new AttackReply instance using the specified properties.
     * @param [properties] Properties to set
     * @returns AttackReply instance
     */
    public static create(properties?: IAttackReply): AttackReply;

    /**
     * Encodes the specified AttackReply message. Does not implicitly {@link AttackReply.verify|verify} messages.
     * @param message AttackReply message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IAttackReply, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified AttackReply message, length delimited. Does not implicitly {@link AttackReply.verify|verify} messages.
     * @param message AttackReply message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IAttackReply, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an AttackReply message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns AttackReply
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): AttackReply;

    /**
     * Decodes an AttackReply message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns AttackReply
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): AttackReply;

    /**
     * Verifies an AttackReply message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates an AttackReply message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns AttackReply
     */
    public static fromObject(object: { [k: string]: any }): AttackReply;

    /**
     * Creates a plain object from an AttackReply message. Also converts values to other types if specified.
     * @param message AttackReply
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: AttackReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this AttackReply to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for AttackReply
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Namespace google. */
export namespace google {

    /** Namespace protobuf. */
    namespace protobuf {

        /** Properties of an Empty. */
        interface IEmpty {
        }

        /** Represents an Empty. */
        class Empty implements IEmpty {

            /**
             * Constructs a new Empty.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IEmpty);

            /**
             * Creates a new Empty instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Empty instance
             */
            public static create(properties?: google.protobuf.IEmpty): google.protobuf.Empty;

            /**
             * Encodes the specified Empty message. Does not implicitly {@link google.protobuf.Empty.verify|verify} messages.
             * @param message Empty message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IEmpty, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Empty message, length delimited. Does not implicitly {@link google.protobuf.Empty.verify|verify} messages.
             * @param message Empty message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IEmpty, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Empty message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Empty
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Empty;

            /**
             * Decodes an Empty message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Empty
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Empty;

            /**
             * Verifies an Empty message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Empty message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Empty
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.Empty;

            /**
             * Creates a plain object from an Empty message. Also converts values to other types if specified.
             * @param message Empty
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.Empty, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Empty to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Empty
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}
