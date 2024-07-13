class CodeEditor
{
    static INSTRUCTIONS = 
    [
        ["0nnn", "SYS addr", "Jump to a machine code routine at nnn."],
        ["00E0", "CLS", "Clear the display."],
        ["00EE", "RET", "Return from a subroutine."],
        ["1nnn", "JP addr", "Jump to location nnn."],
        ["2nnn", "CALL addr", "Call subroutine at nnn."],
        ["3xkk", "SE Vx, byte", "Skip next instruction if Vx = kk."],
        ["4xkk", "SNE Vx, byte", "Skip next instruction if Vx != kk."],
        ["5xy0", "SE Vx, Vy", "Skip next instruction if Vx = Vy."],
        ["6xkk", "LD Vx, byte", "Set Vx = kk."],
        ["7xkk", "ADD Vx, byte", "Set Vx = Vx + kk."],
        ["8xy0", "LD Vx, Vy", "Set Vx = Vy."],
        ["8xy1", "OR Vx, Vy", "Set Vx = Vx OR Vy."],
        ["8xy2", "AND Vx, Vy", "Set Vx = Vx AND Vy."],
        ["8xy3", "XOR Vx, Vy", "Set Vx = Vx XOR Vy."],
        ["8xy3", "XOR Vx, Vy", "Set Vx = Vx XOR Vy."],
        ["8xy4", "ADD Vx, Vy", "Set Vx = Vx + Vy, set VF = carry."],
        ["8xy5", "SUB Vx, Vy", "Set Vx = Vx - Vy, set VF = NOT borrow."],
        ["8xy6", "SHR Vx {, Vy}", "Set Vx = Vx SHR 1."],
        ["8xy7", "SUBN Vx, Vy", "Set Vx = Vy - Vx, set VF = NOT borrow."],
        ["8xyE", "SHL Vx {, Vy}", "Set Vx = Vx SHL 1."],
        ["9xy0", "SNE Vx, Vy", "Skip next instruction if Vx != Vy."],
        ["Annn", "LD I, addr", "Set I = nnn."],
        ["Bnnn", "JP V0, addr", "Jump to location nnn + V0."],
        ["Cxkk", "RND Vx, byte", "Set Vx = random byte AND kk."],
        ["Dxyn", "DRW Vx, Vy, nibble", "Display n-byte sprite starting at memory location I at (Vx, Vy)"],
        ["Ex9E", "SKP Vx", "Skip next instruction if key with the value of Vx is pressed."],
        ["ExA1", "SKNP Vx", "Skip next instruction if key with the value of Vx is not pressed."],
        ["Fx07", "LD Vx, DT", "Set Vx = delay timer value."],
        ["Fx0A", "LD Vx, K", "Wait for a key press, store the value of the key in Vx."],
        ["Fx15", "LD DT, Vx", "Set delay timer = Vx."],
        ["Fx18", "LD ST, Vx", "Set sound timer = Vx."],
        ["Fx1E", "ADD I, Vx", "Set I = I + Vx."],
        ["Fx29", "LD F, Vx", "Set I = location of sprite for digit Vx."],
        ["Fx33", "LD B, Vx", "Store BCD representation of Vx in memory locations I, I+1, and I+2."],
        ["Fx55", "LD [I], Vx", "Store registers V0 through Vx in memory starting at location I."],
        ["Fx65", "LD Vx, [I]", "Read registers V0 through Vx from memory starting at location I."],
    ]

    static DEFAULT_COMMENT = "this does nothing right now"

    constructor()
    {
        this.table = document.getElementById("editor-content");
        this.helpers = document.getElementById("helpers")
        this.lines = 0;
        this.memoryStart = 512
        this.memoryEnd = 4096
        this.currentLine = 0;

        this.toRemove = {}

        this.addHeader();
        this.addNewLine();
        this.addHelpers();

        document.addEventListener('click', function(event) 
        {
            const currentLine = editor.currentLine;
            const row = editor.table.children[1].children[currentLine-1]
            if(document.activeElement === row.children[6].children[0])
            {
                
            }else
            {
                row.children[4].children[0].focus()
            }
            
        });

        document.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                editor.addNewLine();
            }
            if (event.key === 'Backspace') {
                editor.removeLine();
            }
            if (event.key === 'ArrowUp') {
                editor.moveCursor(true)
            }
            if (event.key === 'ArrowDown') {
                editor.moveCursor(false)
            }
        });

    }

    useInstruction(button)
    {
        const row = this.table.children[1].children[this.currentLine - 1];
        const input = row.children[4].children[0]

        const code = button.children[0].innerHTML;
        const name = button.children[1].innerHTML;
        const desc = button.children[2].innerHTML;
        
        let instruction = code;
        instruction = instruction.replace(/[x]/g, '0');
        instruction = instruction.replace(/[y]/g, '1');
        instruction = instruction.replace(/[k]/g, '2');
        instruction = instruction.replace(/[n]/g, '3');

        console.log(code,name,desc, instruction)

        input.value = instruction
    }

    addHelpers()
    {
        const instructions = CodeEditor.INSTRUCTIONS
        
        for(let i = 0; i < instructions.length; i++)
        {
            const button = document.createElement("button")
            const code = document.createElement("p")
            code.innerHTML = instructions[i][0]
            const name = document.createElement("p")
            name.innerHTML = instructions[i][1]
            const desc = document.createElement("p")
            desc.innerHTML = instructions[i][2]

            button.appendChild(code)
            button.appendChild(name)
            button.appendChild(desc)
            button.onclick = function() {editor.useInstruction(button);};
            this.helpers.appendChild(button)
        }
    }

    addHeader()
    {

        const head = document.createElement("thead");
        const row = document.createElement("tr");
        const headers = ["line", "memory (dec)", "memory (hex)", "sprite", "instruction", "comment", "notes"]

        headers.forEach(function(headerText) {
            const th = document.createElement("th");
            th.textContent = headerText;
            row.appendChild(th);
        });

        row.cells[0].classList.add("line-column")
        row.cells[1].classList.add("dec-column")
        row.cells[2].classList.add("hex-column")
        row.cells[3].classList.add("sprite-column")
        row.cells[4].classList.add("instruction-column")
        row.cells[5].classList.add("comment-column")
        row.cells[6].classList.add("notes-column")

        head.appendChild(row);
        this.table.insertBefore(head, this.table.firstChild);

        const body = document.createElement("tbody");
        this.table.appendChild(body);

    }

    addNewLine()
    {
        if(this.lines + this.memoryStart > this.memoryEnd)
        {
            console.error("max memory adress reached!")
            return
        }

        const newRow = document.createElement("tr");
        for (var i = 0; i < 7; i++) {
            const newCell = newRow.insertCell(i);
        }
        
        newRow.cells[0].textContent = (this.lines + 1).toString()
        newRow.cells[1].textContent = (this.memoryStart + (this.lines * 2)).toString()
        newRow.cells[2].textContent = "0x" + (this.memoryStart + (this.lines * 2)).toString(16)
        newRow.cells[3].innerHTML = '<input onclick="editor.markAsSprite(this)" type="checkbox">'
        newRow.cells[4].innerHTML = '<input oninput="editor.parseContent(this);" onclick="editor.selectLine(this);" type="text"></div>'
        newRow.cells[5].textContent = CodeEditor.DEFAULT_COMMENT
        newRow.cells[6].innerHTML = '<input onclick="editor.selectLine(this);" type="text" value="// my notes">'
        this.lines += 1
        this.currentLine +=1

        newRow.cells[0].classList.add("line-column")
        newRow.cells[1].classList.add("dec-column")
        newRow.cells[2].classList.add("hex-column")
        newRow.cells[3].classList.add("sprite-column")
        newRow.cells[4].classList.add("instruction-column")
        newRow.cells[5].classList.add("comment-column")
        newRow.cells[6].classList.add("notes-column")


        this.toRemove[this.currentLine] = true;

        const tbody = this.table.getElementsByTagName("tbody")[0];
        const before = tbody.children[this.currentLine - 1]
        tbody.insertBefore(newRow, before);

        newRow.cells[4].children[0].focus();

        for(let i = 0; i < this.lines; i++)
        {
            this.table.rows[i+1].children[0].innerHTML = i + 1
            this.table.rows[i+1].children[1].innerHTML = this.memoryStart + (i*2)
            this.table.rows[i+1].children[2].innerHTML = "0x" + (this.memoryStart + (i*2)).toString(16)
        }
    }

    removeLine(index)
    {
        const row = this.table.rows[this.currentLine];
        const obj = row.children[4].children[0]
        
        if(obj.value == "" && this.lines > 1 && this.toRemove[this.currentLine] == false)
        {
            this.toRemove[this.currentLine] = true
        }
        else if(obj.value == "" && this.lines > 1 && this.toRemove[this.currentLine] == true)
        {
            this.toRemove[this.currentLine] = false
            obj.parentNode.parentNode.remove()
            this.lines -= 1
            this.currentLine -= 1

            const newRow = this.table.rows[this.currentLine];
            const newObj = newRow.children[4].children[0]
            newObj.focus();

            for(let i = 0; i < this.lines; i++)
            {
                this.table.rows[i+1].children[0].innerHTML = i + 1
                this.table.rows[i+1].children[1].innerHTML = this.memoryStart + (i*2)
                this.table.rows[i+1].children[2].innerHTML = "0x" + (this.memoryStart + (i*2)).toString(16)
            }
        }
    }

    makeSpriteComment(binaryString)
    {
        binaryString = binaryString.replace(" ", '')

        let commentString = ""
        let current = 0

        for(let i = 0; i < binaryString.length; i++)
        {   
            current += 1
            commentString += (binaryString[i] == "0") ? "⬛" : "⬜"
            current = (current == 8) ? (commentString += "<br>", 0) : current;
        }
        return commentString
    }

    markAsSprite(obj)
    {
        const input = obj.parentNode.parentNode.children[4].children[0];
        const comment = obj.parentNode.parentNode.children[5]

        if(obj.checked)
        {

            const hexString = (input.value == "") ? "0" : input.value
            const binaryString = parseInt(hexString, 16).toString(2).padStart(16, '0');
            const paddedBinaryString = binaryString.slice(0, 8) + ' ' + binaryString.slice(8, 16);
            
            input.value = paddedBinaryString

            
            comment.innerHTML = this.makeSpriteComment(input.value)
            comment.style.fontSize = "0.9vh";
        }
        else
        {
            const binaryString = input.value.replace(/\s+/g, '')
            const intValue = parseInt(binaryString, 2);
            const hexString = intValue.toString(16).toUpperCase().padStart(4, '0');
            input.value = hexString
            comment.innerHTML = "//"
        }

        this.parseContent(input)
    }

    selectLine(obj)
    {
        this.currentLine = obj.parentNode.parentNode.rowIndex
        obj.focus()
    }

    moveCursor(up = true)
    {
        if(up)
        {
            if(this.currentLine > 1)
            {
                this.currentLine -= 1
                const row = this.table.children[1].children[this.currentLine - 1]
                row.children[4].children[0].focus()
            }
            
        }
        else
        {
            if(this.currentLine < this.lines)
            {
                this.currentLine += 1
                const row = this.table.children[1].children[this.currentLine - 1]
                row.children[4].children[0].focus()
            }
        }
    }

    parseContent(obj)
    {
        obj.value = obj.value.toUpperCase();
        
        const row = obj.parentNode.parentNode;
        const isSprite = row.children[3].children[0].checked
        const line = obj.parentNode.parentNode.rowIndex
        const comment = row.children[5]

        obj.value = isSprite ? obj.value.replace(/[^01 ]/g, '') : obj.value.replace(/[^0-9A-Fa-f]/g, '')

        if(isSprite)
        {
            if (obj.parentNode.classList.contains("error")) 
            {
                obj.parentNode.classList.remove("error")
            }

            obj.maxLength = 17;
    
            let cleanedInput = obj.value.replace(/[^01]/g, '0');
            let binaryContent = cleanedInput
           
            let firstByte = binaryContent.substring(0, 8).padEnd(8, '0');
            let secondByte = binaryContent.substring(9, 17).padEnd(8, '0');
            let newVal = firstByte + ' ' + secondByte;
            obj.value = newVal;

            comment.innerHTML = this.makeSpriteComment(obj.value)
            comment.style.fontSize = "0.9vh";
            
        }
        else
        {
            obj.maxLength = 4;

            if(obj.value.length < 4)
            {
                obj.parentNode.classList.add("error")
            }
            else
            {
                obj.parentNode.classList.remove("error")
            }
        }

        if(obj.value != "")
        {
            this.toRemove[line] = false
        }

        this.updateComment(obj);
    }

    updateComment(input)
    {
        const row = input.parentNode.parentNode;
        const comment = row.children[5]
        const isSprite = row.children[4].children[0].checked;
        const value = input.value;
        console.log(input.value)
        
        if(isSprite)
        {   
            
            const binaryString = input.value.replace(/\s+/g, '')

            let commentString = ""
            let current = 0

            for(let i = 0; i < binaryString.length; i++)
            {   
                current += 1
                commentString += (binaryString[i] == "0") ? "⬛" : "⬜"
                current = (current == 8) ? (commentString += "<br>", 0) : current;
            }
            comment.innerHTML = commentString
            comment.style.fontSize = "0.9vh";
        }
        else
        {
            let found = false
            for(let i = 0; i < CodeEditor.INSTRUCTIONS.length; i++)
            {   
                let regex = new RegExp("^" + CodeEditor.INSTRUCTIONS[i][0].replace(/[knxy]/g, '.') + "$");
                if(regex.test(input.value))
                {
                    let valid =  CodeEditor.INSTRUCTIONS[i][2];
                    valid = valid.replace("Vx", 'V'+value[1])
                    valid = valid.replace("Vy", 'V'+value[2])
                    valid = valid.replace("nnn", value[1] + value[2] + value[3])
                    valid = valid.replace("kk", value[2] + value[3])
                    //valid = valid.replace("n", value[3]) TODO : find out how to replace the needed n and not every
                    comment.innerHTML = valid
                    found = true
                }
            }
            if(!found)
            {
                comment.innerHTML = CodeEditor.DEFAULT_COMMENT
            }
        }
    }

}

var editor = new CodeEditor();
