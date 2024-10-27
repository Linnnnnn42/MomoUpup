require('dotenv').config();
const win = nw.Window.get();
const close = document.querySelector("#close");

win.on('close', function () {
    nw.App.unregisterGlobalHotKey(shortcut);
    this.hide();
    this.close(true);
});

win.blur();

win.on('focus', function () {
    close.innerHTML = "OvO";
});

win.on('blur', function () {
    close.innerHTML = "X";
});

close.onclick = () => {
    nw.App.unregisterGlobalHotKey(shortcut);
    win.hide();
    win.close(true);
}

const body = document.querySelector("body");
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