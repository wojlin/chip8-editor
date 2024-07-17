class KeyboardMapper {
    constructor() {
      this.keyMap = {
        '1': '1', '2': '2', '3': '3', '4': 'C',
        'q': '4', 'w': '5', 'e': '6', 'r': 'D',
        'a': '7', 's': '8', 'd': '9', 'f': 'E',
        'z': 'A', 'x': '0', 'c': 'B', 'v': 'F'
      };
  
      this.init();
    }
  
    init() {
      document.addEventListener('keydown', (event) => this.handleKeyDown(event));
      document.addEventListener('keyup', (event) => this.handleKeyUp(event));
    }
  
    handleKeyDown(event) {
      const mappedKey = this.keyMap[event.key];
      if (mappedKey) {
        this.pressKey(null, mappedKey);
      }
    }
  
    handleKeyUp(event) {
      const mappedKey = this.keyMap[event.key];
      if (mappedKey) {
        this.releaseKey(null, mappedKey);
      }
    }
    
    getObj(mappedKey)
    {
        const table = document.getElementById('debugger-keyboard');
        const rows = table.getElementsByTagName('tr');
        for (let i = 0; i < rows.length; i++) 
        {
            const cells = rows[i].getElementsByTagName('td');
            for (let j = 0; j < cells.length; j++) 
            {
                if(cells[j].innerText == mappedKey)
                {
                    return cells[j].children[0]
                }
            }1
        }
    }

    pressKey(arg1, mappedKey) {
      console.log(`Key pressed: ${mappedKey}`);
      editor.debugger.pressKey(this.getObj(mappedKey), mappedKey)
    }
  
    releaseKey(arg1, mappedKey) {
      console.log(`Key released: ${mappedKey}`);
      editor.debugger.releaseKey(this.getObj(mappedKey), mappedKey)
    }
  }


class Debugger
{
    constructor()
    {   
        this.keyboardMapper = new KeyboardMapper();

        this.codeTable = document.getElementById("editor-content")
        this.currentMemoryStart = 512
        this.memoryLen = 10

        this.memoryStart = 0
        this.memoryEnd = 4096

        this.memory = null
        this.stack = null
        this.v = null
        this.i = null
        this.timers = null
        this.pc = null
        this.display = null

        this.panel = document.getElementById('debugger');
        this.editorTable = document.getElementById("editor-wrapper")
        this.separator = document.getElementById("editor-main-separator")
        this.panel.style.display = "block";
        this.open()

        this.data = editor.grabEditorContent()
        this.chip8 = new CHIP8(this.data, "emulator-display", true, true, true)
        
        this.interval = 100
        this.intervalId = setInterval(() => this.applyData(), this.interval);
        
    }

    /// PUBLIC

    memoryShift(forward = true)
    {
        
        this.currentMemoryStart = forward ? this.currentMemoryStart + 20 : this.currentMemoryStart - 20
        if(this.currentMemoryStart < this.memoryStart)
        {
            this.currentMemoryStart = 0
        }
        if(this.currentMemoryStart > this.memoryEnd - (this.memoryLen*2))
        {
            this.currentMemoryStart = this.memoryEnd - (this.memoryLen*2)
        }
        console.log(this.currentMemoryStart)
        this.updateMemory()
    }

    updateMemory()
    {
        const memoryRowName = this.memory.rows[0]
        const memoryRowDec = this.memory.rows[1]
        const memoryRowHex = this.memory.rows[2]

        let current = 0
        for (let i = this.currentMemoryStart; i < this.currentMemoryStart + (this.memoryLen*2); i+=2) 
        {
            const addr = (this.currentMemoryStart + (current*2)).toString() + "<br>" + "0x" + this.currentMemoryStart.toString(16).padStart(3, "0")
            memoryRowName.cells[current].innerHTML = addr
            const data = "0x" + this.chip8.memory[i].toString(16).padStart(2, "0") + this.chip8.memory[i+1].toString(16).padStart(2, "0")
            memoryRowDec.cells[current].innerHTML = parseInt(data.replace('0x', ''), 16)
            memoryRowHex.cells[current].innerHTML = data
            current += 1
        }
    }

    applyData()
    {
        const pc = this.chip8.programCounter
        
        let rows = this.codeTable.rows;

        for (let i = 1; i < rows.length; i++) 
        {
            rows[i].classList.remove("current-line")
            if(i - 1 == pc - 512)
            {
                rows[i].classList.add("current-line")
            }
        }

        //// V REGISTERS
        const vRowDec = this.v.rows[1]
        const vRowHex = this.v.rows[2]
        for (let i = 0; i < vRowDec.cells.length; i++) 
        {
            if(vRowDec.cells[i].innerHTML != this.chip8.vRegisters[i].toString())
            {
                vRowDec.cells[i].classList.remove("changed")
                vRowHex.cells[i].classList.remove("changed")
                void vRowDec.cells[i].offsetWidth;
                void vRowHex.cells[i].offsetWidth;
                vRowDec.cells[i].classList.add('changed');
                vRowHex.cells[i].classList.add('changed');
            }   

            vRowDec.cells[i].innerHTML = this.chip8.vRegisters[i]
            vRowHex.cells[i].innerHTML = "0x" + this.chip8.vRegisters[i].toString(16).padStart(2, "0")
        }

        //// I REGISTER

        const iRowDec = this.i.rows[1]
        const iRowHex = this.i.rows[2]

        if(iRowDec.cells[0].innerHTML != this.chip8.iRegister[0].toString())
        {
            iRowDec.cells[0].classList.remove("changed")
            iRowHex.cells[0].classList.remove("changed")
            void iRowDec.cells[0].offsetWidth;
            void iRowHex.cells[0].offsetWidth;
            iRowDec.cells[0].classList.add('changed');
            iRowHex.cells[0].classList.add('changed');
        } 

        iRowDec.cells[0].innerHTML = this.chip8.iRegister[0]
        iRowHex.cells[0].innerHTML = "0x" + this.chip8.iRegister[0].toString(16).padStart(4, "0")
     

        //// PROGRAM COUNTER

        const pcRowDec = this.pc.rows[1]
        const pcRowHex = this.pc.rows[2]

        if(pcRowDec.cells[0].innerHTML != this.chip8.programCounter.toString())
        {
            pcRowDec.cells[0].classList.remove("changed")
            pcRowHex.cells[0].classList.remove("changed")
            void pcRowDec.cells[0].offsetWidth;
            void pcRowHex.cells[0].offsetWidth;
            pcRowDec.cells[0].classList.add('changed');
            pcRowHex.cells[0].classList.add('changed');
        } 

        pcRowDec.cells[0].innerHTML = this.chip8.programCounter
        pcRowHex.cells[0].innerHTML = "0x" + this.chip8.programCounter.toString(16).padStart(2, "0")


        //// TIMERS

        const timersRowDec = this.timers.rows[1]
        const timersRowHex = this.timers.rows[2]

        if(timersRowDec.cells[0].innerHTML != this.chip8.soundTimer[0].toString())
        {
            timersRowDec.cells[0].classList.remove("changed")
            timersRowHex.cells[0].classList.remove("changed")
            void timersRowDec.cells[0].offsetWidth;
            void timersRowHex.cells[0].offsetWidth;
            timersRowDec.cells[0].classList.add('changed');
            timersRowHex.cells[0].classList.add('changed');
        } 

        if(timersRowDec.cells[1].innerHTML != this.chip8.delayTimer[0].toString())
        {
            timersRowDec.cells[1].classList.remove("changed")
            timersRowHex.cells[1].classList.remove("changed")
            void timersRowDec.cells[1].offsetWidth;
            void timersRowHex.cells[1].offsetWidth;
            timersRowDec.cells[1].classList.add('changed');
            timersRowHex.cells[1].classList.add('changed');
        } 

        timersRowDec.cells[0].innerHTML = this.chip8.soundTimer[0]
        timersRowDec.cells[1].innerHTML = this.chip8.delayTimer[0]

        timersRowHex.cells[0].innerHTML = "0x" + this.chip8.soundTimer[0].toString(16).padStart(2, "0")
        timersRowHex.cells[1].innerHTML = "0x" + this.chip8.delayTimer[0].toString(16).padStart(2, "0")
        

        //// STACK

        const stackRowDec = this.stack.rows[1]
        const stackRowHex = this.stack.rows[2]
        
        if(stackRowDec.cells[0].innerHTML != this.chip8.stackPointer.toString())
        {
            stackRowDec.cells[0].classList.remove("changed")
            stackRowHex.cells[0].classList.remove("changed")
            void stackRowDec.cells[0].offsetWidth;
            void stackRowHex.cells[0].offsetWidth;
            stackRowDec.cells[0].classList.add('changed');
            stackRowHex.cells[0].classList.add('changed');
        } 

        stackRowDec.cells[0].innerHTML = this.chip8.stackPointer
        stackRowHex.cells[0].innerHTML = "0x" + this.chip8.stackPointer.toString(16).padStart(2, "0")

        for (let i = 0; i < this.chip8.stack.length; i++) 
        {   
            if(stackRowDec.cells[i+1].innerHTML != this.chip8.stack[i].toString())
            {
                stackRowDec.cells[i+1].classList.remove("changed")
                stackRowHex.cells[i+10].classList.remove("changed")
                void stackRowDec.cells[i+1].offsetWidth;
                void stackRowHex.cells[i+1].offsetWidth;
                stackRowDec.cells[i+1].classList.add('changed');
                stackRowHex.cells[i+1].classList.add('changed');
            } 

            stackRowDec.cells[i+1].innerHTML = this.chip8.stack[i]
            stackRowHex.cells[i+1].innerHTML = "0x" + this.chip8.stack[i].toString(16).padStart(2, "0")
        }

        //// MEMORY
        this.updateMemory()
    }

    open()
    {
        editor.dragPanel(this.separator, this.editorTable, this.panel , "V")
        const p = document.createElement("p")
        p.style = "text-align:center;font-size:20px;margin-bottom:2vh;"
        p.innerHTML = "CHIP8 DEBUGGER"
        this.panel.appendChild(p)

        this.memory = this.#createMemory()
        this.stack = this.#createStack()
        this.v = this.#createTableV()

        this.separator.style.display = "block"

        const otherDiv = document.createElement("div")
        otherDiv.id = "debugger-other-panel"
        this.panel.appendChild(otherDiv)
        
        this.i = this.#createTableI()    
        this.pc = this.#createTablePC()

        this.timers = this.#createTableTimers()

        
        this.closeButton = this.#createCloseButton()

        const last = document.createElement("div")
        last.id = "debugger-last-panel"
        last.style.position = "relative"
        this.panel.appendChild(last)

        this.display = this.#createDisplay()
        this.keyboard = this.#createKeyboard()

        this.keyMap = {}
    }

    close()
    {
        this.separator.style.display = "none"
        this.panel.innerHTML = ""
        this.panel.style.display = "none"
        editor.debugger = null;
    }

    pressKey(obj, key)
    {
        console.log(obj)
        this.keyMap[key] = true
        console.log(this.keyMap)
        obj.classList.remove("unpressed")
        obj.classList.add("pressed")
    }

    releaseKey(obj, key)
    {
        this.keyMap[key] = false
        console.log(this.keyMap)
        obj.classList.remove("pressed")
        obj.classList.add("unpressed")
    }

    /// PRIVATE

    #createKeyboard()
    {
        const keys = [
            ['1', '2', '3', 'C'],
            ['4', '5', '6', 'D'],
            ['7', '8', '9', 'E'],
            ['A', '0', 'B', 'F']
        ];

        const table = document.createElement('table');
        table.id = "debugger-keyboard"
        for (let row = 0; row < keys.length; row++) {
            const tr = document.createElement('tr');
            for (let col = 0; col < keys[row].length; col++) {
                const td = document.createElement('td');
                const button = document.createElement('button');
                const key = keys[row][col];
                button.id = `debugger-keyboard-${key}`;
                button.textContent = key;
                button.onmousedown = () => editor.debugger.pressKey(button, key);
                button.onmouseup = () => editor.debugger.releaseKey(button, key);
                button.classList.add("unpressed")
                td.appendChild(button);
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }

        document.getElementById("debugger-last-panel").appendChild(table);

        return table
    }

    #createCloseButton()
    {
        const button = document.createElement("button")
        button.innerHTML = "✕"
        button.id = "debugger-close-button"
        button.onclick = function() {editor.debugger.close()}
        this.panel.appendChild(button)
        return button
    }

    #createDisplay()
    {
        const display = document.createElement("canvas")
        display.id = "emulator-display"
        document.getElementById("debugger-last-panel").appendChild(display)
    }

    #createMemory()
    {
        const cols = 10

        const title = document.createElement("p")
        title.innerHTML = "memory"
        const hr = document.createElement("hr")
        this.panel.appendChild(title)
        this.panel.appendChild(hr)

        const memoryDiv = document.createElement("div");
        memoryDiv.id = "debugger-memory-panel"

        const leftButton = document.createElement("button")
        leftButton.classList.add("debugger-skip-button")
        leftButton.innerHTML = "<"
        leftButton.onclick = function(){editor.debugger.memoryShift(false)};

        const rightButton = document.createElement("button")
        rightButton.classList.add("debugger-skip-button")
        rightButton.innerHTML = ">"
        rightButton.onclick = function(){editor.debugger.memoryShift(true)};

        const table = document.createElement("table");
        table.id = "debugger-memory-table"
        
        const header = table.createTHead();
        const headerRow = header.insertRow(0);

        for (let i = 0; i < cols; i++) {
            const cell = headerRow.insertCell(i);
            const mem = editor.memoryStart + (i*2)
            cell.innerHTML = + mem + " (0x" + mem.toString(16)+ ")";
        }

        const tbody = document.createElement("tbody");
        table.appendChild(tbody);

        const row1 = tbody.insertRow(0);

        for (let i = 0; i < cols; i++) {
            const cell = row1.insertCell(i);
            cell.innerHTML = "0";
        }

        const row2 = tbody.insertRow(1);

        for (let i = 0; i < cols; i++) {
            const cell = row2.insertCell(i);
            cell.innerHTML = "0x0000";
        }

        memoryDiv.appendChild(leftButton)
        memoryDiv.appendChild(table)
        memoryDiv.appendChild(rightButton)
        this.panel.appendChild(memoryDiv);

        return table
    }

    #createStack()
    {   

        const title = document.createElement("p")
        title.innerHTML = "stack"
        const hr = document.createElement("hr")
        this.panel.appendChild(title)
        this.panel.appendChild(hr)

        const div = document.createElement("div");
        div.id = "debugger-stack-panel"

        const cols = 17
        const table = document.createElement("table");
        table.id = "debugger-stack-table"
        table.classList.add("debugger-stack")

        const header = table.createTHead();
        const headerRow = header.insertRow(0);

        const SP = headerRow.insertCell(0);
        SP.innerHTML = "SP"

        for (let i = 1; i < cols; i++) {
            const cell = headerRow.insertCell(i);
            cell.innerHTML = + i - 1;
        }

        const tbody = document.createElement("tbody");
        table.appendChild(tbody);

        const row1 = tbody.insertRow(0);

        for (let i = 0; i < cols; i++) {
            const cell = row1.insertCell(i);
            cell.innerHTML = "0";
        }

        const row2 = tbody.insertRow(1);

        for (let i = 0; i < cols; i++) {
            const cell = row2.insertCell(i);
            cell.innerHTML = "0x00";
        }

        div.appendChild(table)
        this.panel.appendChild(div);

        return table
    }

    #createTableV()
    {   
        const title = document.createElement("p")
        title.innerHTML = "registers"
        const hr = document.createElement("hr")
        this.panel.appendChild(title)
        this.panel.appendChild(hr)

        const div = document.createElement("div");
        div.id = "debugger-registers-panel"

        const cols = 16
        const table = document.createElement("table");
        table.id = "debugger-registers-table"

        const header = table.createTHead();
        const headerRow = header.insertRow(0);

        for (let i = 0; i < cols; i++) {
            const cell = headerRow.insertCell(i);
            cell.innerHTML = "V" + i;
        }

        const tbody = document.createElement("tbody");
        table.appendChild(tbody);

        const row1 = tbody.insertRow(0);

        for (let i = 0; i < cols; i++) {
            const cell = row1.insertCell(i);
            cell.innerHTML = "0";
        }

        const row2 = tbody.insertRow(1);

        for (let i = 0; i < cols; i++) {
            const cell = row2.insertCell(i);
            cell.innerHTML = "0x00";
        }

        div.appendChild(table)
        this.panel.appendChild(div);

        return table
    }

    #createTableI()
    {
        const div = document.createElement("div")
        const title = document.createElement("p")
        title.innerHTML = "I register"
        const hr = document.createElement("hr")

        const table = document.createElement("table");
        table.id="debugger-i-table"

        const header = table.createTHead();
        const headerRow = header.insertRow(0);

        const cell1 = headerRow.insertCell(0);
        cell1.innerHTML = "I";
        
        const tbody = document.createElement("tbody");
        table.appendChild(tbody);

        const row1 = tbody.insertRow(0);

        const cell2 = row1.insertCell(0);
        cell2.innerHTML = "0";

        const row2 = tbody.insertRow(1);

        const cell3 = row2.insertCell(0);
        cell3.innerHTML = "0x0000"; 

        div.appendChild(title)
        div.appendChild(hr)
        div.appendChild(table)
        document.getElementById("debugger-other-panel").appendChild(div);

        return table
    }

    #createTableTimers()
    {

        const div = document.createElement("div")
        const title = document.createElement("p")
        title.innerHTML = "timers"
        const hr = document.createElement("hr")

        const table = document.createElement("table");
        table.id="debugger-timers-table"

        const header = table.createTHead();
        const headerRow = header.insertRow(0);

        const cell1 = headerRow.insertCell(0);
        cell1.innerHTML = "St";

        const cell2 = headerRow.insertCell(1);
        cell2.innerHTML = "Dt";
        
        const tbody = document.createElement("tbody");
        table.appendChild(tbody);

        const row1 = tbody.insertRow(0);

        const cell3 = row1.insertCell(0);
        cell3.innerHTML = "0";

        const cell4 = row1.insertCell(1);
        cell4.innerHTML = "0";

        const row2 = tbody.insertRow(1);

        const cell5 = row2.insertCell(0);
        cell5.innerHTML = "0x00";

        const cell6 = row2.insertCell(1);
        cell6.innerHTML = "0x00";

        div.appendChild(title)
        div.appendChild(hr)
        div.appendChild(table)
        document.getElementById("debugger-other-panel").appendChild(div);

        return table
    }

    #createTablePC()
    {
        const div = document.createElement("div")
        const title = document.createElement("p")
        title.innerHTML = "program counter"
        const hr = document.createElement("hr")

        const table = document.createElement("table");
        table.id = "debugger-pc-table"

        const header = table.createTHead();
        const headerRow = header.insertRow(0);

        const cell1 = headerRow.insertCell(0);
        cell1.innerHTML = "PC";
        
        const tbody = document.createElement("tbody");
        table.appendChild(tbody);

        const row1 = tbody.insertRow(0);

        const cell2 = row1.insertCell(0);
        cell2.innerHTML = "0";

        const row2 = tbody.insertRow(1);

        const cell3 = row2.insertCell(0);
        cell3.innerHTML = "0x0000";
        
        div.appendChild(title)
        div.appendChild(hr)
        div.appendChild(table)
        document.getElementById("debugger-other-panel").appendChild(div);

        return table
    }

}