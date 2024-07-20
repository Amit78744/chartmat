const fs = require('fs')

// const users = fs.readFileSync('./users-dump.json')
const workspace = JSON.parse(fs.readFileSync('./workspace.json'))

for (const w of workspace) {
    sizeInKb = (JSON.stringify(w).length + 77 + 20 + 32) / 1024
    if (sizeInKb > 500) {
        console.log(w.boards[0].workspace_id,w.name, sizeInKb, "kb")
    }
}

