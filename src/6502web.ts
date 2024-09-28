const SHARED_MEMORY_START = 0x32;
const SHARED_MEMORY_END = 0x3c;

interface Config {
   log: boolean;
   sharedMemory: Array<any>; 
};

enum BindingType {
    X,
    Y,
    Accumulator,
};

const bindings: Map<HTMLElement, BindingType> = new Map([]);

const htmlElements: Array<string> = [
    "p", 'b', 'i', 'span', 'button', "div", "h1", "h2", "h3", "h4", "h5", "h6", "a", "img"
];

const jsEvents: Array<string> = [
    "click", "mousedown", "mouseup", "dblclick", "mousemove", "mouseover", "mouseout", "mouseenter", "mouseleave"
];

const attributes: Array<string> = [
    "src", "href", "class", "id"
];

function addHTMLBinding(element: HTMLElement, typeOfBinding: BindingType): void {
    bindings.set(element, typeOfBinding);
}

function getBindingsOfType(typeOfBinding: BindingType): Array<[HTMLElement, BindingType]> {
    return [...bindings.entries()].filter(([_, v]) => v === typeOfBinding);
}

class Program {

    #memory: Array<any>;
    #buffer: Uint8Array;
    #stack: Array<number> = [];
    #pc = 0
    #accumulator: number | string | Function | undefined = 0;
    #x = {
        val: 0,
        get value() {
            return this.val;
        },
        set value(newValue: number) {
            this.val = newValue;
            getBindingsOfType(BindingType.X).forEach(([k, _]) => k.textContent = this.val.toString());
        }
    };
    #y = {
        val: 0,
        get value() {
            return this.val;
        },
        set value(newValue: number) {
            this.val = newValue;
            getBindingsOfType(BindingType.Y).forEach(([k, _]) => k.textContent = this.val.toString());
        }
    };
    #pos: boolean = false;
    #neg: boolean = false;
    #zero: boolean = false;
    #lastElement: HTMLElement | null = document.body;
    // $32 - $3C
    #sharedMemory: Array<any> = [];

    #config: Config = {
        log: false,
        sharedMemory: []
    }

    constructor(buffer: Uint8Array) {
        this.#buffer = buffer;
        this.#memory = [];
    }

    numberToHTMLElement(num: number): string {
        return htmlElements[num] === undefined ? 'h1' : htmlElements[num];
    }

    numberToHTMLEvent(num: number) : string {
        return jsEvents[num] === undefined ? 'click' : jsEvents[num];
    }

    numberToAttribute(num: number) : string {
        return attributes[num] === undefined ? 'attribute_not_found' : attributes[num];
    }

    runBuiltinFunction(address: number) {
        switch (address) {
            case 0:  // create element
                const element = document.createElement(this.numberToHTMLElement(this.#memory[70]));
                if (this.#lastElement) {
                    this.#lastElement.appendChild(element);
                    this.#lastElement = element;
                }
                break;
            case 1:  // update text content
                if (typeof this.#accumulator === 'string' && this.#lastElement) {
                    this.#lastElement.textContent = this.#accumulator;
                    return;
                } 
                const stringLength = this.#memory[70];
                
                if (!this.#lastElement) {
                    throw new Error("You are trying to set text on a null element. Create an element and set text right after its creation");
                }

                const string = this.#memory.slice(71, 71 + stringLength).map(s => String.fromCharCode(s)).join('');
                
                this.#lastElement.textContent = string;
                break;
            case 2: // add event listener
                const event = this.numberToHTMLEvent(this.#memory[70]);
                const functionIndex = this.#memory[71];

                if (!this.#lastElement) {
                    throw new Error("You are trying to set up an event listener on a null element.");
                }

                if (typeof this.#sharedMemory[functionIndex] === 'function') {
                    this.#lastElement.addEventListener(event, this.#sharedMemory[functionIndex]);
                    return;
                }

                this.#lastElement.addEventListener(event, () => this.runInstruction(functionIndex));

                break;
            case 3: // move to element's parent
                if (this.#lastElement !== document.body && this.#lastElement) {
                    this.#lastElement = this.#lastElement.parentElement;
                }
                break;
            case 4: // set classname
                if (typeof this.#accumulator === 'string' && this.#lastElement) {
                    this.#lastElement.className = this.#accumulator;
                    return;
                } 
                const stringLength2 = this.#memory[70];
                
                if (!this.#lastElement) {
                    throw new Error("You are trying to set className on a null element. Create an element and set text right after its creation");
                }

                const className = this.#memory.slice(71, 71 + stringLength2).map(s => String.fromCharCode(s)).join('');
                
                this.#lastElement.className = className;
                break;
            case 5:  // bind X
                if (this.#lastElement) {
                    this.#lastElement.textContent = this.#x.value.toString();
                    addHTMLBinding(this.#lastElement, BindingType.X);
                }
                break;
            case 6:  // bind Y
                if (this.#lastElement) {
                    this.#lastElement.textContent = this.#y.value.toString();
                    addHTMLBinding(this.#lastElement, BindingType.Y);
                }
                break;
            case 7:  // multiply
                if (typeof this.#accumulator === 'number' && typeof this.#memory[70] === 'number') {
                    this.#accumulator = this.#memory[70] * this.#accumulator;
                }
                break;
            case 8:  // divide
                if (typeof this.#accumulator === 'number' && typeof this.#memory[70] === 'number') {
                    this.#accumulator = this.#memory[70] / this.#accumulator;
                }
                break;
            case 9: // set attribute
                const attribute = this.numberToAttribute(this.#memory[70]);
                if (this.#lastElement && this.#accumulator) {
                    this.#lastElement.setAttribute(attribute, this.#accumulator.toString());
                }
                break;
        }
    }

    runInstruction(opCode: number) {
        switch (opCode) {
            case 0xA9:  // LDA #n
                const loadedValue = this.#buffer[++this.#pc];
                if (this.#config.log) 
                    console.info("LDA " + loadedValue);
                this.#accumulator = loadedValue;
                break;
            case 0xA5:  // LDA $n
                const nextWord = this.#buffer[++this.#pc] as number;
                if (this.#config.log)
                    console.info("LDA $" + nextWord);
                this.#accumulator = (nextWord >= SHARED_MEMORY_START && nextWord <= SHARED_MEMORY_END)
                    ? this.#sharedMemory[nextWord - 50]
                    : this.#memory[nextWord];

                if (typeof this.#accumulator === 'function') {
                    this.#accumulator();
                }
                break
            case 0x85:  // STA
                const target = this.#buffer[++this.#pc] as number; 
                this.#memory[target] = this.#accumulator;
                this.runBuiltinFunction(target);
                break;
            case 0xAA:  // TAX
                if (typeof this.#accumulator === 'number') {
                    this.#x.value = this.#accumulator;
                }
                break;
            case 0xA8:  // TAY
                if (typeof this.#accumulator === 'number') {
                    this.#y.value = this.#accumulator;
                }
                break;
            case 0xBA:  // TXA
                this.#accumulator = this.#x.value;
                break
            case 0x98:  // TYA
                this.#accumulator = this.#y.value;
                break;
            case 0xE8:  // INX
                this.#x.value++;
                break;
            case 0xC8:  // INY
                this.#y.value++;
                break;
            case 0xCA:  // DEX
                this.#x.value--;
                break;
            case 0x88:  // DEY
                this.#y.value--;
                break;
        }
    }

    run(config: Config) {
        this.#config = config;
        this.#sharedMemory = this.#config.sharedMemory;
        while (this.#pc < this.#buffer.length) {
            this.runInstruction(this.#buffer[this.#pc] as number);
            this.#pc++;
        }
    }
}

async function LOAD_6502(filename: string): Promise<Program | undefined> {
    const file = await fetch(filename);
    
    if (file.ok) {
        const array = new Uint8Array(await file.arrayBuffer()); 
        return new Program(array);
    }

    return undefined;
}