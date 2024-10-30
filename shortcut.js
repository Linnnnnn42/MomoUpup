require('dotenv').config();
import { update } from "./update.js";
const clipboard = nw.Clipboard.get();
const info = document.querySelector("#info");


const option = {
    key: process.env.SHORTCUT,
    active: function() {
        const text = clipboard.get('text');
        info.innerHTML = text;
        update(text).catch((err) => {console.log(err)});
    },
    failed: function(msg) {
        console.log(msg);
    }
}
export const shortcut = new nw.Shortcut(option);
nw.App.registerGlobalHotKey(shortcut);