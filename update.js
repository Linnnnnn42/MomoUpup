import { CONFIG } from "./config.js";
let id = "";
let notepad = {};
let notepadContent = [];
let notepadToPost = {};
const notifier = require('node-notifier');
const path = require('path');
const clipboard = nw.Clipboard.get();
import {info} from "./index.js";
import {getDescription} from "./bingDescription.js";

export async function update(text) {
    if ( text.length <= 1) {
        notifier.notify(
            {
                title: "您输入的字符太少啦",
                message: `请输入至少两个字符`,
                icon: path.join(`${nw.App.startPath.replace(/\\/g, '/')}/img/icon.png`), // Absolute path
                sound: true, // Only Notification Center or Windows Toasters
                wait: true // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
            },
            function (err, response, metadata) {
                // Response is response from notification
                // Metadata contains activationType, activationAt, deliveredAt
            }
        );
        return;
    }
    //查询词语意思
    // 正则表达式说明：
    // ^: 匹配字符串的开始
    // 必应词典为您提供: 文字字面量匹配
    // \w+: 匹配一个或多个单词字符（字母、数字或下划线）
    // 的释义，: 文字字面量匹配
    // (?:美\[.*?\]，)?: 非捕获组，匹配“美[音标]，”部分，其中.*?表示懒惰匹配任意字符，整个组是可选的
    // (?:英\[.*?\]，)?: 类似地，匹配“英[音标]，”部分，也是可选的
    // 可以使用$1来引用捕获的单词，并在其后添加“. ”以保持格式一致
    let description = await getDescription(text).catch((err) => {console.log(err)});
    let prefixPattern = /^必应词典为您提供(\w+)的释义，(?:美\[.*?，)?(?:英\[.*?，)?/;
    let cleanedDescription = description.replace(prefixPattern, '');
    notifier.notify(
        {
            title: text,
            message: `${cleanedDescription}`,
            icon: path.join(`${nw.App.startPath.replace(/\\/g, '/')}/img/icon.png`), // Absolute path
            sound: true, // Only Notification Center or Windows Toasters
            wait: false // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
        },
        function (err, response, metadata) {
            // Response is response from notification
            // Metadata contains activationType, activationAt, deliveredAt
        }
    );
    //获取词书id
    try {
        const response = await fetch(
            `https://open.maimemo.com/open/api/v1/notepads?limit=${1}&offset=${1}`,
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: CONFIG.TOKEN
                }
            });
        const data = await response.json();
        id = data.data.notepads[0].id;
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
                    Authorization: CONFIG.TOKEN
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
    console.log(notepadContent);
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
    notepadContent = [];//清空存储的剪贴板内容

    // 更新云词本
    try {
        const response = await fetch(
            `https://open.maimemo.com/open/api/v1/notepads/${id}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: CONFIG.TOKEN
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
                    icon: path.join(`${nw.App.startPath.replace(/\\/g, '/')}/img/icon.png`), // Absolute path
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
}