// Cube.js
// Defines the Cube class
// Defines color and matrix
// Uses Ch 5 methods
class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -1;
        
        // Initialize buffers once
        this.initBuffers();
    }

    initBuffers() {
        // Define cube vertices
        this.vertices = new Float32Array([
            // Front face
            0.0, 0.0, 0.0,    1.0, 1.0, 0.0,    1.0, 0.0, 0.0,
            0.0, 0.0, 0.0,    0.0, 1.0, 0.0,    1.0, 1.0, 0.0,
            // Back face
            0.0, 0.0, 1.0,    1.0, 1.0, 1.0,    1.0, 0.0, 1.0,
            0.0, 0.0, 1.0,    0.0, 1.0, 1.0,    1.0, 1.0, 1.0,
            // Top face
            0.0, 1.0, 0.0,    0.0, 1.0, 1.0,    1.0, 1.0, 1.0,
            0.0, 1.0, 0.0,    1.0, 1.0, 1.0,    1.0, 1.0, 0.0,
            // Bottom face
            0.0, 0.0, 0.0,    0.0, 0.0, 1.0,    1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,    0.0, 0.0, 1.0,    1.0, 0.0, 1.0,
            // Right face
            1.0, 0.0, 0.0,    1.0, 1.0, 1.0,    1.0, 0.0, 1.0,
            1.0, 0.0, 0.0,    1.0, 1.0, 0.0,    1.0, 1.0, 1.0,
            // Left face
            0.0, 0.0, 0.0,    0.0, 1.0, 0.0,    0.0, 1.0, 1.0,
            0.0, 1.0, 1.0,    0.0, 0.0, 0.0,    0.0, 0.0, 1.0
        ]);
        
        // UV coordinates
        this.uvs = new Float32Array([
            0, 0,    1, 1,   1, 0,             0, 0,    0, 1,   1, 1, 
            1, 0,    0, 1,   0, 0,             1, 0,    1, 1,   0, 1, 
            0, 0,    0, 1,   1, 1,             0, 0,    1, 1,   1, 0, 
            0, 1,    0, 0,   1, 1,             1, 1,    0, 0,   1, 0, 
            0, 0,    1, 1,   1, 0,             0, 0,    0, 1,   1, 1, 
            1, 0,    1, 1,   0, 1,             0, 1,    1, 0,   0, 0  
        ]);
        
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

        this.uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);
    }

    render() {
        var rgba = this.color;

        // Pass color of the point
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
                
        // Pass texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass color of the point
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_TexCoord);

        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
}
