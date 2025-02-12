// World.js
// Sourced from ColoredPoint.js (c) 2012 matsuda with CSE 160 Additional functionality
// Vertex shader program

// Ideas for add ons:
//  Last 5 used colors
var VSHADER_SOURCE =`
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    attribute vec2 a_TexCoord;
    varying vec2 v_TexCoord;   // Pass to fragment shader

    varying vec2 v_UV;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;      // Setting global rotation
    uniform mat4 u_ViewMatrix;              // Set by LookAt
    uniform mat4 u_ProjectionMatrix;        // Set by GL perspective command...eventually
    void main(){
        // gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        gl_Position = u_ProjectionMatrix * u_ViewMatrix* u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
        v_TexCoord = a_TexCoord;

    }`;

// Fragment shader program
var FSHADER_SOURCE =`
    precision mediump float;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    varying vec2 v_TexCoord;
    varying vec2 v_UV;



    uniform int u_whichTexture;

    
    void main(){
    if(u_whichTexture == -3){                           // Ground texture  
        // gl_FragColor = texture2D(u_Sampler1, v_UV);
        gl_FragColor = texture2D(u_Sampler1, v_TexCoord);

    }
    else if(u_whichTexture == -2){                   // Solid color
        gl_FragColor = u_FragColor;
    }
    else if(u_whichTexture == -1){              // UV texture
        // gl_FragColor = vec4(v_UV, 1.0, 1.0);
        gl_FragColor = vec4(v_TexCoord, 1.0, 1.0);

    }
    else if (u_whichTexture == 0){              // Dirt Texture
        // gl_FragColor = texture2D(u_Sampler0, v_UV);
        gl_FragColor = texture2D(u_Sampler0, v_TexCoord);

        
    }
    else{                                           // Error shows red
        gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);
    }

    // gl_FragColor = u_FragColor;
    // // gl_FragColor = vec4(v_UV, 1.0, 1.0);

    // gl_FragColor = texture2D(u_Sampler0, v_UV);

    }`;

// Constants
const SPEED = 0.1;
const ALPHA = 1;

// Defining global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix; 
let u_Sampler0;
let u_Sampler1;

let u_whichTexture
let texture;

var map = [
    [1, 0, 0, 1],
    [1, 1, 0, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 1]
];

var walls = [];


// var g_eye = [0, 0, 3];
// var g_at = [0, 0, -100];
// var g_up = [0, 1, 0];




// var g_eye = new Vector3({0: 0, 1: 0, 2: 3});
// var g_at = new Vector3({0: 0, 1: 0, 2: -100});
// var g_up = new Vector3({0: 0, 1: 1, 2: 0});
var g_Camera = new Camera();


//      Can add more for perspective ^^
// consider changing to vec3 so you can do
// moving forward
// d is direction vector
    // d = at - eye
    // d = d.normalize()
    // eye = eye + d
    // at = at + d
// moving left
        // need vector orthogonal to d
    // d = at - eye
    // left = d.cross(up)           // cross product of d x up

// atPoint = directionVector = at - eye
// r = sqrt ((direction x ^2) + (direction y ^2))
// theta = arc tan (direction y, direction x)
// theta = theta + 5 degrees (<-- aka angle, will be in radians likely)
// new x = r * cos(theta)
// new y = r * sin(theta)
// d = (new x, new y)
// at = eye + d


// Global variables for HTML action
let g_clearColorR = 0.0;
let g_clearColorG = 0.0;
let g_clearColorB = 0.0;

let g_globalAngleX = 0;
let g_globalAngleY = 15;
let g_globalAngleZ = 0;

let g_yellowAngle = 0;
let g_MagentaAngle = 0;

// Mouse control variables
let isMouseControlled = false;

// Set the initial mouse position
let lastX = 0;
let lastY = 0;



function main() {
    setUpWebGL();
    connectVariablesToGLSL();
    addActionForHTMLUI();
    document.onkeydown = keydown;
    initTextures(gl, 0);

    // canvas.addEventListener('mousedown', (event) => g_Camera.handleMouseDown(event));
    // canvas.addEventListener('mousemove', (event) => g_Camera.handleMouseMove(event));
    // canvas.addEventListener('mouseup', (event) => g_Camera.handleMouseUp(event));

    // Asked ChatGPT for help calling the mouse functions in order to make it more "video game like",
    //              reworked it because it spit out bad code
    // Add event listeners
    canvas.addEventListener('mousedown', (event) => {
        // Set mouse control state to true when mouse is pressed down
        isMouseControlled = true;
        
        // Record the mouse position when mouse is pressed
        lastX = event.clientX;
        lastY = event.clientY;
    });
    
    canvas.addEventListener('mousemove', (event) => {
        if (isMouseControlled) {
            const newX = event.clientX - lastX;
            const newY = event.clientY - lastY;
    
            const panSpeed = 0.3; 
    
            if (newX !== 0) {
                g_Camera.panRight(newX * panSpeed);
            }
    
            if (newY !== 0) {
                if (newY > 0) {
                    g_Camera.panUp(newY * panSpeed); 
                } else {
                    g_Camera.panDown(-newY * panSpeed);  
                }
            }
            lastX = event.clientX;
            lastY = event.clientY;
        }
    });
    
    // Stop mouse controls when ESC/leaving mouse
    canvas.addEventListener('mouseup', () => {
        isMouseControlled = false;
    });
    
    // canvas.addEventListener('mouseleave', () => {
    //     isMouseControlled = false;
    // });
    


    // clearCanvas();
    renderScene()
    requestAnimationFrame(tick);
}
var g_startTime = performance.now() / 1000.0 ;
var g_seconds = performance.now() / 1000.0 - g_startTime;

var g_yellowAnimation = false;
var g_magentaAnimation = false;

function tick(){
    g_seconds = (performance.now() / 1000.0 - g_startTime) * 1.5;
    updateAnimationAngles();
    renderScene();   
    requestAnimationFrame(tick);

}

function clearCanvas(){
    gl.clearColor(g_clearColorR, g_clearColorG, g_clearColorB, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function setUpWebGL(){
    canvas = document.getElementById('webgl');

    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    ``
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);

}

function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    if (a_TexCoord < 0) {
        console.log('Failed to get the storage location of a_TexCoord');
        return;
    }

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if(!u_ViewMatrix) {
      console.log('Failed to get the storage location of u_ViewMatrix');
      return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    // Get the storage location of the u_Sampler
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0'); 
    if(!u_Sampler0){
        console.log('Failed to get the storage location of u_Sampler0');
        return false;
    }
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1'); 
    if(!u_Sampler1){
        console.log('Failed to get the storage location of u_Sampler1');
        return false;
    }

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture'); 
    if(!u_whichTexture){
        console.log('Failed to get the storage location of u_whichTexture');
        return false;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, identityM.elements);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, identityM.elements);


}

// // Adjusted from Ch 5
function initTextures() { 
    var image0 = new Image();
    var image1 = new Image();

    if (!image0 || !image1) {
        console.log('Failed to create the image objects');
        return false;
    }

    image0.onload = function() { sendImageToTexture(image0, 0); };
    image1.onload = function() { sendImageToTexture(image1, 1); };

    image0.src = '../resources/dirt.jpg';
    image1.src = '../resources/grassTop.jpg';

    return true;
}

function sendImageToTexture(image, texUnit) {
    var texture = gl.createTexture();
    if (!texture) { 
        console.log('Failed to create the texture object');
        return false;
    } 

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y-axis

    // Activate the correct texture unit
    if (texUnit == 0) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(u_Sampler0, 0); // Bind texture0 to sampler0
    } else {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(u_Sampler1, 1); // Bind texture1 to sampler1
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);


    }

    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    console.log(`Texture loaded for unit ${texUnit}`);
}

function addActionForHTMLUI(){
    document.getElementById('whiteCanvas').onclick = function () { 
        g_clearColorR = 1.0;
        g_clearColorG = 1.0
        g_clearColorB = 1.0;
        gl.clearColor(g_clearColorR, g_clearColorG, g_clearColorB, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        renderScene(); 

    };
    document.getElementById('creamCanvas').onclick = function () { 
        g_clearColorR = 1;
        g_clearColorG = 0.97;
        g_clearColorB = 0.89;
        gl.clearColor(g_clearColorR, g_clearColorG, g_clearColorB, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        renderScene(); 

    };
    document.getElementById('blackCanvas').onclick = function () { 
        g_clearColorR = 0.0;
        g_clearColorG = 0.0
        g_clearColorB = 0.0;
        gl.clearColor(g_clearColorR, g_clearColorG, g_clearColorB, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        renderScene(); 
    };

    document.getElementById('yellowButtonON').onclick = function () {g_yellowAnimation = true};
    document.getElementById('yellowButtonOFF').onclick = function () {g_yellowAnimation = false};

    document.getElementById('animateFeetButtonON').onclick = function () {g_magentaAnimation = true};
    document.getElementById('animateFeetButtonOFF').onclick = function () {g_magentaAnimation = false};

    // document.getElementById('animateDogWalkingButtonON').onclick = function () {g_walkingAnimation = true};
    // document.getElementById('animateDogWalkingButtonOFF').onclick = function () {g_walkingAnimation = false};


    document.getElementById('magentaSlider').addEventListener('mousemove', function() { 
        g_MagentaAngle = -this.value; 
        renderScene(); 
    });

    document.getElementById('yellowSlider').addEventListener('mousemove', function() { 
        g_yellowAngle = -this.value; 
        renderScene(); 
    });

    document.getElementById('angleXSlider').addEventListener('mousemove', function() { 
        g_globalAngleX = this.value; 
        renderScene(); 
    });

    document.getElementById('angleYSlider').addEventListener('mousemove', function() { 
        g_globalAngleY = this.value; 
        renderScene(); 
    });

    document.getElementById('angleZSlider').addEventListener('mousemove', function() { 
        g_globalAngleZ = this.value; 
        renderScene(); 
    });
}

function updateAnimationAngles(){
    if(g_yellowAnimation){
        g_yellowAngle = 45 * Math.sin(g_seconds);

    }
    if(g_magentaAnimation){
        g_MagentaAngle = 45 * Math.sin(2.5 * g_seconds);
    }

}

function keydown(ev){


                // currently works, jumps by a lot


    // Right arrow key event
    if(ev.keyCode == 39 || ev.keyCode == 68){
        // g_Camera.eye.elements[0] += 0.2;
        g_Camera.moveRight(SPEED);
    }
    // Left arrow key event
    if(ev.keyCode == 37 || ev.keyCode == 65){
        // g_Camera.eye.elements[0] -= 0.2;
        g_Camera.moveLeft(SPEED);
    }
    // Up arrow key event
    if(ev.keyCode == 38 || ev.keyCode == 87){
        g_Camera.moveForward(SPEED);
    }
    // Down arrow key event
    if(ev.keyCode == 40 || ev.keyCode == 83){
        g_Camera.moveBackward(SPEED);
    }
    // Q (Left Pan) key event
    if(ev.keyCode == 81){
        g_Camera.panLeft(ALPHA);
    }

    // E (Right Pan) key event
    if(ev.keyCode == 69){
        g_Camera.panRight(ALPHA);
    }

    renderScene();
    // console.log("Key down: " + ev.keyCode);
}

function renderScene(){
    var startTime = performance.now();

    // Pass projection matrix
    var projMat = new Matrix4();
    //                      fovy,   aspect,                 near, far
    projMat.setPerspective(50, canvas.width / canvas.height, 1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    var viewMat = new Matrix4();
    //                  eyes,       at,          up
    viewMat.setLookAt(g_Camera.eye.elements[0], g_Camera.eye.elements[1], g_Camera.eye.elements[2],     
                      g_Camera.at.elements[0], g_Camera.at.elements[1],g_Camera.at.elements[2],     
                      g_Camera.up.elements[0], g_Camera.up.elements[1],g_Camera.up.elements[2],);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);


    // Rotate different axis
    var globalRotMat = new Matrix4().rotate(g_globalAngleX, 1, 0, 0) .rotate(g_globalAngleY, 0, 1, 0) .rotate(g_globalAngleZ, 0, 0, 1);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    // gl.clear(gl.COLOR_BUFFER_BIT);
    
    var ground = new Cube();
    ground.textureNum = -3;
    ground.color = [1.0, 0.2, 0.5, 1.0];
    ground.matrix.translate(0, -0.75, 0);
    ground.matrix.scale(50, 0, 50);
    ground.matrix.translate(-0.5, 0, -0.5);
    ground.render();


    var red = new Cube();
    red.textureNum = 0
    red.color = [1.0, 0.0, 0.0, 1.0];
    red.matrix.translate(-0.25, -0.75, 0.0);
    red.matrix.rotate(-5, 1, 0, 0);
    red.matrix.scale(0.5, 0.3, 0.5);
    red.render();

    var yellow = new Cube();
    yellow.textureNum = -1;
    yellow.color = [0.0, 1.0, 0.0, 1.0];
    yellow.matrix.translate(-0.0, -0.5, 0.0);
    yellow.matrix.rotate(g_yellowAngle, 0.0, 0.0, 1);
    var yellowCoordMatrix = new Matrix4(yellow.matrix);
    yellow.matrix.scale(0.25, 0.7, 0.5);
    yellow.matrix.translate(-0.5, 0.0, 0.0);
    yellow.render();

    var magenta = new Cube();
    magenta.color = [1.0, 0.0, 1.0, 1.0];
    magenta.textureNum = 0;
    magenta.matrix = yellowCoordMatrix;
    magenta.matrix.translate(0, 0.65, 0);
    magenta.matrix.rotate(g_MagentaAngle, 0, 0, 1);
    magenta.matrix.scale(0.3, 0.3, 0.3);
    magenta.matrix.translate(-0.5, 0.0, -0.001);
    magenta.render();



    var sky = new Cube();
    sky.textureNum = -2;
    sky.color = [0.3, 0.45, 0.9, 1.0];
    sky.matrix.translate(0, -1, 0);
    sky.matrix.scale(50, 50, 50);
    sky.matrix.translate(-0.5, 0, -0.5);
    sky.render();


    var box = new Cube();
    box.textureNum = 0;
    box.color = [1.0, 0.2, 0.5, 1.0];
    // box.matrix.translate(0, -1, 0);
    box.matrix.scale(0.5, 0.5, 0.5);
    box.matrix.translate(0, -1.5, 0);

    // box.matrix.translate(-0.5, 0, -0.5);
    box.render();


    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration) / 10, "numdot");
    
}

// Send text to HTML, used for duration of renderScene in this files 
function sendTextToHTML(text, htmlID){
    var htmlElm = document.getElementById(htmlID);
    if(!htmlElm){
        console.error("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}
