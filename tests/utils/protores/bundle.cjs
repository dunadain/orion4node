/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.Greeter = (function() {

    /**
     * Constructs a new Greeter service.
     * @exports Greeter
     * @classdesc Represents a Greeter
     * @extends $protobuf.rpc.Service
     * @constructor
     * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
     * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
     * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
     */
    function Greeter(rpcImpl, requestDelimited, responseDelimited) {
        $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
    }

    (Greeter.prototype = Object.create($protobuf.rpc.Service.prototype)).constructor = Greeter;

    /**
     * Creates new Greeter service using the specified rpc implementation.
     * @function create
     * @memberof Greeter
     * @static
     * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
     * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
     * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
     * @returns {Greeter} RPC service. Useful where requests and/or responses are streamed.
     */
    Greeter.create = function create(rpcImpl, requestDelimited, responseDelimited) {
        return new this(rpcImpl, requestDelimited, responseDelimited);
    };

    /**
     * Callback as used by {@link Greeter#sayHello}.
     * @memberof Greeter
     * @typedef SayHelloCallback
     * @type {function}
     * @param {Error|null} error Error, if any
     * @param {HelloReply} [response] HelloReply
     */

    /**
     * Calls SayHello.
     * @function sayHello
     * @memberof Greeter
     * @instance
     * @param {IHelloRequest} request HelloRequest message or plain object
     * @param {Greeter.SayHelloCallback} callback Node-style callback called with the error, if any, and HelloReply
     * @returns {undefined}
     * @variation 1
     */
    Object.defineProperty(Greeter.prototype.sayHello = function sayHello(request, callback) {
        return this.rpcCall(sayHello, $root.HelloRequest, $root.HelloReply, request, callback);
    }, "name", { value: "SayHello" });

    /**
     * Calls SayHello.
     * @function sayHello
     * @memberof Greeter
     * @instance
     * @param {IHelloRequest} request HelloRequest message or plain object
     * @returns {Promise<HelloReply>} Promise
     * @variation 2
     */

    /**
     * Callback as used by {@link Greeter#bar}.
     * @memberof Greeter
     * @typedef BarCallback
     * @type {function}
     * @param {Error|null} error Error, if any
     * @param {google.protobuf.Empty} [response] Empty
     */

    /**
     * Calls Bar.
     * @function bar
     * @memberof Greeter
     * @instance
     * @param {google.protobuf.IEmpty} request Empty message or plain object
     * @param {Greeter.BarCallback} callback Node-style callback called with the error, if any, and Empty
     * @returns {undefined}
     * @variation 1
     */
    Object.defineProperty(Greeter.prototype.bar = function bar(request, callback) {
        return this.rpcCall(bar, $root.google.protobuf.Empty, $root.google.protobuf.Empty, request, callback);
    }, "name", { value: "Bar" });

    /**
     * Calls Bar.
     * @function bar
     * @memberof Greeter
     * @instance
     * @param {google.protobuf.IEmpty} request Empty message or plain object
     * @returns {Promise<google.protobuf.Empty>} Promise
     * @variation 2
     */

    return Greeter;
})();

$root.HelloRequest = (function() {

    /**
     * Properties of a HelloRequest.
     * @exports IHelloRequest
     * @interface IHelloRequest
     * @property {string|null} [name] HelloRequest name
     */

    /**
     * Constructs a new HelloRequest.
     * @exports HelloRequest
     * @classdesc Represents a HelloRequest.
     * @implements IHelloRequest
     * @constructor
     * @param {IHelloRequest=} [properties] Properties to set
     */
    function HelloRequest(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * HelloRequest name.
     * @member {string} name
     * @memberof HelloRequest
     * @instance
     */
    HelloRequest.prototype.name = "";

    /**
     * Creates a new HelloRequest instance using the specified properties.
     * @function create
     * @memberof HelloRequest
     * @static
     * @param {IHelloRequest=} [properties] Properties to set
     * @returns {HelloRequest} HelloRequest instance
     */
    HelloRequest.create = function create(properties) {
        return new HelloRequest(properties);
    };

    /**
     * Encodes the specified HelloRequest message. Does not implicitly {@link HelloRequest.verify|verify} messages.
     * @function encode
     * @memberof HelloRequest
     * @static
     * @param {IHelloRequest} message HelloRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    HelloRequest.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
        return writer;
    };

    /**
     * Encodes the specified HelloRequest message, length delimited. Does not implicitly {@link HelloRequest.verify|verify} messages.
     * @function encodeDelimited
     * @memberof HelloRequest
     * @static
     * @param {IHelloRequest} message HelloRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    HelloRequest.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a HelloRequest message from the specified reader or buffer.
     * @function decode
     * @memberof HelloRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {HelloRequest} HelloRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    HelloRequest.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.HelloRequest();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.name = reader.string();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a HelloRequest message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof HelloRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {HelloRequest} HelloRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    HelloRequest.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a HelloRequest message.
     * @function verify
     * @memberof HelloRequest
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    HelloRequest.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.name != null && message.hasOwnProperty("name"))
            if (!$util.isString(message.name))
                return "name: string expected";
        return null;
    };

    /**
     * Creates a HelloRequest message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof HelloRequest
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {HelloRequest} HelloRequest
     */
    HelloRequest.fromObject = function fromObject(object) {
        if (object instanceof $root.HelloRequest)
            return object;
        var message = new $root.HelloRequest();
        if (object.name != null)
            message.name = String(object.name);
        return message;
    };

    /**
     * Creates a plain object from a HelloRequest message. Also converts values to other types if specified.
     * @function toObject
     * @memberof HelloRequest
     * @static
     * @param {HelloRequest} message HelloRequest
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    HelloRequest.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults)
            object.name = "";
        if (message.name != null && message.hasOwnProperty("name"))
            object.name = message.name;
        return object;
    };

    /**
     * Converts this HelloRequest to JSON.
     * @function toJSON
     * @memberof HelloRequest
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    HelloRequest.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for HelloRequest
     * @function getTypeUrl
     * @memberof HelloRequest
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    HelloRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/HelloRequest";
    };

    return HelloRequest;
})();

$root.HelloReply = (function() {

    /**
     * Properties of a HelloReply.
     * @exports IHelloReply
     * @interface IHelloReply
     * @property {string|null} [message] HelloReply message
     */

    /**
     * Constructs a new HelloReply.
     * @exports HelloReply
     * @classdesc Represents a HelloReply.
     * @implements IHelloReply
     * @constructor
     * @param {IHelloReply=} [properties] Properties to set
     */
    function HelloReply(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * HelloReply message.
     * @member {string} message
     * @memberof HelloReply
     * @instance
     */
    HelloReply.prototype.message = "";

    /**
     * Creates a new HelloReply instance using the specified properties.
     * @function create
     * @memberof HelloReply
     * @static
     * @param {IHelloReply=} [properties] Properties to set
     * @returns {HelloReply} HelloReply instance
     */
    HelloReply.create = function create(properties) {
        return new HelloReply(properties);
    };

    /**
     * Encodes the specified HelloReply message. Does not implicitly {@link HelloReply.verify|verify} messages.
     * @function encode
     * @memberof HelloReply
     * @static
     * @param {IHelloReply} message HelloReply message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    HelloReply.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.message != null && Object.hasOwnProperty.call(message, "message"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.message);
        return writer;
    };

    /**
     * Encodes the specified HelloReply message, length delimited. Does not implicitly {@link HelloReply.verify|verify} messages.
     * @function encodeDelimited
     * @memberof HelloReply
     * @static
     * @param {IHelloReply} message HelloReply message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    HelloReply.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a HelloReply message from the specified reader or buffer.
     * @function decode
     * @memberof HelloReply
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {HelloReply} HelloReply
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    HelloReply.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.HelloReply();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.message = reader.string();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a HelloReply message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof HelloReply
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {HelloReply} HelloReply
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    HelloReply.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a HelloReply message.
     * @function verify
     * @memberof HelloReply
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    HelloReply.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.message != null && message.hasOwnProperty("message"))
            if (!$util.isString(message.message))
                return "message: string expected";
        return null;
    };

    /**
     * Creates a HelloReply message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof HelloReply
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {HelloReply} HelloReply
     */
    HelloReply.fromObject = function fromObject(object) {
        if (object instanceof $root.HelloReply)
            return object;
        var message = new $root.HelloReply();
        if (object.message != null)
            message.message = String(object.message);
        return message;
    };

    /**
     * Creates a plain object from a HelloReply message. Also converts values to other types if specified.
     * @function toObject
     * @memberof HelloReply
     * @static
     * @param {HelloReply} message HelloReply
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    HelloReply.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults)
            object.message = "";
        if (message.message != null && message.hasOwnProperty("message"))
            object.message = message.message;
        return object;
    };

    /**
     * Converts this HelloReply to JSON.
     * @function toJSON
     * @memberof HelloReply
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    HelloReply.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for HelloReply
     * @function getTypeUrl
     * @memberof HelloReply
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    HelloReply.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/HelloReply";
    };

    return HelloReply;
})();

$root.Attacker = (function() {

    /**
     * Constructs a new Attacker service.
     * @exports Attacker
     * @classdesc Represents an Attacker
     * @extends $protobuf.rpc.Service
     * @constructor
     * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
     * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
     * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
     */
    function Attacker(rpcImpl, requestDelimited, responseDelimited) {
        $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
    }

    (Attacker.prototype = Object.create($protobuf.rpc.Service.prototype)).constructor = Attacker;

    /**
     * Creates new Attacker service using the specified rpc implementation.
     * @function create
     * @memberof Attacker
     * @static
     * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
     * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
     * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
     * @returns {Attacker} RPC service. Useful where requests and/or responses are streamed.
     */
    Attacker.create = function create(rpcImpl, requestDelimited, responseDelimited) {
        return new this(rpcImpl, requestDelimited, responseDelimited);
    };

    /**
     * Callback as used by {@link Attacker#attack}.
     * @memberof Attacker
     * @typedef AttackCallback
     * @type {function}
     * @param {Error|null} error Error, if any
     * @param {AttackReply} [response] AttackReply
     */

    /**
     * Calls Attack.
     * @function attack
     * @memberof Attacker
     * @instance
     * @param {IAttackRequest} request AttackRequest message or plain object
     * @param {Attacker.AttackCallback} callback Node-style callback called with the error, if any, and AttackReply
     * @returns {undefined}
     * @variation 1
     */
    Object.defineProperty(Attacker.prototype.attack = function attack(request, callback) {
        return this.rpcCall(attack, $root.AttackRequest, $root.AttackReply, request, callback);
    }, "name", { value: "Attack" });

    /**
     * Calls Attack.
     * @function attack
     * @memberof Attacker
     * @instance
     * @param {IAttackRequest} request AttackRequest message or plain object
     * @returns {Promise<AttackReply>} Promise
     * @variation 2
     */

    return Attacker;
})();

$root.AttackRequest = (function() {

    /**
     * Properties of an AttackRequest.
     * @exports IAttackRequest
     * @interface IAttackRequest
     * @property {string|null} [name] AttackRequest name
     */

    /**
     * Constructs a new AttackRequest.
     * @exports AttackRequest
     * @classdesc Represents an AttackRequest.
     * @implements IAttackRequest
     * @constructor
     * @param {IAttackRequest=} [properties] Properties to set
     */
    function AttackRequest(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * AttackRequest name.
     * @member {string} name
     * @memberof AttackRequest
     * @instance
     */
    AttackRequest.prototype.name = "";

    /**
     * Creates a new AttackRequest instance using the specified properties.
     * @function create
     * @memberof AttackRequest
     * @static
     * @param {IAttackRequest=} [properties] Properties to set
     * @returns {AttackRequest} AttackRequest instance
     */
    AttackRequest.create = function create(properties) {
        return new AttackRequest(properties);
    };

    /**
     * Encodes the specified AttackRequest message. Does not implicitly {@link AttackRequest.verify|verify} messages.
     * @function encode
     * @memberof AttackRequest
     * @static
     * @param {IAttackRequest} message AttackRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    AttackRequest.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
        return writer;
    };

    /**
     * Encodes the specified AttackRequest message, length delimited. Does not implicitly {@link AttackRequest.verify|verify} messages.
     * @function encodeDelimited
     * @memberof AttackRequest
     * @static
     * @param {IAttackRequest} message AttackRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    AttackRequest.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an AttackRequest message from the specified reader or buffer.
     * @function decode
     * @memberof AttackRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {AttackRequest} AttackRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    AttackRequest.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.AttackRequest();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.name = reader.string();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes an AttackRequest message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof AttackRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {AttackRequest} AttackRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    AttackRequest.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an AttackRequest message.
     * @function verify
     * @memberof AttackRequest
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    AttackRequest.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.name != null && message.hasOwnProperty("name"))
            if (!$util.isString(message.name))
                return "name: string expected";
        return null;
    };

    /**
     * Creates an AttackRequest message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof AttackRequest
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {AttackRequest} AttackRequest
     */
    AttackRequest.fromObject = function fromObject(object) {
        if (object instanceof $root.AttackRequest)
            return object;
        var message = new $root.AttackRequest();
        if (object.name != null)
            message.name = String(object.name);
        return message;
    };

    /**
     * Creates a plain object from an AttackRequest message. Also converts values to other types if specified.
     * @function toObject
     * @memberof AttackRequest
     * @static
     * @param {AttackRequest} message AttackRequest
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    AttackRequest.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults)
            object.name = "";
        if (message.name != null && message.hasOwnProperty("name"))
            object.name = message.name;
        return object;
    };

    /**
     * Converts this AttackRequest to JSON.
     * @function toJSON
     * @memberof AttackRequest
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    AttackRequest.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for AttackRequest
     * @function getTypeUrl
     * @memberof AttackRequest
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    AttackRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/AttackRequest";
    };

    return AttackRequest;
})();

$root.AttackReply = (function() {

    /**
     * Properties of an AttackReply.
     * @exports IAttackReply
     * @interface IAttackReply
     * @property {string|null} [message] AttackReply message
     */

    /**
     * Constructs a new AttackReply.
     * @exports AttackReply
     * @classdesc Represents an AttackReply.
     * @implements IAttackReply
     * @constructor
     * @param {IAttackReply=} [properties] Properties to set
     */
    function AttackReply(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * AttackReply message.
     * @member {string} message
     * @memberof AttackReply
     * @instance
     */
    AttackReply.prototype.message = "";

    /**
     * Creates a new AttackReply instance using the specified properties.
     * @function create
     * @memberof AttackReply
     * @static
     * @param {IAttackReply=} [properties] Properties to set
     * @returns {AttackReply} AttackReply instance
     */
    AttackReply.create = function create(properties) {
        return new AttackReply(properties);
    };

    /**
     * Encodes the specified AttackReply message. Does not implicitly {@link AttackReply.verify|verify} messages.
     * @function encode
     * @memberof AttackReply
     * @static
     * @param {IAttackReply} message AttackReply message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    AttackReply.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.message != null && Object.hasOwnProperty.call(message, "message"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.message);
        return writer;
    };

    /**
     * Encodes the specified AttackReply message, length delimited. Does not implicitly {@link AttackReply.verify|verify} messages.
     * @function encodeDelimited
     * @memberof AttackReply
     * @static
     * @param {IAttackReply} message AttackReply message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    AttackReply.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an AttackReply message from the specified reader or buffer.
     * @function decode
     * @memberof AttackReply
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {AttackReply} AttackReply
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    AttackReply.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.AttackReply();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.message = reader.string();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes an AttackReply message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof AttackReply
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {AttackReply} AttackReply
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    AttackReply.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an AttackReply message.
     * @function verify
     * @memberof AttackReply
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    AttackReply.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.message != null && message.hasOwnProperty("message"))
            if (!$util.isString(message.message))
                return "message: string expected";
        return null;
    };

    /**
     * Creates an AttackReply message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof AttackReply
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {AttackReply} AttackReply
     */
    AttackReply.fromObject = function fromObject(object) {
        if (object instanceof $root.AttackReply)
            return object;
        var message = new $root.AttackReply();
        if (object.message != null)
            message.message = String(object.message);
        return message;
    };

    /**
     * Creates a plain object from an AttackReply message. Also converts values to other types if specified.
     * @function toObject
     * @memberof AttackReply
     * @static
     * @param {AttackReply} message AttackReply
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    AttackReply.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults)
            object.message = "";
        if (message.message != null && message.hasOwnProperty("message"))
            object.message = message.message;
        return object;
    };

    /**
     * Converts this AttackReply to JSON.
     * @function toJSON
     * @memberof AttackReply
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    AttackReply.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for AttackReply
     * @function getTypeUrl
     * @memberof AttackReply
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    AttackReply.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/AttackReply";
    };

    return AttackReply;
})();

$root.google = (function() {

    /**
     * Namespace google.
     * @exports google
     * @namespace
     */
    var google = {};

    google.protobuf = (function() {

        /**
         * Namespace protobuf.
         * @memberof google
         * @namespace
         */
        var protobuf = {};

        protobuf.Empty = (function() {

            /**
             * Properties of an Empty.
             * @memberof google.protobuf
             * @interface IEmpty
             */

            /**
             * Constructs a new Empty.
             * @memberof google.protobuf
             * @classdesc Represents an Empty.
             * @implements IEmpty
             * @constructor
             * @param {google.protobuf.IEmpty=} [properties] Properties to set
             */
            function Empty(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Creates a new Empty instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Empty
             * @static
             * @param {google.protobuf.IEmpty=} [properties] Properties to set
             * @returns {google.protobuf.Empty} Empty instance
             */
            Empty.create = function create(properties) {
                return new Empty(properties);
            };

            /**
             * Encodes the specified Empty message. Does not implicitly {@link google.protobuf.Empty.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Empty
             * @static
             * @param {google.protobuf.IEmpty} message Empty message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Empty.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                return writer;
            };

            /**
             * Encodes the specified Empty message, length delimited. Does not implicitly {@link google.protobuf.Empty.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.Empty
             * @static
             * @param {google.protobuf.IEmpty} message Empty message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Empty.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Empty message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Empty
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.Empty} Empty
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Empty.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.Empty();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an Empty message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.Empty
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.Empty} Empty
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Empty.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Empty message.
             * @function verify
             * @memberof google.protobuf.Empty
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Empty.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                return null;
            };

            /**
             * Creates an Empty message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Empty
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.Empty} Empty
             */
            Empty.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.Empty)
                    return object;
                return new $root.google.protobuf.Empty();
            };

            /**
             * Creates a plain object from an Empty message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Empty
             * @static
             * @param {google.protobuf.Empty} message Empty
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Empty.toObject = function toObject() {
                return {};
            };

            /**
             * Converts this Empty to JSON.
             * @function toJSON
             * @memberof google.protobuf.Empty
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Empty.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Empty
             * @function getTypeUrl
             * @memberof google.protobuf.Empty
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Empty.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.Empty";
            };

            return Empty;
        })();

        return protobuf;
    })();

    return google;
})();

module.exports = $root;
