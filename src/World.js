// World.js
// Sourced from ColoredPoint.js (c) 2012 matsuda with CSE 160 Additional functionality
// Vertex shader program

// Ideas for add ons:
//  Last 5 used colors
var VSHADER_SOURCE =`
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main(){
        gl_Position = u_ProjectionMatrix * u_ViewMatrix* u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
    }`;

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  void main(){
    gl_FragColor = u_FragColor;
    // gl_FragColor = vec4(v_UV, 1.0, 1.0);
  }
  `;


// Constants


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


// Global variables for HTML action
let g_clearColorR = 0.0;
let g_clearColorG = 0.0;
let g_clearColorB = 0.0;
// let g_selectedColor = [1.0, 1.0, 1.0, 1.0]
// let g_selectedSize = 5;
// let g_selectedType = POINT;
// let g_selectedSegments = 12;

let g_globalAngleX = 0;
let g_globalAngleY = 15;
let g_globalAngleZ = 0;


let g_yellowAngle = 0;
let g_MagentaAngle = 0;
// let g_walkingAngle = 0;
// let g_LegAngle = 0;
// let g_BodyAngle = 0;



var g_shapesList = [];


function main() {
    setUpWebGL();
    connectVariablesToGLSL();
    addActionForHTMLUI();

    // canvas.addEventListener("mousedown", () => g_isDragging = true);
    // canvas.addEventListener("mouseup", () => g_isDragging = false);
    // canvas.addEventListener("mouseleave", () => g_isDragging = false);
    // canvas.addEventListener("mousemove", handleMouseMove);

    clearCanvas();
    renderScene()
    requestAnimationFrame(tick);
}
var g_startTime = performance.now() / 1000.0 ;
var g_seconds = performance.now() / 1000.0 - g_startTime;

var g_yellowAnimation = true;
var g_magentaAnimation = false;
var g_walkingAnimation = true;
var g_legAnimation = true;


let g_lastX = null;
let g_lastY = null;
let g_sensitivity = 0.5; // Adjust for smoother/faster rotation
let g_isDragging = false; 

// Asked ChatGPT for this - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
// function handleMouseMove(event) {
//     if (!g_isDragging) return; // Only rotate if mouse is held down

//     if (g_lastX === null || g_lastY === null) {
//         g_lastX = event.clientX;
//         g_lastY = event.clientY;
//         return;
//     }

//     let deltaX = event.clientX - g_lastX;
//     let deltaY = event.clientY - g_lastY;

//     g_globalAngleY += deltaX * g_sensitivity; // Rotate around Y-axis (left-right)
//     g_globalAngleZ += deltaY * g_sensitivity; // Rotate around Z-axis (up-down)

//     g_lastX = event.clientX;
//     g_lastY = event.clientY;

//     renderScene();
// }
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

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


// let canvas;
// let gl;
// let a_Position;
// let a_UV;
// let u_FragColor;
// let u_Size;
// let u_ModelMatrix;
// let u_ProjectionMatrix;
// let u_ViewMatrix;
// let u_GlobalRotateMatrix; 

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

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

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

    document.getElementById('animateDogWalkingButtonON').onclick = function () {g_walkingAnimation = true};
    document.getElementById('animateDogWalkingButtonOFF').onclick = function () {g_walkingAnimation = false};


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

    // if(g_walkingAnimation){
    //     g_walkingAngle = 7 * Math.sin((3 * g_seconds));
    //     g_BodyAngle = 45 * Math.sin(2.5 * g_seconds);
    // }

    // if(g_legAnimation){
    //     g_LegAngle = 7 * Math.sin((3 * g_seconds));
    // }
}

function renderScene(){
    var startTime = performance.now();

    // Rotate different axis
    let globalRotMat = new Matrix4()
    .rotate(g_globalAngleX, 1, 0, 0) 
    .rotate(g_globalAngleY, 0, 1, 0) 
    .rotate(g_globalAngleZ, 0, 0, 1);


    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    // gl.clear(gl.COLOR_BUFFER_BIT);
    

    var red = new Cube();
    red.color = [1.0, 0.0, 0.0, 1.0];
    red.matrix.translate(-0.25, -0.75, 0.0);
    red.matrix.rotate(-5, 1, 0, 0);
    red.matrix.scale(0.5, 0.3, 0.5);
    red.render();

    var yellow = new Cube();
    yellow.color = [1.0, 1.0, 0.0, 1.0];
    yellow.matrix.translate(-0.0, -0.5, 0.0);
    yellow.matrix.rotate(g_yellowAngle, 0.0, 0.0, 1);
    var yellowCoordMatrix = new Matrix4(yellow.matrix);
    yellow.matrix.scale(0.25, 0.7, 0.5);
    yellow.matrix.translate(-0.5, 0.0, 0.0);
    yellow.render();

    var magenta = new Cube();
    magenta.color = [1.0, 0.0, 1.0, 1.0];
    magenta.matrix = yellowCoordMatrix;
    magenta.matrix.translate(0, 0.65, 0);
    magenta.matrix.rotate(g_MagentaAngle, 0, 0, 1);
    magenta.matrix.scale(0.3, 0.3, 0.3);
    magenta.matrix.translate(-0.5, 0.0, -0.001);
    magenta.render();



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