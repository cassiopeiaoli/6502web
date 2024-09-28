"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Program_memory, _Program_buffer, _Program_stack, _Program_pc, _Program_accumulator, _Program_x, _Program_y, _Program_pos, _Program_neg, _Program_zero, _Program_lastElement, _Program_sharedMemory, _Program_config;
const SHARED_MEMORY_START = 0x32;
const SHARED_MEMORY_END = 0x3c;
;
var BindingType;
(function (BindingType) {
    BindingType[BindingType["X"] = 0] = "X";
    BindingType[BindingType["Y"] = 1] = "Y";
    BindingType[BindingType["Accumulator"] = 2] = "Accumulator";
})(BindingType || (BindingType = {}));
;
const bindings = new Map([]);
const htmlElements = [
    "p", 'b', 'i', 'span', 'button', "div", "h1", "h2", "h3", "h4", "h5", "h6", "a", "img"
];
const jsEvents = [
    "click", "mousedown", "mouseup", "dblclick", "mousemove", "mouseover", "mouseout", "mouseenter", "mouseleave"
];
const attributes = [
    "src", "href", "class", "id"
];
function addHTMLBinding(element, typeOfBinding) {
    bindings.set(element, typeOfBinding);
}
function getBindingsOfType(typeOfBinding) {
    return [...bindings.entries()].filter(([_, v]) => v === typeOfBinding);
}
class Program {
    constructor(buffer) {
        _Program_memory.set(this, void 0);
        _Program_buffer.set(this, void 0);
        _Program_stack.set(this, []);
        _Program_pc.set(this, 0);
        _Program_accumulator.set(this, 0);
        _Program_x.set(this, {
            val: 0,
            get value() {
                return this.val;
            },
            set value(newValue) {
                this.val = newValue;
                getBindingsOfType(BindingType.X).forEach(([k, _]) => k.textContent = this.val.toString());
            }
        });
        _Program_y.set(this, {
            val: 0,
            get value() {
                return this.val;
            },
            set value(newValue) {
                this.val = newValue;
                getBindingsOfType(BindingType.Y).forEach(([k, _]) => k.textContent = this.val.toString());
            }
        });
        _Program_pos.set(this, false);
        _Program_neg.set(this, false);
        _Program_zero.set(this, false);
        _Program_lastElement.set(this, document.body);
        _Program_sharedMemory.set(this, []);
        _Program_config.set(this, {
            log: false,
            sharedMemory: []
        });
        __classPrivateFieldSet(this, _Program_buffer, buffer, "f");
        __classPrivateFieldSet(this, _Program_memory, [], "f");
    }
    numberToHTMLElement(num) {
        return htmlElements[num] === undefined ? 'h1' : htmlElements[num];
    }
    numberToHTMLEvent(num) {
        return jsEvents[num] === undefined ? 'click' : jsEvents[num];
    }
    numberToAttribute(num) {
        return attributes[num] === undefined ? 'attribute_not_found' : attributes[num];
    }
    runBuiltinFunction(address) {
        switch (address) {
            case 0:
                const element = document.createElement(this.numberToHTMLElement(__classPrivateFieldGet(this, _Program_memory, "f")[70]));
                if (__classPrivateFieldGet(this, _Program_lastElement, "f")) {
                    __classPrivateFieldGet(this, _Program_lastElement, "f").appendChild(element);
                    __classPrivateFieldSet(this, _Program_lastElement, element, "f");
                }
                break;
            case 1:
                if (typeof __classPrivateFieldGet(this, _Program_accumulator, "f") === 'string' && __classPrivateFieldGet(this, _Program_lastElement, "f")) {
                    __classPrivateFieldGet(this, _Program_lastElement, "f").textContent = __classPrivateFieldGet(this, _Program_accumulator, "f");
                    return;
                }
                const stringLength = __classPrivateFieldGet(this, _Program_memory, "f")[70];
                if (!__classPrivateFieldGet(this, _Program_lastElement, "f")) {
                    throw new Error("You are trying to set text on a null element. Create an element and set text right after its creation");
                }
                const string = __classPrivateFieldGet(this, _Program_memory, "f").slice(71, 71 + stringLength).map(s => String.fromCharCode(s)).join('');
                __classPrivateFieldGet(this, _Program_lastElement, "f").textContent = string;
                break;
            case 2:
                const event = this.numberToHTMLEvent(__classPrivateFieldGet(this, _Program_memory, "f")[70]);
                const functionIndex = __classPrivateFieldGet(this, _Program_memory, "f")[71];
                if (!__classPrivateFieldGet(this, _Program_lastElement, "f")) {
                    throw new Error("You are trying to set up an event listener on a null element.");
                }
                if (typeof __classPrivateFieldGet(this, _Program_sharedMemory, "f")[functionIndex] === 'function') {
                    __classPrivateFieldGet(this, _Program_lastElement, "f").addEventListener(event, __classPrivateFieldGet(this, _Program_sharedMemory, "f")[functionIndex]);
                    return;
                }
                __classPrivateFieldGet(this, _Program_lastElement, "f").addEventListener(event, () => this.runInstruction(functionIndex));
                break;
            case 3:
                if (__classPrivateFieldGet(this, _Program_lastElement, "f") !== document.body && __classPrivateFieldGet(this, _Program_lastElement, "f")) {
                    __classPrivateFieldSet(this, _Program_lastElement, __classPrivateFieldGet(this, _Program_lastElement, "f").parentElement, "f");
                }
                break;
            case 4:
                if (typeof __classPrivateFieldGet(this, _Program_accumulator, "f") === 'string' && __classPrivateFieldGet(this, _Program_lastElement, "f")) {
                    __classPrivateFieldGet(this, _Program_lastElement, "f").className = __classPrivateFieldGet(this, _Program_accumulator, "f");
                    return;
                }
                const stringLength2 = __classPrivateFieldGet(this, _Program_memory, "f")[70];
                if (!__classPrivateFieldGet(this, _Program_lastElement, "f")) {
                    throw new Error("You are trying to set className on a null element. Create an element and set text right after its creation");
                }
                const className = __classPrivateFieldGet(this, _Program_memory, "f").slice(71, 71 + stringLength2).map(s => String.fromCharCode(s)).join('');
                __classPrivateFieldGet(this, _Program_lastElement, "f").className = className;
                break;
            case 5:
                if (__classPrivateFieldGet(this, _Program_lastElement, "f")) {
                    __classPrivateFieldGet(this, _Program_lastElement, "f").textContent = __classPrivateFieldGet(this, _Program_x, "f").value.toString();
                    addHTMLBinding(__classPrivateFieldGet(this, _Program_lastElement, "f"), BindingType.X);
                }
                break;
            case 6:
                if (__classPrivateFieldGet(this, _Program_lastElement, "f")) {
                    __classPrivateFieldGet(this, _Program_lastElement, "f").textContent = __classPrivateFieldGet(this, _Program_y, "f").value.toString();
                    addHTMLBinding(__classPrivateFieldGet(this, _Program_lastElement, "f"), BindingType.Y);
                }
                break;
            case 7:
                if (typeof __classPrivateFieldGet(this, _Program_accumulator, "f") === 'number' && typeof __classPrivateFieldGet(this, _Program_memory, "f")[70] === 'number') {
                    __classPrivateFieldSet(this, _Program_accumulator, __classPrivateFieldGet(this, _Program_memory, "f")[70] * __classPrivateFieldGet(this, _Program_accumulator, "f"), "f");
                }
                break;
            case 8:
                if (typeof __classPrivateFieldGet(this, _Program_accumulator, "f") === 'number' && typeof __classPrivateFieldGet(this, _Program_memory, "f")[70] === 'number') {
                    __classPrivateFieldSet(this, _Program_accumulator, __classPrivateFieldGet(this, _Program_memory, "f")[70] / __classPrivateFieldGet(this, _Program_accumulator, "f"), "f");
                }
                break;
            case 9:
                const attribute = this.numberToAttribute(__classPrivateFieldGet(this, _Program_memory, "f")[70]);
                if (__classPrivateFieldGet(this, _Program_lastElement, "f") && __classPrivateFieldGet(this, _Program_accumulator, "f")) {
                    __classPrivateFieldGet(this, _Program_lastElement, "f").setAttribute(attribute, __classPrivateFieldGet(this, _Program_accumulator, "f").toString());
                }
                break;
        }
    }
    runInstruction(opCode) {
        var _a, _b, _c;
        switch (opCode) {
            case 0xA9:
                const loadedValue = __classPrivateFieldGet(this, _Program_buffer, "f")[__classPrivateFieldSet(this, _Program_pc, (_a = __classPrivateFieldGet(this, _Program_pc, "f"), ++_a), "f")];
                if (__classPrivateFieldGet(this, _Program_config, "f").log)
                    console.info("LDA " + loadedValue);
                __classPrivateFieldSet(this, _Program_accumulator, loadedValue, "f");
                break;
            case 0xA5:
                const nextWord = __classPrivateFieldGet(this, _Program_buffer, "f")[__classPrivateFieldSet(this, _Program_pc, (_b = __classPrivateFieldGet(this, _Program_pc, "f"), ++_b), "f")];
                if (__classPrivateFieldGet(this, _Program_config, "f").log)
                    console.info("LDA $" + nextWord);
                __classPrivateFieldSet(this, _Program_accumulator, (nextWord >= SHARED_MEMORY_START && nextWord <= SHARED_MEMORY_END)
                    ? __classPrivateFieldGet(this, _Program_sharedMemory, "f")[nextWord - 50]
                    : __classPrivateFieldGet(this, _Program_memory, "f")[nextWord], "f");
                if (typeof __classPrivateFieldGet(this, _Program_accumulator, "f") === 'function') {
                    __classPrivateFieldGet(this, _Program_accumulator, "f").call(this);
                }
                break;
            case 0x85:
                const target = __classPrivateFieldGet(this, _Program_buffer, "f")[__classPrivateFieldSet(this, _Program_pc, (_c = __classPrivateFieldGet(this, _Program_pc, "f"), ++_c), "f")];
                __classPrivateFieldGet(this, _Program_memory, "f")[target] = __classPrivateFieldGet(this, _Program_accumulator, "f");
                this.runBuiltinFunction(target);
                break;
            case 0xAA:
                if (typeof __classPrivateFieldGet(this, _Program_accumulator, "f") === 'number') {
                    __classPrivateFieldGet(this, _Program_x, "f").value = __classPrivateFieldGet(this, _Program_accumulator, "f");
                }
                break;
            case 0xA8:
                if (typeof __classPrivateFieldGet(this, _Program_accumulator, "f") === 'number') {
                    __classPrivateFieldGet(this, _Program_y, "f").value = __classPrivateFieldGet(this, _Program_accumulator, "f");
                }
                break;
            case 0xBA:
                __classPrivateFieldSet(this, _Program_accumulator, __classPrivateFieldGet(this, _Program_x, "f").value, "f");
                break;
            case 0x98:
                __classPrivateFieldSet(this, _Program_accumulator, __classPrivateFieldGet(this, _Program_y, "f").value, "f");
                break;
            case 0xE8:
                __classPrivateFieldGet(this, _Program_x, "f").value++;
                break;
            case 0xC8:
                __classPrivateFieldGet(this, _Program_y, "f").value++;
                break;
            case 0xCA:
                __classPrivateFieldGet(this, _Program_x, "f").value--;
                break;
            case 0x88:
                __classPrivateFieldGet(this, _Program_y, "f").value--;
                break;
        }
    }
    run(config) {
        var _a;
        __classPrivateFieldSet(this, _Program_config, config, "f");
        __classPrivateFieldSet(this, _Program_sharedMemory, __classPrivateFieldGet(this, _Program_config, "f").sharedMemory, "f");
        while (__classPrivateFieldGet(this, _Program_pc, "f") < __classPrivateFieldGet(this, _Program_buffer, "f").length) {
            this.runInstruction(__classPrivateFieldGet(this, _Program_buffer, "f")[__classPrivateFieldGet(this, _Program_pc, "f")]);
            __classPrivateFieldSet(this, _Program_pc, (_a = __classPrivateFieldGet(this, _Program_pc, "f"), _a++, _a), "f");
        }
    }
}
_Program_memory = new WeakMap(), _Program_buffer = new WeakMap(), _Program_stack = new WeakMap(), _Program_pc = new WeakMap(), _Program_accumulator = new WeakMap(), _Program_x = new WeakMap(), _Program_y = new WeakMap(), _Program_pos = new WeakMap(), _Program_neg = new WeakMap(), _Program_zero = new WeakMap(), _Program_lastElement = new WeakMap(), _Program_sharedMemory = new WeakMap(), _Program_config = new WeakMap();
function LOAD_6502(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        const file = yield fetch(filename);
        if (file.ok) {
            const array = new Uint8Array(yield file.arrayBuffer());
            return new Program(array);
        }
        return undefined;
    });
}
