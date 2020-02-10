const canvas = document.getElementById('myCanvas');
const svg = document.getElementById("hilbert");
const width = 700
const height = 700
var minX = 0;
var maxX = 800;
var minY = 0;
var maxY = 500;
var turtleX = 2
var turtleY = 2
var angle = 90
var pen = true;
let points = `${2},${2} `

function rx(x) {
    return (x - minX) / (maxX - minX) * (width);
}

function ry(y) {
    return (y - minY) / (maxY - minY) * (height);
}

function checkCoordinates(x, y) {
    if (rx(x) > width || rx(x) < 0 || ry(y) > height || ry(y) < 0) {
        return false;
    } else {
        return true;
    }
}

function right(a) {
    angle = angle + a
}

function left(a) {
    angle = angle - a
}

function toRadians(a) {
    return a * (Math.PI / 180);
}

function forward(distance) {
    dx = distance * parseInt(Math.sin(toRadians(angle)).toFixed(3))
    dy = distance * parseInt(Math.cos(toRadians(angle)).toFixed(3))
    turtleX = turtleX + dx
    turtleY = turtleY + dy

    if (!checkCoordinates(turtleX, turtleY)) {
        turtleX -= dx;
        turtleY -= dy;
        return;
    }
    points = points.concat(`${turtleX},${turtleY} `);
}

function hilbertCurve(n, angle, step) {
    if (n <= 0)
        return

    left(angle);
    hilbertCurve(n - 1, -angle, step);
    forward(step);
    right(angle);
    hilbertCurve(n - 1, angle, step);
    forward(step);
    hilbertCurve(n - 1, angle, step);
    right(angle);
    forward(step);
    hilbertCurve(n - 1, -angle, step);
    left(angle);
}

function clear() {
    points = `${2},${2} `
    turtleX = 2
    turtleY = 2
    angle = 90
    pen = true;
}

function setHilbert() {
    clear()
    var e = document.getElementById("selector");
    var n = parseInt(e.options[e.selectedIndex].text);
    var step = Math.floor(width / (Math.pow(2, n + 1)))
    hilbertCurve(n, 90, step)
    svg.innerHTML = `<polyline points="${points}" style="fill:none;stroke:black;stroke-width:1" />`;
}

document.getElementById("selector").addEventListener("change", setHilbert)