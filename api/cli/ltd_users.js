const db = require('../_utils/db')

const get_users_with_plan = async()=>{
    const docs = await db.get_many('users',['plan','in',['chartmat_tier1','chartmat_tier2','chartmat_tier3','chartmat_tier4','chartmat_tier5']])
    const mapped  = docs.map(e => {
        return `${e.id} , ${e.email} , ${e.lifetime_campaign || "-"} , ${e.plan}`
    })
    console.log(mapped.join('\n'))
    return
}

get_users_with_plan()