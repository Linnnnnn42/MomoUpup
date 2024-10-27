require('dotenv').config();
let id = "";
let notepad = {};
let notepadContent = [];
let notepadToPost = {};
const notifier = require('node-notifier');
const path = require('path');
const info = document.querySelector("#info");
const clipboard = nw.Clipboard.get();
const text = clipboard.get('text');

info.innerHTML = text;

notifier.notify(
    {
        title: text,
        message: `${text} received!`,
        icon: path.join('./icon.png'), // Absolute path (doesn't work on balloons)
        sound: true, // Only Notification Center or Windows Toasters
        wait: true // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
    },
    function (err, response, metadata) {
        // Response is response from notification
        // Metadata contains activationType, activationAt, deliveredAt
    }
);

(async function update() {
    //获取词书id
    try {
        const response = await fetch(
            `https://open.maimemo.com/open/api/v1/notepads?limit=${1}&offset=${1}`,
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: process.env.TOKEN
                }
            });
        const data = await response.json();
        id = data.data.notepads[0].id;
        // info.innerHTML = "id="+data.data.notepads[0].id;
    } catch (error) {
        console.error(error);
    }

    //根据id获取词书内容
    try {
        const response = await fetch(
            `https://open.maimemo.com/open/api/v1/notepads/${id}`,
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: process.env.TOKEN
                }
            });
        const data = await response.json();
        notepad = data;
        data.data.notepad.list.forEach ((item) => {
            if (item.type === "CHAPTER") {
            } else {
                notepadContent.push(item.word);
            }
        });
    } catch (error) {
        console.error(error);
    }

    //读取剪贴板，获取要添加的词语，并清空剪贴板
    notepadContent.push(text);
    notepadToPost = JSON.stringify({
        notepad: {
            status: notepad.data.notepad.status,
            content: `//\n${notepadContent.join("\n")}`,
            title: notepad.data.notepad.title,
            brief: notepad.data.notepad.brief,
            tags: notepad.data.notepad.tags
        }
    });
    clipboard.clear(); //清空剪贴板

    // 更新云词本
    try {
        const response = await fetch(
            `https://open.maimemo.com/open/api/v1/notepads/${id}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: process.env.TOKEN
                },
                body: notepadToPost
            });
        const data = await response.json();
        if (data) {
            info.innerHTML = `${text} uploaded!`;
            notifier.notify(
                {
                    title: text,
                    message: `${text} uploaded!`,
                    icon: path.join('./icon.png'), // Absolute path (doesn't work on balloons)
                    sound: true, // Only Notification Center or Windows Toasters
                    wait: true // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
                },
                function (err, response, metadata) {
                    // Response is response from notification
                    // Metadata contains activationType, activationAt, deliveredAt
                }
            );
        }
    } catch (error) {
        console.error(error);
    }

})().catch(console.error);