const fs = require("node:fs");
require('dotenv').config();

const option = {
    key: process.env.SHORTCUT,
    active: function() {
        const update = fs.readFileSync("./update.js", "utf8");
        eval(update);
    },
    failed: function(msg) {
        console.log(msg);
    }
}

const shortcut = new nw.Shortcut(option);
nw.App.registerGlobalHotKey(shortcut);