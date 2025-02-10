// Camera.js
// Defines the Camera class
// Defines color and matrix
class Camera{
    constructor(){
        this.eye = new Vector3([0, 0, 3]);
        this.at = new Vector3([0, 0, -100]);
        this.up = new Vector3([0, 1, 0]);
        this.speed = 0.1;

        // this.eye = new Vector3({0: 0, 1: 0, 2: 3});
        // this.at = new Vector3({0: 0, 1: 0, 2: -100});
        // this.up = new Vector3({0: 0, 1: 1, 2: 0});
    }
    moveForward(speed){
        // copy at to d
        var d = new Vector3();
        d.set(this.at);
        d.sub(this.eye);
        d.normalize();
        d.mul(speed);
        // d = d.div(d.length());
        this.eye = this.eye.add(d);
        this.at = this.at.add(d);
    }

    moveBackward(speed){
        var d = new Vector3();
        d.set(this.at);
        d.sub(this.eye);        
        d.normalize();
        d.mul(speed);
        // d = d.div(d.length());
        this.eye = this.eye.sub(d);
        this.at = this.at.sub(d);
    }

    moveLeft(speed){
        // var d = this.at.sub(this.eye);      // check order
        // var left = d.cross(this.up);
        // // s = s.div(s.length());
        // // this.at = this.at.sub(s);
        // // this.eye = this.eye.sub(s);


        var d = new Vector3();
        d.set(this.at);
        d.sub(this.eye);      // check order
        // var right = -d.cross(this.up);       // copy above but check negative placement
        let left = Vector3.cross(d, this.up);
        left.mul(-1);
        left.normalize();
        left.mul(speed);

        this.eye = this.eye.add(left);
        this.at = this.at.add(left);
    }
    moveRight(speed){
        var d = new Vector3();
        d.set(this.at);
        d.sub(this.eye);      // check order
        // var right = -d.cross(this.up);       // copy above but check negative placement
        let right = Vector3.cross(d, this.up);
        right.normalize();
        right.mul(speed);


        this.eye = this.eye.add(right);
        this.at = this.at.add(right);
    }

    // atPoint = directionVector = at - eye
    // r = sqrt ((direction x ^2) + (direction y ^2))
    // theta = arc tan (direction y, direction x)
    // theta = theta + 5 degrees (<-- aka angle, will be in radians likely)
    // new x = r * cos(theta)
    // new y = r * sin(theta)
    // d = (new x, new y)
    // at = eye + d

    panLeft(alpha){
        // Compute the forward vector  f = at - eye;
        // Rotate the vector f by alpha (decide a value) degrees around the up vector.
        // Create a rotation matrix: rotationMatrix.setRotate(alpha, up.x, up.y, up.z).
        // Multiply this matrix by f to compute f_prime = rotationMatrix.multiplyVector3(f);
        // Update the "at"vector to be at = eye + f_prime;

            // Doesn't work but somewhat "working" code to start with
            // will test after adding ground, having trouble understanding camera vs object movement
                    // maybe console log matrices

                    
        var atPoint = new Vector3();
        atPoint.set(this.at);
        atPoint.sub(this.eye);

        var rotMat = new Matrix4();
        rotMat.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        var f_prime = rotMat.multiplyVector3(atPoint);
        this.at.set(this.eye);
        this.at.add(f_prime);

    }
    panRight(alpha){
                // Compute the forward vector  f = at - eye;
        // Rotate the vector f by alpha (decide a value) degrees around the up vector.
        // Create a rotation matrix: rotationMatrix.setRotate(alpha, up.x, up.y, up.z).
        // Multiply this matrix by f to compute f_prime = rotationMatrix.multiplyVector3(f);
        // Update the "at"vector to be at = eye + f_prime;

            // Doesn't work but somewhat "working" code to start with
            // will test after adding ground, having trouble understanding camera vs object movement
                    // maybe console log matrices

        var atPoint = new Vector3();
        atPoint.set(this.at);
        atPoint.sub(this.eye);

        var rotMat = new Matrix4();
        rotMat.setRotate(-alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        var f_prime = rotMat.multiplyVector3(atPoint);
        this.at.set(this.eye);
        this.at.add(f_prime);

    }
}


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
