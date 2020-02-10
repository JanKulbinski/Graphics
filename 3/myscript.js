var vertCode =
    'attribute vec3 coordinates;' +
    'attribute float pointSize;' +
    'uniform vec4 translation;' +
    'void main(void) {' +
    '   gl_Position = vec4(coordinates, 1.0) + translation; ' +
    '   gl_PointSize = pointSize;' +
    '}';

var fragCode =
    'precision mediump float;' +
    'uniform vec4 fColor;' +
    'void main(void) {' +
    '   gl_FragColor = fColor;' +
    '}';

var canvas = document.getElementById('canvas');
var gl = canvas.getContext('experimental-webgl');
var angle = 90;
var X, Y;

var vertShader;
var fragShader;
var shaderProgram;
var fColorLocation, coord;

var vertex_buffer = new Array(6);
var numberOfPoints = new Array(6);
var colorsOfPaths = new Array(6);
var randomColors = [0.3, 0.4, 0.3]
var depthPosition = [0.0, 0.25, 0.5, 0.99]
var lastDrawn;
var vertices = [];
var verticesGrade1 = [];


function dataInit() {
    vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertCode); //Attach vertex shader source code
    gl.compileShader(vertShader);


    fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragCode); // Attach fragment shader source code
    gl.compileShader(fragShader);

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    fColorLocation = gl.getUniformLocation(shaderProgram, "fColor");
    coord = gl.getAttribLocation(shaderProgram, "coordinates");
}

// GENERATING POINTS
function generatePoints() {
    for (var i = 0; i < 4; i++) {
        generateHilbertVertices(i + 1, depthPosition[i]);
    }
}

function generateHilbertVertices(n, depth) {
    var step = 2 / (Math.pow(2, n) - 1)
    X = -1.0;
    Y = 1.0;
    angle = 90;
    if (n === 1 && verticesGrade1.length > 0) {
        for (var i = 0; i < verticesGrade1.length; i++) {
            if (i % 3 === 2)
                verticesGrade1.splice(i, 1, depth);
        }
        vertices = verticesGrade1.slice();
    } else {
        vertices.push(X, Y, depth);
        hilbertCurve(n, 90, step, depth);
    }

    numberOfPoints[n] = vertices.length / 3;
    vertex_buffer[n] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer[n]); //ELEMENT_ARRAY_BUFFER when array with indices
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW); //STATIC_DRAW − Data will be specified once and used many times.
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    vertices = [];
}

function hilbertCurve(n, angle, step, depth) {
    if (n <= 0)
        return
    left(angle);
    hilbertCurve(n - 1, -angle, step, depth);
    forward(step, depth);
    right(angle);
    hilbertCurve(n - 1, angle, step, depth);
    forward(step, depth);
    hilbertCurve(n - 1, angle, step, depth);
    right(angle);
    forward(step, depth);
    hilbertCurve(n - 1, -angle, step, depth);
    left(angle);
}

function toRadians(a) {
    return a * (Math.PI / 180);
}

function right(a) {
    angle = angle + a
}

function left(a) {
    angle = angle - a
}

function forward(distance, depth) {
    dx = distance * parseInt(Math.sin(toRadians(angle)).toFixed(3))
    dy = distance * parseInt(Math.cos(toRadians(angle)).toFixed(3))
    X = X + dx
    Y = Y - dy
    vertices.push(X, Y, depth);
}

//DRAWING
function draw(ifSameColor) {
    for (var i = 1; i <= 4; i++) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer[i]);
        gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(coord);
        gl.enable(gl.DEPTH_TEST);
        gl.viewport(0, 0, canvas.width, canvas.height);
        if (ifSameColor)
            randomColors = colorsOfPaths[i].slice();
        else {
            randomColors.splice(0, 3, Math.random(), Math.random(), Math.random())
            colorsOfPaths[i] = randomColors.slice();
        }
        gl.uniform4f(fColorLocation, randomColors[0], randomColors[1], randomColors[2], 1)
        gl.drawArrays(gl.LINE_STRIP, 0, numberOfPoints[i]);
    }
}

function changeDepth() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (var i = 0; i < 4; i++) {
        var newValue = depthPosition[i] + 0.25;
        if (newValue > 0.99)
            newValue = 0;
        depthPosition.splice(i, 1, newValue);
    }
    generatePoints();
    draw(true);
}

document.onkeydown = checkKey;

function checkKey(event) {
    var Tx = 0.0
    var Ty = 0.0;
    var Tz = 0.0;
    switch (event.keyCode) {
        case 37: //LEFT
            Tx = -0.05;
            break;
        case 38: //UP
            Ty = 0.05;
            break;
        case 39: //RIGHT
            Tx = 0.05;
            break;
        case 40: //DOWN
            Ty = -0.05;
            break;
    }

    if (verticesGrade1.length <= 0) {
        var step = 2 / (Math.pow(2, 1) - 1)
        X = -1.0;
        Y = 1.0;
        angle = 90;
        vertices.push(X, Y, depthPosition[1]);
        hilbertCurve(1, 90, step, depthPosition[1]);
        verticesGrade1 = vertices.slice();
        vertices = [];
    }
    for (var i = 0; i < verticesGrade1.length; i++) {
        if (Tx == 0 && i % 3 === 1) {
            verticesGrade1.splice(i, 1, Ty + verticesGrade1[i]);
        } else if (Ty == 0 && i % 3 === 0) {
            verticesGrade1.splice(i, 1, Tx + verticesGrade1[i]);
        }
    }
    vertex_buffer[1] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer[1]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesGrade1), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    draw(true);
}


dataInit();
generatePoints();
draw(false);