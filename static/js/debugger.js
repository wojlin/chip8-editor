class Debugger
{
    constructor()
    {   
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
    }

    /// PUBLIC

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

    pressKey(key)
    {
        this.keyMap[key] = true
        console.log(this.keyMap)
    }

    releaseKey(key)
    {
        this.keyMap[key] = false
        console.log(this.keyMap)
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
                button.onmousedown = () => editor.debugger.pressKey(key);
                button.onmouseup = () => editor.debugger.releaseKey(key);
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

        const rightButton = document.createElement("button")
        rightButton.classList.add("debugger-skip-button")
        rightButton.innerHTML = ">"

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

        return memoryDiv
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