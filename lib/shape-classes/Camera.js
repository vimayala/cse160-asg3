// Camera.js
// Defines the Camera class
// Defines color and matrix
class Camera{
    constructor(){
        this.eye = new Vector3([0, 0, 0]);
        this.at = new Vector3([0, 0, -1]);
        this.up = new Vector3([0, 1, 0]);
        this.speed = 0.1;
        this.fov = 60;
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

    panLeft(alpha){
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
        var atPoint = new Vector3();
        atPoint.set(this.at);
        atPoint.sub(this.eye);

        var rotMat = new Matrix4();
        rotMat.setRotate(-alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        var f_prime = rotMat.multiplyVector3(atPoint);
        this.at.set(this.eye);
        this.at.add(f_prime);
    }

    panUp(alpha) {
        var atPoint = new Vector3();
        atPoint.set(this.at);
        atPoint.sub(this.eye);

        var right = Vector3.cross(this.up, atPoint);
        var rotMat = new Matrix4();
        rotMat.setRotate(alpha, right.elements[0], right.elements[1], right.elements[2]);

        var f_prime = rotMat.multiplyVector3(atPoint);
        this.at.set(this.eye);
        this.at.add(f_prime);
    }

    panDown(alpha) {
        // Compute the forward vector  f = at - eye;
        var atPoint = new Vector3();
        atPoint.set(this.at);
        atPoint.sub(this.eye);
    
        var right = Vector3.cross(this.up, atPoint);
        var rotMat = new Matrix4();
        rotMat.setRotate(-alpha, right.elements[0], right.elements[1], right.elements[2]);
    
        var f_prime = rotMat.multiplyVector3(atPoint);
        this.at.set(this.eye);
        this.at.add(f_prime);
    }

    handleMouseMove(event) {
        if (this.isMouseControlled) {
            let newX = event.clientX - this.lastX;
            let newY = event.clientY - this.lastY;
    
            let panSpeed = 0.1;
    
            if (newX !== 0) {
                this.camera.panRight(newX * panSpeed);
            }
    
            if (newY !== 0) {
                this.camera.panLeft(newY * panSpeed);
            }
    
            this.newX = event.clientX;
            this.newY = event.clientY;
        }
    }

    addBlock(distance) {
        var direction = new Vector3();
        direction.set(this.at);  // At (target point)
        direction.sub(this.eye); // Eye (camera position)
        direction.normalize();   // Normalize the direction to get a unit vector

        // Calculate the block position by adding the direction vector scaled by the distance
        var copyEye = new Vector3();
        copyEye.set(this.eye);
        var blockPosition = copyEye.add(direction.mul(distance)); // Distance from the camera

        // Log block position to check it
        console.log("Block Position: ", blockPosition);

        // Return the calculated block position
        return blockPosition;
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

