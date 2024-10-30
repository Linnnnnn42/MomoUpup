const win = nw.Window.get();
win.show(false);
require('dotenv').config();
const fs = require('fs');
const notifier = require("node-notifier");
const path = require("path");
let settings = {};
const menu = new nw.Menu();
const close = document.querySelector("#close");
const info = document.querySelector('#info');
const body = document.querySelector('body');
let isBody = false;
let isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
let media = window.matchMedia('(prefers-color-scheme: dark)');

//打开窗口：
win.blur();//取消焦点
//设置主题
setDarkMode(isDark);
function setDarkMode (e) {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log(isDark);
    if (e.matches || isDark) {
        console.log('暗模式已启用');
        info.style.backgroundColor = "black";
        close.style.backgroundColor = "black";
        info.style.color = "white";
        close.style.color = "white";
    } else {
        console.log('暗模式未启用');
        info.style.backgroundColor = "white";
        close.style.backgroundColor = "white";
        info.style.color = "black";
        close.style.color = "black";
    }
}
media.addEventListener('change', setDarkMode);
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
const showInTaskBarCheckbox = new nw.MenuItem({
    type: "checkbox",
    label: '显示任务栏图标',
    click: () => {
        if (showInTaskBarCheckbox.checked === true) {
            win.setShowInTaskbar(true);
        } else {
            win.setShowInTaskbar(false);
        }
    }
});
menu.append(showInTaskBarCheckbox);
//读取并且应用设置
fs.readFile('./settings.json', (err, data) => {
    if (err) {
        console.error('Error reading settings.json:', err);
        return;
    }
    settings = JSON.parse(data);
    win.setShowInTaskbar(settings.show_in_taskbar);
    showInTaskBarCheckbox.checked = settings.show_in_taskbar;
});
tray.menu = menu;


//关闭窗口：
function closeApp() {
    win.hide();
    settings.show_in_taskbar = showInTaskBarCheckbox.checked;
    fs.writeFile('./settings.json', JSON.stringify(settings),
        (err) => {console.log(err)});
    tray.remove();
    tray = null;
    nw.App.unregisterGlobalHotKey(shortcut);
    this.close(true);
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
//键盘控制
body.addEventListener('keydown', function(e) {
    let LEFT = 37,
        UP = 38,
        RIGHT = 39,
        DOWN = 40;

    switch (e.keyCode) {
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
    startX = e.x - startX;
    startY = Math.floor(1.5*(e.y - startY));
    win.moveBy(startX, startY);
});

win.show(true);