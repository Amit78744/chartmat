const db = require('../_utils/db')
const _ = require("lodash")

// [old,new]
const emails = [
    // ['stevenorechow@hey.com', "stevenorechow@pm.me"]
    ['wthouse@tommyhouse.com', "wthouse@me.com"]
]
const get_user = async (email) => {
    const doc = await db.get_one('users', ['email', '==', email])
    return doc
}

const update_user = async (user_id, new_email) => {
    await db.update_one('users', user_id, { 'email': new_email })
    const doc = await db.get_id('users',user_id)
    return doc
}

const get_workspace = async (user_id) => {
    const doc = await db.get_one('workspaces', ['created_by', '==', user_id])
    return doc
}

const main = async () => {
    for (const e of emails) {
        const u = await get_user(e[0])
        console.log(u)
        const n = await update_user(u.id, e[1])
        console.log(n)
        const w = await get_workspace(u.id)
        console.log(w)
    }
}
main()