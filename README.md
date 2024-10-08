<img src='logo.png' width=100>

# 6502 Assembly on the web!
I really love 6502 assembly, and for most of my life I've been working with web technologies, so one day after two sleepless nights I came up with an idea..

*what if... 6502 but... on the web?*

And I don't mean a simple emulator/simulator. There's a bunch of them everywhere. What I want to achieve is **being able to write simple websites and web applications using 6502 assembly**

Your immediate question probably is: (and should be) **why??**

The answer might shock you:

*i just think it's really funny ok*

This is still in EARLY WIP, and I'm not sure I'll be able to do everything I want with this project. I'm mostly doing it for the bit, but at the same time I want to use it to write my own website.

###### somebody please stop me i have suffered enough already

(also yes the borzoi in front of the trans flag IS the logo and i'm not changing it.)

## How to use:
By this *CDN*!

https://cdn.jsdelivr.net/npm/6502web/dist/6502web.js

## Loading your .bin file
Your assembled 6502 binary can be loaded like this:

<code>LOAD_6502("file.bin").then(res => res.run({ log: true, sharedMemory: [] }));</code>

The empty array we're passing is your **shared memory**.

## Shared memory 

This dubious piece of technology supports shared memory between 6502 and JS. You pass the shared memory while running the program, like such:

<code>LOAD_6502("file.bin").then(res => res.run({ log: true, sharedMemory: [
    "Hi i'm in memory!", "Please let me out", () => "I don't want to be here!"
] }));</code>

Then those fields can be loaded into the accumulator. Shared memory has only
10 fields, so use them as best as you can!

They range from $32 to $3C.

**If** a field you're trying to load is a function, that function will be immediately called.

## Built-in functions
Calling those functions requires **STA** to its address.

Documentation format:

$\<address> [\<arguments>]

"..." means any number of arguments

### $0 [$46]
#### Create HTML Element
Create an HTML Element and saves it as the recently created one

*$46* should store numerical ID of the element you want to create, refer to 
this list:

0.  \<p>
1.  \<b>
2.  \<i>
3.  \<span>
4.  \<button>
5.  \<div>
6.  \<h1>
7.  \<h2>
8.  \<h3>
9. \<h4>
10. \<h5>
11. \<h6>
12. \<a>
13. \<img>

___

### $1 [$46, ...]
#### Change text content
Changes text content of the recently created HTML file

*$46* should store length of the string you want to put inside the recently created HTML element.

Rest of the arguments should be ASCII codes for characters that will be read
based on the value stored in *$46*

If your accumulator has a loaded string (for example, from **shared memory**) it shall be used as the text content of your recently created HTML element. This **WILL** ignore all of your passed arguments.

___

### $2 [$46, $47]
#### Add event listener

*$46* should store numerical ID of the JS event you want to listen for, refer to this list:

0.  click
1.  mousedown
2.  mouseup
3.  dblckick
4.  mousemove
5.  mouseover
6.  mouseout
7.  mouseenter
8.  mouseleave

*$47* should store INDEX of the function from shared memory that should be called upon event detection.

___

### $3
#### Move to element's parent

___

### $4 [$46, ...]
#### Add class name

*$46* should store length of the string you want to set as the className of the recently created element

Rest of the arguments should be ASCII codes for characters that will be read
based on the value stored in *$46*

If your accumulator has a loaded string (for example, from **shared memory**) it shall be used as the className of your recently created HTML element. This **WILL** ignore all of your passed arguments.

___

### $5
#### Bind X to recently created element

___

### $6
#### Bind Y to recently created element

___

### $7 [$46]
#### Multiply value at $46 by value stored in the accumulator (result is saved to accumulator)

___

### $8 [$46]
#### Divide value at $46 by value stored in the accumulator (result is saved to accumulator)

___

### 9 [$46]
#### Set attribute on HTML element