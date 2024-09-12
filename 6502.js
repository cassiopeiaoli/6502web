const htmlElements = [
    "p", 'b', 'i', 'span', 'button'
];

const jsEvents = [
    "click"
];

class Program {

    #memory
    #buffer
    #stack
    #pc = 0
    #accumulator = 0;
    #sharedMemoryAccumulator = null;
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
            case 0:
                const element = document.createElement(this.numberToHTMLElement(this.#memory[70]));
                this.#lastElement.appendChild(element);
                this.#lastElement = element;
                break;
            case 1:
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
            case 2:
                const event = this.numberToHTMLEvent(this.#memory[70]);
                const functionIndex = this.#memory[71];

                if (!this.#lastElement) {
                    throw new Error("You are trying to set up an event listener on a null element.");
                }

                console.log(event, functionIndex);
                this.#lastElement.addEventListener(event, this.#sharedMemory[functionIndex]);
                break;
        }
    }

    run(initialSharedMemory, config = {}) {
        this.#config = config;
        this.#sharedMemory = initialSharedMemory;
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
                    this.#accumulator = (nextWord >= 50 && nextWord <= 60)
                        ? this.#sharedMemory[nextWord - 50]
                        : this.#memory[nextWord];

                    if (typeof this.#accumulator === 'function') {
                        this.#accumulator();
                    }
                    break
                case 133:  // STA
                    const target = this.#buffer[++this.#pc];
                    this.#memory[target] = this.#accumulator;
                    this.runBuiltinFunction(target);
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