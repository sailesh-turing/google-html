const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if (!gl) {
    alert('WebGL not supported');
}

// Set up WebGL background color and enable depth testing
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.enable(gl.DEPTH_TEST);

function createPentagonVertices(radius) {
    const angleStep = (2 * Math.PI) / 5; // Pentagon has 5 sides
    const vertices = [];
    for (let i = 0; i < 5; i++) {
        const angle = i * angleStep;
        vertices.push(radius * Math.cos(angle), radius * Math.sin(angle), 0.0); // Z = 0 for 2D
    }
    return vertices;
}

function createPentagonCube(radius, depth) {
    const faces = [];
    const faceVertices = createPentagonVertices(radius);

    // Create 5 pentagonal faces to form the 3D structure
    for (let i = 0; i < 5; i++) {
        const rotatedVertices = faceVertices.map((v, idx) => {
            if (idx % 3 === 2) return v + depth; // Offset Z for different layers
            return v;
        });
        faces.push(rotatedVertices);
    }

    return faces.flat(); // Flatten vertices array
}

const vertexShaderSource = `
    attribute vec3 aPosition;
    uniform mat4 uMatrix;
    void main() {
        gl_Position = uMatrix * vec4(aPosition, 1.0);
    }
  `;

const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 uColor;
    void main() {
        gl_FragColor = uColor;
    }
  `;

function getTransformationMatrix(angle, translation) {
    const matrix = mat4.create();
    mat4.rotateY(matrix, matrix, angle);
    mat4.translate(matrix, matrix, translation);
    return matrix;
}

let rotation = 0;

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const uMatrix = gl.getUniformLocation(program, 'uMatrix');
    const uColor = gl.getUniformLocation(program, 'uColor');

    // Rotate and render each face
    faces.forEach((face, index) => {
        const matrix = getTransformationMatrix(rotation + index * 0.2, [0, 0, -index * 0.2]);
        gl.uniformMatrix4fv(uMatrix, false, matrix);
        gl.uniform4fv(uColor, [Math.random(), Math.random(), Math.random(), 1.0]); // Random color

        // Draw face
        gl.bindBuffer(gl.ARRAY_BUFFER, faceBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(face), gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 5);
    });

    rotation += 0.01;
    requestAnimationFrame(render);
}

render();