const db = require('../_utils/db')
const _ = require("lodash")

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const main = async () => {
    const codes = require('./free-appsumo-codes.json')
    let i = 0;
    try {
        for (const c of _.chunk(codes, 400)) {
            await db.add_many("appsumo_apr_2023", c)
        }
        console.log("loaded")
        return "done"
    } catch (e) {
        console.log(e)
    }
}

main()