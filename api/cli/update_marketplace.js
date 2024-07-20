const db = require('../_utils/db')
const _ = require("lodash")

// const ids = ['cuZI5VUKBaSlaONppXiv']

const get_catalogs = async () => {
    const docs = await db.get_many('marketplace_catalog');
    return docs
}

const get_board = async (id) => {
    const doc = await db.get_id('marketplace_boards', id)
    return doc
}

const process = async () => {
    const catalogs = await get_catalogs();
    for (let c of catalogs) {
        const board = await get_board(c.id)
        c['price'] = 0
        c['name'] = board['name'] || board['title']
        await db.update_one('marketplace_catalog', c.id, c)
    
    }
}

process()