const win = nw.Window.get();
win.show(false);
require('dotenv').config();
const fs = require('fs');
const notifier = require("node-notifier");
const path = require("path");
let settings = {};
const menu = new nw.Menu();
const menuAutoDarkMode = new nw.Menu();
const close = document.querySelector("#close");
export const info = document.querySelector('#info');
const body = document.querySelector('body');
let isBody = false;
let isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
let isManualSetTheme = false;
let media = window.matchMedia('(prefers-color-scheme: dark)');
import {shortcut} from "./shortcut.js";

//打开窗口：
win.blur();//取消焦点
//设置主题
function setThemeDependOnIsDark () {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
        setDarkMode();
    } else {
        setLightMode();
    }
}
function setDarkMode (){
    info.style.backgroundColor = "black";
    close.style.backgroundColor = "black";
    info.style.color = "white";
    close.style.color = "white";
}
function setLightMode (){
    info.style.backgroundColor = "white";
    close.style.backgroundColor = "white";
    info.style.color = "black";
    close.style.color = "black";
}
function setAutoDarkMode (e) {
    if (e.matches) {
        setDarkMode();
    } else {
        setLightMode();
    }
}
//设置托盘
let tray = new nw.Tray({
    title: 'MomoUpup', //在MacOS上生效
    // tooltip: 'MomoUpup',
    icon: './img/icon.png'
});
tray.tooltip = 'MomoUpup';
menu.append(new nw.MenuItem({
    label: 'MomoUpup',
    icon: './img/icon.png',
    click: () => {
        win.focus();
    }
}));
menu.append(new nw.MenuItem({
    enabled: false,
    label: '墨墨贴贴',
}));
menu.append(new nw.MenuItem({
    type: 'separator'
}));
menu.append(new nw.MenuItem({
    label: '显示窗口',
    click: () => {
        win.focus();
    }
}));
const hideWindow = new nw.MenuItem({
    label: '隐藏窗口',
    click: () => {
        win.minimize();
        if ( isBody === true ) {
            notifier.notify(
                {
                    title: "墨墨藏起来啦！",
                    message: `系统托盘处可以找到我哦！`,
                    icon: path.join(`${nw.App.startPath.replace(/\\/g, '/')}/img/icon.png`), // Absolute path
                    sound: true,
                    wait: true
                },
                function (err, response, metadata) {
                    // Response is response from notification
                    // Metadata contains activationType, activationAt, deliveredAt
                }
            );
            isBody = null;
        }
    }
});
menu.append(hideWindow);
menu.append(new nw.MenuItem({
    type: 'separator'
}));
const boxShowInTaskBarCheck = new nw.MenuItem({
    type: "checkbox",
    label: '显示任务栏图标',
    click: () => {
        if (boxShowInTaskBarCheck.checked === true) {
            win.setShowInTaskbar(true);
        } else {
            win.setShowInTaskbar(false);
        }
    }
});
menu.append(boxShowInTaskBarCheck);
menu.append(new nw.MenuItem({
    type: 'separator'
}));
const boxAutoDarkMode = new nw.MenuItem({
    type: "checkbox",
    label: '主题跟随系统',
    click: () => {
        if (boxAutoDarkMode.checked === true) {
            setThemeDependOnIsDark();
            media.addEventListener('change', setAutoDarkMode);
            isManualSetTheme = false;
        } else {
            media.removeEventListener('change', setAutoDarkMode);
            isManualSetTheme = true;
        }
    }
});
menuAutoDarkMode.append(boxAutoDarkMode);
menuAutoDarkMode.append(new nw.MenuItem({
    label: "深色",
    click: () => {
        if (boxAutoDarkMode.checked === true) {
            boxAutoDarkMode.checked = false;
            boxAutoDarkMode.click();
        }
        setDarkMode();
        console.log(isManualSetTheme);
    }
}));
menuAutoDarkMode.append(new nw.MenuItem({
    label: "浅色",
    click: () => {
        if (boxAutoDarkMode.checked === true) {
            boxAutoDarkMode.checked = false;
            boxAutoDarkMode.click();
        }
        setLightMode();
        console.log(isManualSetTheme);
    }
}));
menu.append(new nw.MenuItem({
    label: '主题配置',
    submenu: menuAutoDarkMode
}));
//读取并且应用设置
try {
    const data = fs.readFileSync('./settings.json', 'utf8'); // 同步读取文件内容
    settings = JSON.parse(data);
    //设置是否在任务栏中显示
    win.setShowInTaskbar(settings.show_in_taskbar);
    boxShowInTaskBarCheck.checked = settings.show_in_taskbar;
    //设置是否开启主题跟随系统
    boxAutoDarkMode.checked = settings.auto_dark_mode;
    if (settings.auto_dark_mode) {
        isManualSetTheme = false;
        media.addEventListener('change', setAutoDarkMode);
        setThemeDependOnIsDark();
    } else {
        isManualSetTheme = true;
        media.removeEventListener('change', setAutoDarkMode);
        if(settings.default_theme === "dark") {
            setDarkMode();
        } else if (settings.default_theme === "light") {
            setLightMode();
        } else {
            setLightMode();
        }
    }
} catch (err) {
    console.error('Error reading settings.json:', err);
}
tray.menu = menu;


//关闭窗口：
function closeApp() {
    win.hide();
    nw.App.unregisterGlobalHotKey(shortcut);
    tray.remove();
    tray = null;
    //保存是否在任务栏中显示设置
    settings.show_in_taskbar = boxShowInTaskBarCheck.checked;
    //保存是否主题跟随系统设置
    settings.auto_dark_mode = boxAutoDarkMode.checked;
    //保存默认主题
    if (isManualSetTheme) {
        if (info.style.backgroundColor === "white") {
            settings.default_theme = "light";
        } else if (info.style.backgroundColor === "black") {
            settings.default_theme = "dark";
        } else {
            console.error("Fail in saving default_theme");
        }
    }
    //写入设置文件
    fs.writeFileSync('./settings.json', JSON.stringify(settings));
    //关闭窗口
    win.close(true);
}
win.onclose = closeApp;
//html内置按钮关闭窗口
close.onclick = closeApp;

//窗口运行中：
//根据焦点状态调整按钮外观
win.on('focus', function () {
    close.innerHTML = "OvO";
});
win.on('blur', function () {
    close.innerHTML = "X";
});
body.addEventListener('contextmenu', function (event) {
    event.preventDefault(); // 阻止浏览器默认的右键菜单
    if ( isBody === null ) {
    } else {
        isBody = true;
    }
    menu.popup(event.x, event.y);
});

//窗口位置控制
// 键盘控制
body.addEventListener('keydown', function(e) {
    // 定义键盘方向键的e.code值
    let LEFT = 'ArrowLeft',
        UP = 'ArrowUp',
        RIGHT = 'ArrowRight',
        DOWN = 'ArrowDown';

    switch (e.code) { // 使用e.code代替e.keyCode
        case LEFT:
            win.moveBy(-10, 0);
            break;
        case RIGHT:
            win.moveBy(10, 0);
            break;
        case UP:
            win.moveBy(0, -10);
            break;
        case DOWN:
            win.moveBy(0, 10);
            break;
    }
});
//鼠标控制
let startX, startY;
body.addEventListener('mousedown', function(e) {
    if (e.button === 0) {
        startX = e.x;
        startY = e.y;
    }
});
body.addEventListener('mouseup', function(e) {
    if (e.button === 0) {
        startX = e.x - startX;
        startY = Math.floor(1.5*(e.y - startY));
        win.moveBy(startX, startY);
    }
});

win.show(true);