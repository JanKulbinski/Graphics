//Texture bylo tworzone aby korzytsac z tesktur, ale nie działało - może kiedyś sie przyda
var vertexShaderSrc = "" +
    "attribute vec4 aVertexPosition; \n" +
    "attribute vec2 a_texcoord; \n"
"uniform vec3 uMove; \n" +
"varying vec2 v_texcoord; \n"
"void main( void ) { \n" +
"  gl_PointSize=16.0; \n" +
"  v_texcoord = a_texcoord; \n" +
"  gl_Position= aVertexPosition+ vec4( uMove, 0); \n" +
"} \n";

var fragmentShaderSrc = "" +
    "precision mediump float; \n" +
    "uniform vec3 uColorRGB; \n" +
    "varying vec2 v_texcoord; \n" +
    "uniform sampler2D u_texture; \n" +
    "void main( void ) { \n" +
    "  gl_FragColor = vec4( uColorRGB, 1.0 ) * texture2D(u_texture, v_texcoord);\n" +
    "} \n";



var gl;
var glObjects;
var html;
var data;

var dataInit = function() {
    data = {};
    data.background = [0, 0, 0, 1];

    /* player object */
    data.player1 = {};
    data.player1.speed = 0.001; // ?
    data.player1.direction = [0, 0, 0];
    // parameters for drawObject
    data.player1.position = [0, 0.0, 0.7];
    data.player1.colorRGB = [1.0, 1.0, 1.0];
    data.player1.bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, data.player1.bufferId);
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array([-0.2, 0.8,
            0.2, 0.8,
            0.2, 0.7, -0.2, 0.7, -0.2, 0.8
        ]), gl.STATIC_DRAW); // load object's shape
    data.player1.floatsPerVertex = 2;
    data.player1.NumberOfVertices = 5;
    data.player1.drawMode = gl.TRIANGLE_STRIP;

    /*player2 object */
    data.player2 = {};
    data.player2.speed = 0.001; // ?
    data.player2.direction = [0, 0, 0];
    // parameters for drawObject
    data.player2.position = [0, 0, 0.7];
    data.player2.colorRGB = [1.0, 1.0, 1.0];
    data.player2.bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, data.player2.bufferId);
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array([-0.2, -0.8,
            0.2, -0.8,
            0.2, -0.7, -0.2, -0.7, -0.2, -0.8
        ]), gl.STATIC_DRAW); // load object's shape
    data.player2.floatsPerVertex = 2;
    data.player2.NumberOfVertices = 5;
    data.player2.drawMode = gl.TRIANGLE_STRIP;

    /* Static foreground object */
    data.penaltyArea = {};
    // parameters for drawObject
    data.penaltyArea.position = [0, 0, 0.8];
    data.penaltyArea.colorRGB = [0.1, 0.4, 0.5];
    data.penaltyArea.bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, data.penaltyArea.bufferId);
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array([-1, 0.95, 1, 0.95, -1, 0.85, 1, 0.85, -1, 0.75, 1, 0.75, -1, 0.65, 1, 0.65, -1, 0.55, 1, 0.55, -1, -0.95, 1, -0.95, -1, -0.85, 1, -0.85, -1, -0.75, 1, -0.75, -1, -0.65, 1, -0.65, -1, -0.55, 1, -0.55]), gl.STATIC_DRAW); // load object's shape
    data.penaltyArea.floatsPerVertex = 2;
    data.penaltyArea.NumberOfVertices = 20;
    data.penaltyArea.drawMode = gl.LINES;

    /* Static foreground object - half line*/
    data.halfLine = {};
    // parameters for drawObject
    data.halfLine.position = [0, 0, 0.8];
    data.halfLine.colorRGB = [1.0, 0.0, 0.0];
    data.halfLine.bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, data.halfLine.bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, 0.0, 1.0, 0.0]), gl.STATIC_DRAW); // load object's shape
    data.halfLine.floatsPerVertex = 2;
    data.halfLine.NumberOfVertices = 4;
    data.halfLine.drawMode = gl.LINES;


    /*Ball object*/
    data.ball = {};
    data.ball.speed = 0.0005; // ?
    data.ball.direction = [0, 1.0, 0];
    // parameters for drawObject
    data.ball.position = [0, 0, 0];
    data.ball.colorRGB = [1.0, 1.0, 0.0];
    data.ball.bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, data.ball.bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0]), gl.STATIC_DRAW); // load object's shape
    data.ball.floatsPerVertex = 2;
    data.ball.NumberOfVertices = 1;
    data.ball.drawMode = gl.POINTS;

    //background
    data.bg = {};
    data.bg.position = [0, 0, 0]
    data.bg.colorRGB = [0.0, 0.0, 0.0];
    data.bg.bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, data.bg.bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW);

    /* animation */
    data.animation = {};
    data.animation.requestId = 0;
}


var drawObject = function(obj) {
    /* draw object obj */
    gl.useProgram(glObjects.shaderProgram);
    gl.lineWidth(3);
    gl.enableVertexAttribArray(glObjects.aVertexPositionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.bufferId); /* refer to the buffer */
    gl.vertexAttribPointer(glObjects.aVertexPositionLocation, obj.floatsPerVertex, gl.FLOAT, false, 0 /* stride */ , 0 /*offset */ );
    gl.uniform3fv(glObjects.uMoveLocation, obj.position);
    gl.uniform3fv(glObjects.uColorRGBLocation, obj.colorRGB);
    gl.drawArrays(obj.drawMode, 0 /* offset */ , obj.NumberOfVertices);
}

var redraw = function() {
    var bg = data.background;

    gl.useProgram(glObjects.shaderProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, data.bg.bufferId);
    gl.enableVertexAttribArray(texcoordLocation);
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 255, 255]));

    // Asynchronously load an image
    var image = new Image();
    image.src = "resources/f-texture.png";
    image.addEventListener('load', function() {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    });
    gl.drawArrays(gl.TRIANGLE_STRIP, 0 /* offset */ , 4);
    //gl.clearColor(bg[0], bg[1], bg[02], bg[3]);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawObject(data.player1);
    drawObject(data.player2);
    drawObject(data.penaltyArea);
    drawObject(data.halfLine);
    drawObject(data.ball);

}

var animate = function(time) {
    var timeDelta = time - data.animation.lastTime;
    data.animation.lastTime = time;

    //Player1
    var x = data.player1.position[0] + data.player1.direction[0] * data.player1.speed * timeDelta;
    if (Math.abs(x) < 0.82)
        data.player1.position[0] = (x + 3) % 2 - 1;

    //Player2
    var x = data.player2.position[0] + data.player2.direction[0] * data.player2.speed * timeDelta;
    if (Math.abs(x) < 0.82)
        data.player2.position[0] = (x + 3) % 2 - 1;


    //Ball
    var x = data.ball.position[0] + data.ball.direction[0] * data.ball.speed * timeDelta;
    var y = data.ball.position[1] + data.ball.direction[1] * data.ball.speed * timeDelta;

    if (Math.abs(x) > 0.99)
        data.ball.direction[0] = data.ball.direction[0] * -1.0;

    if (y > 0.68) {
        if (Math.abs(data.player1.position[0] - x) <= 0.2) {
            data.ball.direction[1] = data.ball.direction[1] * -1.0;
            data.ball.direction[0] = (x - data.player1.position[0]) / 0.4;
            data.ball.speed *= 1.05
        } else {
            startGame();
            alert("Game over! Upper has lost!");
            return;
        }
    } else if (y < -0.68) {
        if (Math.abs(data.player2.position[0] - x) <= 0.2) {
            data.ball.direction[1] = data.ball.direction[1] * -1.0;
            data.ball.direction[0] = (x - data.player2.position[0]) / 0.4;
            data.ball.speed *= 1.05
        } else {
            startGame();
            alert("Game over! Lower has lost!");
            return;
        }
    }

    x = data.ball.position[0] + data.ball.direction[0] * data.ball.speed * timeDelta;
    y = data.ball.position[1] + data.ball.direction[1] * data.ball.speed * timeDelta;
    data.ball.position[0] = (x + 3) % 2 - 1;
    data.ball.position[1] = (y + 3) % 2 - 1;


    redraw();
    gl.finish();
    data.animation.requestId = window.requestAnimationFrame(animate);
}

var animationStart = function() {
    data.animation.lastTime = window.performance.now();
    data.animation.requestId = window.requestAnimationFrame(animate);
}

var animationStop = function() {
    if (data.animation.requestId)
        window.cancelAnimationFrame(data.animation.requestId);
    data.animation.requestId = 0;
    redraw();
}





var htmlInit = function() {
    html = {};
    html.html = document.querySelector('#htmlId');
    html.canvas = document.querySelector('#canvasId');
};

var glInit = function(canvas) {
    gl = canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    glObjects = {};

    /* create executable shader program */
    glObjects.shaderProgram = compileAndLinkShaderProgram(gl, vertexShaderSrc, fragmentShaderSrc);
    /* attributes */
    glObjects.aVertexPositionLocation = gl.getAttribLocation(glObjects.shaderProgram, "aVertexPosition");
    glObject.texcoordLocation = gl.getAttribLocation(program, "a_texcoords");
    /* uniform variables */
    glObjects.uMoveLocation = gl.getUniformLocation(glObjects.shaderProgram, "uMove");
    glObjects.uColorRGBLocation = gl.getUniformLocation(glObjects.shaderProgram, "uColorRGB");

};

var compileAndLinkShaderProgram = function(gl, vertexShaderSource, fragmentShaderSource) {
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(vertexShader));
        console.log(gl);
        return null;
    }

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(fragmentShader));
        console.log(gl);
        return null;
    }

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.log("Could not initialise shaders");
        console.log(gl);
        return null;
    }
    // SUCCESS 
    return shaderProgram;
};


var callbackOnKeyDown = function(e) {
    var code = e.which || e.keyCode;
    switch (code) {
        case 65: // A - left player2
            data.player2.direction = [-1, 0];
            if (data.animation.requestId == 0) animationStart();
            break;
        case 68: // D - right player 2
            data.player2.direction = [1, 0];
            if (data.animation.requestId == 0) animationStart();
            break;
        case 37: // left arrow - left player 2
            data.player1.direction = [-1, 0];
            if (data.animation.requestId == 0) animationStart();
            break;
        case 39: // right arrow - left player 2
            data.player1.direction = [1, 0];
            if (data.animation.requestId == 0) animationStart();
            break;
    }
}

var callbackOnKeyUp = function(e) {
    var code = e.which || e.keyCode;
    switch (code) {
        case 65: // A - left player2
            data.player2.direction = [0, 0];
            if (data.animation.requestId == 0) animationStart();
            break;
        case 68: // D - right player 2
            data.player2.direction = [0, 0];
            if (data.animation.requestId == 0) animationStart();
            break;
        case 37: // left arrow - left player 2
            data.player1.direction = [0, 0];
            if (data.animation.requestId == 0) animationStart();
            break;
        case 39: // right arrow - left player 2
            data.player1.direction = [0, 0];
            if (data.animation.requestId == 0) animationStart();
            break;

    }
}

function startGame() {
    glInit(html.canvas);
    dataInit();
    redraw();
}

window.onload = function() {
    htmlInit();
    startGame()
    redraw();
    window.onkeydown = callbackOnKeyDown;
    window.onkeyup = callbackOnKeyUp;
};