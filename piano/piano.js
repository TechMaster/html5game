var c, ctx;
var onBlackKey = false;

var keyWidth;
var keys = [];
var blackKeys = [];
var notes = [];

var naturals = [];
var sharps = [];

var mouseDown = false;

// maps qwerty keyboard keycodes to keys[] indices
var KEYMAP = {
    90: 0,
    88: 1,
    67: 2,
    86: 3,
    66: 4,
    78: 5,
    77: 6,
    188: 7,
    190: 8,
    191: 9,
    81: 10,
    87: 11,
    69: 12,
    82: 13,
    84: 14,

    83: 15,
    68: 16,

    71: 17,
    72: 18,
    74: 19,

    76: 20,
    186: 21,
    
    50: 22,
    51: 23,
    52: 24,




}

function generateNoteValues() {
    var numKeys = 88;
    var startNote = "C3"

    var i = 0;
    var started = false;
    for (var n in NOTES) {
        if ((n == startNote || started) && i < numKeys) {
            started = true;
            if (n.includes("s")) {
                sharps.push(NOTES[n]);
            } else {
                naturals.push(NOTES[n]);
            }
            i++;
        }
    }
}

generateNoteValues();

function setCanvasSize() {
    c.width = window.innerWidth;
    if (window.innerHeight < window.innerWidth / 4) {
        c.height = window.innerHeight;
    } else {
        c.height = window.innerWidth / 4;
    }
    keyWidth = c.width / 14;
    drawPiano();
}

window.onload = function() {
    c = document.getElementById("canvas");
    ctx = c.getContext("2d");
    setCanvasSize();

    document.addEventListener("keydown", function(e) {
        key = KEYMAP[e.which];

        if (key != null && !keys[key].started) {
            keys[key].start();
        }
    });

    document.addEventListener("keyup", function(e) {
        key = KEYMAP[e.which];

        if (key != null && keys[key].started) {
            keys[key].stop();
        }
    });
    
    //todo: figure out what"s breaking events on touch, how touch works, handle sliding
    c.addEventListener("touchstart", function(e) {
        var pos = getMousePos(e);
        var touch = e.touches[e.touches.length - 1];
        var mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        c.dispatchEvent(mouseEvent);
    });

    c.addEventListener("touchend", function(e) {
            var mouseEvent = new MouseEvent("mouseup", {});
            c.dispatchEvent(mouseEvent);
    });

    c.addEventListener("mousedown", function(e) {
        mouseDown = true;

        var pos = getMousePos(e);

        for (var i = 0; i < keys.length; i++) {
            if (keys[i].contains(pos.x, pos.y) && !keys[i].started) {
                keys[i].start();
            }
        }
    });

    c.addEventListener("mouseup", function(e) {
        mouseDown = false;
        var pos = getMousePos(e);
        for (var i = 0; i < keys.length; i++) {
            if (keys[i].contains(pos.x, pos.y) && keys[i].started){
                keys[i].stop();
            }
        }
    });

    c.addEventListener("mouseout", function(e) {
        mouseDown = false;
        for (var i = 0; i < keys.length; i++) {
            if (keys[i].started) {
                keys[i].stop();
            }
        }
    });

    c.addEventListener("mousemove", function(e) {
        var pos = getMousePos(e);
        for (var i = 0; i < keys.length; i++) {
            if (!keys[i].contains(pos.x, pos.y) && keys[i].started) {
                keys[i].stop();
            } 
            else if (keys[i].contains(pos.x, pos.y) && !keys[i].started && mouseDown) {
                keys[i].start();
            }
        }
    });

    // Prevent scrolling when touching the canvas
    document.body.addEventListener("touchstart", function (e) {
        if (e.target == c) {
            e.preventDefault();
        }
    }, false);
    document.body.addEventListener("touchend", function (e) {
        if (e.target == c) {
            e.preventDefault();
        }
    }, false);
    document.body.addEventListener("touchmove", function (e) {
        if (e.target == c) {
            e.preventDefault();
        }
    }, false);

    window.addEventListener("resize", setCanvasSize, false);
}

function getMousePos(e) {
    var rect = c.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    return {x: x, y: y};

}

function drawPiano() {
    keys = [];
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.strokeStyle = "gray";

    for (var i = 0; i <= c.width / keyWidth; i++) {
        keys.push(new Key(i * keyWidth, 0, keyWidth, c.height, "white", naturals[i]));
    }

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(c.width, 0)
    ctx.moveTo(0, c.height);
    ctx.lineTo(c.width, c.height);
    ctx.stroke();

    addBlackKeys();

    for (var i = 0; i < keys.length; i++) {
        keys[i].draw();
    }
}
function addBlackKeys() {
    var n = 0;
    for (var i = 0; i < keys.length; i++) {
        if (sharps[n] < keys[i].pitch) {
            addBlackKey(i, n);
            n++;
        }
    }
}

function addBlackKey(pos, note) {
    var k = new Key(pos * keyWidth - keyWidth / 4, 0, keyWidth / 2, c.height / 2, "black", sharps[note])
    keys.push(k);
    blackKeys.push(k);
}

class Key {
    constructor(x, y, width, height, type, pitch) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.type = type;
        this.pitch = pitch;
        this.note = new Note(this.pitch);
        this.started = false;
    }

    contains(x, y) {
        if (x > this.x && y > this.y && x < this.x + this.width && y < this.y + this.height) {
            if (this.type == "white") {
                for (var i = 0; i < blackKeys.length; i++) {
                    if (blackKeys[i].contains(x, y)) {
                        return false;
                    }
                }
                return true;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    draw() {
        if (this.type == "black") {
            ctx.fillStyle = "black";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y + this.height);
            ctx.stroke();
        }
    }
    
    start() {
        this.note = new Note(this.pitch);
        this.note.start(0);
        this.started = true;
    }

    stop() {
        this.note.stop(0);
        this.started = false;
    }
}
