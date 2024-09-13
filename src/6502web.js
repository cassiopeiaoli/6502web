const SHARED_MEMORY_START = 0x32;
const SHARED_MEMORY_END = 0x3c;

const htmlElements = [
    "p", 'b', 'i', 'span', 'button', "div", "h1", "h2", "h3", "h4", "h5", "h6"
];

const jsEvents = [
    "click", "mousedown", "mouseup", "dblclick", "mousemove", "mouseover", "mouseout", "mouseenter", "mouseleave"
];

class Program {

    #memory
    #buffer
    #stack
    #pc = 0
    #accumulator = 0;
    #x = 0;
    #y = 0;
    #pos = false;
    #neg = false;
    #zero = false;
    #lastElement = document.body;
    // $32 - $3C
    #sharedMemory = [];
    #config = {
        log: false,
        sharedMemory: []
    }

    constructor(buffer) {
        this.#buffer = buffer;
        this.#memory = [];
    }

    numberToHTMLElement(num) {
        return htmlElements[num];
    }

    numberToHTMLEvent(num) {
        return jsEvents[num];
    }

    runBuiltinFunction(address) {
        switch (address) {
            case 0:  // create element
                const element = document.createElement(this.numberToHTMLElement(this.#memory[70]));
                this.#lastElement.appendChild(element);
                this.#lastElement = element;
                break;
            case 1:  // update text content
                if (typeof this.#accumulator === 'string') {
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

                this.#lastElement.addEventListener(event, this.#sharedMemory[functionIndex]);
                break;
            case 3: // move to element's parent
                if (this.#lastElement !== document.body) {
                    this.#lastElement = this.#lastElement.parentElement;
                }
                break;
            case 4: // set classname
                if (typeof this.#accumulator === 'string') {
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
        }
    }

    run(config = {}) {
        this.#config = config;
        this.#sharedMemory = this.#config.sharedMemory;
        while (this.#pc < this.#buffer.length) {
            
            switch (this.#buffer[this.#pc]) {
                case 0xA9:  // LDA #n
                    const loadedValue = this.#buffer[++this.#pc];
                    if (this.#config.log) 
                        console.info("LDA " + loadedValue);
                    this.#accumulator = loadedValue;
                    break;
                case 0xA5:  // LDA $n
                    const nextWord = this.#buffer[++this.#pc];
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
                    const target = this.#buffer[++this.#pc];
                    this.#memory[target] = this.#accumulator;
                    this.runBuiltinFunction(target);
                    break;
                case 0xAA:  // TAX
                    if (typeof this.#accumulator === 'number') {
                        this.#x = this.#accumulator;
                    }
                    break;
                case 0xA8:  // TAY
                    if (typeof this.#accumulator === 'number') {
                        this.#y = this.#accumulator;
                    }
                    break;
                case 0xBA:  // TXA
                    this.#accumulator = this.#x;
                    break
                case 0x98:  // TYA
                    this.#accumulator = this.#y;
                    break;
                case 0xE8:  // INX
                    this.#x++;
                    break;
                case 0xC8:  // INY
                    this.#y++;
                    break;
            }

            this.#pc++;

        }
        
    }
}

async function LOAD_6502(filename) {
    const file = await fetch(filename);
    
    if (file.ok) {
        const array = new Uint8Array(await file.arrayBuffer()); 
        return new Program(array);
    }
}