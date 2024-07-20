const db = require('../_utils/db')
const _ = require("lodash")

// const ids = ['cuZI5VUKBaSlaONppXiv']

const get_workspaces = async () => {
    const docs = await db.get_many('workspaces');
    return docs.map(d => d.id)
}

const process_workspace = async (workspace_id) => {
    const doc = await db.get_id('workspaces', workspace_id)

    if (doc.boards) {
        for (const b of doc.boards) {
            await db.create_or_update(`/workspaces/${workspace_id}/boards`, b.id, b)
        }
    }
    return doc
}

const process = async () => {
    const ids = await get_workspaces()
    let i = 921
    for (const id of ids.slice(921, ids.length)) {
        await process_workspace(id)
        console.log(i, id)
        i = i + 1
    }
}

process()