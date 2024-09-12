<img src='logo.png' width=100>

# 6502 Assembly on the web!
I really love 6502 assembly, and for most of my life I've been working with web technologies, so one day after two sleepless nights I came up with an idea..

*what if... 6502 but... on the web?*

And I don't mean a simple emulator/simulator. There's a bunch of them everywhere. What I want to achieve is **being able to write simple websites and web applications using 6502 assembly**

Your immediate question probably is: (and should be) **why??**

The answer might shock you:

*i just think it's really fucking funny ok*

This is still in EARLY WIP, and I'm not sure I'll be able to do everything I want with this project. I'm mostly doing it for the bit, but at the same point I want to use it to write my own website.

###### somebody please stop me i have suffered enough already

(also yes the borzoi in front of the trans flag IS the logo and i'm not changing it.)

## How to use:
Just download the 6502.js file and put it in your scripts directory or whatever.
Oh and load it into your .html file don't forget that

## Loading your .bin file
Your assembled 6502 binary can be loaded like this:

<code>LOAD_6502("file.bin").then(res => res.run([], { log: true }));</code>

The empty array we're passing is your **shared memory**.

## Shared memory 

This dubious piece of technology supports shared memory between 6502 and JS. You pass the shared memory while running the program, like such:

<code>LOAD_6502("file.bin").then(res => res.run([
    "Hi i'm in memory!", "Please let me out", () => "I don't want to be here!"
], { log: true }));</code>

Then those fields can be loaded into the accumulator. Shared memory has only
10 fields, so use them as best as you can!

They range from $36 to $3C.

**If** a field you're trying to load is a function, that function will be immediately called.

## Built-in functions
Calling those functions requires **STA** to its address.

Documentation format:

$\<address> [\<arguments>]

"..." means any number of arguments

### $0 [$46]
#### Create HTML Element
Create an HTML Element and saves it as the recently created one

*$46* should store numerical ID of the element you want to create, refer to this list:
1.  \<p>
2.  \<b>
3.  \<i>
4.  \<span>
5.  \<button>

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
1.  click

*$47* should store INDEX of the function from shared memory that should be called upon event detection.

