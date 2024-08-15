const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
// const dtSlider = document.getElementById("slider");
const objects = [];

let palyerWon = false;
let palyerLose = false;
let totalScore = 0; 
let fontSize = 20;
let opacity = 0;
const maxFontSize = 100;

const g_const = 20;
const friction = 0.7;
const density = 5E-4;

// Load the background image
const backgroundImage = new Image();
backgroundImage.src = './pics/background.png';
let cropWidth = 0;
let cropHeight = 0;
let startX = 0;
let startY = 0;
backgroundImage.onload = function() {
    const imgAspectRatio = backgroundImage.width / backgroundImage.height;
    const canvasAspectRatio = canvas.width / canvas.height;

    if (canvasAspectRatio < imgAspectRatio) {
        // If the canvas is wider (relative to height) than the image, crop the height
        cropHeight = backgroundImage.height;
        cropWidth = cropHeight * canvasAspectRatio;
        startX = (backgroundImage.width - cropWidth) / 2;
        startY = 0;
    } else {
        // Otherwise, crop the width
        cropWidth = backgroundImage.width;
        cropHeight = cropWidth / canvasAspectRatio;
        startX = 0;
        startY = (backgroundImage.height - cropHeight) / 2;
    }

    console.log(imgAspectRatio, cropWidth, cropHeight, startX, startY)
};

// Load the background image
const fenceImg = new Image();
fenceImg.src = './pics/fence.png';

// bottom: canvas.height - 10
const container = {top: 50, bottom: 0.75* canvas.height, left: 0.15*canvas.width, right: 0.85*canvas.width}

let maxBallSize = Math.min(container.right - container.left, container.bottom - container.top)
const ballsImgs = {1: "./pics/img1.png", 2: "./pics/img2.png", 3: "./pics/img3.png", 4: "./pics/img4.png", 5: "./pics/img5.png", 6: "./pics/img6.png", 7: "./pics/img7.png", 8: "./pics/img8.png", 9: "./pics/img9.png", 10: "./pics/img10.png", 11: "./pics/img11.png"}
const ballsNumber = 10;

let nextBall = 1;

let newBallLaunched = true; 
let mousePosition = { x: 0, y: 0 };
let isMouseDown = false;
let isFingerDown = false;
let fingerPressed = false;

// Add event listeners
window.addEventListener('mousedown', (event) => {
  if (event.button === 0) { // Left mouse button
    isMouseDown = true;
    // updateMousePosition(event);
    
  }
});

window.addEventListener('touchstart', function(e) {
    isFingerDown = true;
    fingerPressed = true;
});

// // Detect when the touch moves
window.addEventListener('touchmove', function(e) {
    updateMousePosition(e.touches[0]);
});

// Detect when the touch ends
window.addEventListener('touchend', function(e) {
    isFingerDown = false;
});

// window.addEventListener("click", function(){ console.log("Hello World!"); });

window.addEventListener('mouseup', () => {
  isMouseDown = false;
});

window.addEventListener('mousemove', (event) => {
  updateMousePosition(event);
});

function updateMousePosition(event) {
  mousePosition.x = event.clientX;
  mousePosition.y = event.clientY;
}

class Circle {
    constructor(id, x = 500, y = 400, r = 10, m = 0, isNew = false, imgSrc = null, velocity = { x: 0, y: 0 }, Ft = { x: 0, y: 0 }) {
        this.id = id;
        if (this.id == 11){
            palyerWon = true;
        }
        this.r = 0.4 * this.id/11 * maxBallSize
        this.m = this.r;
        this.Ft = Ft;
        // this.color = ballsColors[r];
        this.position = { x: x, y: y };
        this.velocity = velocity;
        this.terminalVelocity = Math.round(Math.sqrt((2 * this.m * g_const) / (this.r * density)));
        this.isNew = isNew;
        this.image = new Image();
        this.image.src = ballsImgs[this.id];;
        if (imgSrc) {
            this.image.src = imgSrc;
        }

        totalScore += this.id;
    }

    move(dt) {
        const accelX = this.Ft.x / this.m;
        const accelY = this.Ft.y / this.m;
      
        this.velocity.x = Math.min(this.terminalVelocity, this.velocity.x + accelX * dt);
        this.velocity.y = Math.min(this.terminalVelocity, this.velocity.y + accelY * dt);
      
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        bounce(this);
    }

    draw() {
        // ctx.save();  // Save the current context state

        // ctx.beginPath();
        // ctx.arc(this.position.x, this.position.y, this.r, 0, Math.PI * 2, true);
        // ctx.closePath();
        // ctx.clip();  // Clip the context to the circle path

        if (this.image && this.image.complete) {
            // console.log(this.position)
            ctx.drawImage(this.image, this.position.x - this.r -1, this.position.y - this.r - 1, (this.r + 1) * 2, (this.r + 1) * 2);
        } else {
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        // ctx.restore();  // Restore the context to its original state
    }
}


function gravity(obj) {
    // if (isMouseDown) {
    //     // Calculate the gravitational force towards the mouse position
    //     const dx = mousePosition.x - obj.position.x;
    //     const dy = mousePosition.y - obj.position.y;
    //     const distance = Math.sqrt(dx * dx + dy * dy);
    //     // const force = g_const * obj.m / (distance);
    //     const force = g_const * obj.m * 1.5
    //     obj.Ft.x = force * (dx / distance);
    //     obj.Ft.y = force * (dy / distance);
    // console.log(obj.isNew)
    if (obj.isNew){
        obj.Ft.x = 0
        obj.Ft.y = 0
        obj.velocity.x = 0
        obj.velocity.y = 0
        if (!isFingerDown && fingerPressed){
            fingerPressed = false;
            obj.isNew = false;
            newBallLaunched = true;
            obj.position.y += 2*(obj.r+1);
            obj.Ft.x = obj.r;
        }
        else if (!isMouseDown || isFingerDown) {
            obj.position.x = mousePosition.x;
        }else{
            obj.isNew = false;
            newBallLaunched = true;
            obj.position.y += 2*(obj.r+1);
            obj.Ft.x = obj.r;
        }
    } else {
        // Apply a constant downward force (regular gravity)
        obj.Ft.x = 0;
        obj.Ft.y = g_const * obj.m;
    }
}


function bounce(obj) {
    // Horizontal bounce
    if (obj.position.x - obj.r < container.left || container.right < obj.position.x + obj.r) {
        // Calculate the new horizontal velocity based on the coefficient of restitution
        obj.Ft.x += -(obj.Ft.x);
        obj.velocity.x = -(obj.velocity.x * (1 - friction));
        obj.position.x = obj.position.x - obj.r < container.left ? container.left + obj.r : container.right - obj.r;
    }
    if (obj.position.y + obj.r < container.top){
        // console.log("Lose")
        palyerLose = true;
    }
    // Vertical bounce
    // if (obj.position.y - obj.r < container.top || container.bottom < obj.position.y + obj.r) {
    if (container.bottom < obj.position.y + obj.r) {
        obj.Ft.y += -(obj.Ft.y);
        // Calculate the new vertical velocity based on the coefficient of restitution
        obj.velocity.y = -(obj.velocity.y * (1 - friction));
        // Update the vertical position to prevent the object from getting stuck
        obj.position.y = obj.position.y - obj.r < container.top ? container.top + obj.r : container.bottom - obj.r;
    } 

    // Check for collisions between balls
    for (let other of objects) {
        if (other !== obj && distance(obj, other) < obj.r + other.r) {
            // console.log("obj " , obj.position.x, obj.r, " other ", other.position.x, other.r," dis ", distance(obj, other))
            resolveCollision(obj, other);
        }
    }
}

function distance(obj1, obj2) {
    return Math.sqrt(
        Math.pow(obj1.position.x - obj2.position.x, 2) +
        Math.pow(obj1.position.y - obj2.position.y, 2)
    );
}

function resolveCollision(obj1, obj2) {

    if (obj1.r == obj2.r && !obj1.isNew && !obj2.isNew){
        if (obj1.isNew || obj2.isNew){
            console.log("TADAAA", obj1.isNew, obj2.isNew)
        }
        let index = objects.indexOf(obj1);
        if (index > -1) { // only splice array when item is found
            objects.splice(index, 1); // 2nd parameter means remove one item only
        }
        index = objects.indexOf(obj2);
        if (index > -1) { // only splice array when item is found
            objects.splice(index, 1); // 2nd parameter means remove one item only
        }
        let xpos = Math.floor((obj1.position.x + obj2.position.x) / 2);
        let ypos = Math.floor((obj1.position.y + obj2.position.y) / 2);
        let ballFt = {x: obj1.Ft.x + obj2.Ft.x, y: obj2.Ft.y + obj2.Ft.y};
        let ballV = {x: Math.floor((obj1.velocity.x + obj2.velocity.x)/2), y: Math.floor((obj1.velocity.y + obj2.velocity.y)/2)};
        // do{
        let newCircle = new Circle(obj1.id + 1, xpos, ypos, obj1.r + 20, obj1.r + 20, false, null, ballV);
        objects.push(newCircle);
        // }while(!isCircleValid(newCircle, objects))
        // objects.push(newCircle);
        // palyerWon = true;
    }
    const coefficientOfRestitution = 1- friction;
  
    // Calculate the relative velocity
    const relativeVelocity = {
      x: obj1.velocity.x - obj2.velocity.x,
      y: obj1.velocity.y - obj2.velocity.y
    };
  
    // Calculate the normal vector
    const normal = {
      x: (obj2.position.x - obj1.position.x) / distance(obj1, obj2),
      y: (obj2.position.y - obj1.position.y) / distance(obj1, obj2)
    };
  
    // Calculate the impulse
    const j = (-(1 + coefficientOfRestitution) * relativeVelocity.x * normal.x +
              -(1 + coefficientOfRestitution) * relativeVelocity.y * normal.y) /
            (1 / obj1.m + 1 / obj2.m);
  
    obj1.velocity.x += j / obj1.m * normal.x;
    obj1.velocity.y += j / obj1.m * normal.y;
    obj2.velocity.x -= j / obj2.m * normal.x;
    obj2.velocity.y -= j / obj2.m * normal.y;

        // Calculate the overlap distance
    const overlap = obj1.r + obj2.r - distance(obj1, obj2);

    // Separate the objects
    if (overlap > 0) {
        // Move the objects apart along the normal vector
        obj1.position.x -= overlap / 2 * normal.x;
        obj1.position.y -= overlap / 2 * normal.y;
        obj2.position.x += overlap / 2 * normal.x;
        obj2.position.y += overlap / 2 * normal.y;
    }
}

function randomInt(min, max) {
    // console.log(min, max)
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function createCircle(x = 0, y = 0, r=0) {
    if (x && y && r){
        return new Circle(2, x, y, r, r);
    }
    r = window.params.radius == -1 ? randomInt(20, 90) : window.params.radius;
    x = randomInt(container.left + r + 1, container.right - r - 1);
    // console.log(x);
    y = window.params.height == -1 ? randomInt(r + 1, canvas.height - r - 1) : window.params.height;
    
    return new Circle(2, x, y, r, r);
}

function init() {
    objects.push(createCircle());

    const maxAttempts = 10;
    let attemptCount = 0;

    while (objects.length < window.params.num && attemptCount < maxAttempts) {
        const newCircle = createCircle();
        if (isCircleValid(newCircle, objects)) {
            objects.push(newCircle);
            attemptCount = 0;
        } else {
            attemptCount++;
        }
    }
}

function isCircleValid(newCircle, existingCircles) {
    for (let other of existingCircles) {
        if (distance(newCircle, other) < newCircle.r + other.r) {
            return false;
        }
    }
    return true;
}

function animate() {

    if (window.restart){
        // console.log(window.params)
        objects.splice(0, objects.length)
        // init()
        window.restart = false;
    }

    if (window.add){
        objects.push(createCircle());
        window.add = false;
    }
    // console.log(objects.length)
    // for (let obj of objects) {
    //     console.log(obj)
    // }

    if (newBallLaunched && !isMouseDown){

        newBallLaunched = false;
        let attemptCount = 0;
        // console.log(container.left, container.right, (container.left + container.right)/2)
        // randomInt(1,2)
        let newBall = new Circle(nextBall, (container.left + container.right)/2, 100, 100, 100, true);
        // console.log(!isCircleValid(newBall, objects))
        while(!isCircleValid(newBall, objects)){
            attemptCount++;
            // console.log(attemptCount)
            newBall = new Circle(nextBall, (container.left + container.right)/2, 100-attemptCount, 100, 100, true);
        }
        nextBall = randomInt(1,Math.min(3, objects.length))
        objects.push(newBall);
    }

    // console.log(objects)
    const normalizedValue = (window.slider.value - window.slider.min) / ( window.slider.max -  window.slider.min);
    const logValue = 0.04 * Math.pow(10, normalizedValue);
    // const dt = 10**-((10-(window.slider.value))/3); 
    const dt = logValue;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the cropped image on the canvas
    ctx.drawImage(backgroundImage, startX, startY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);

    // Draw the cropped image on the canvas
    ctx.drawImage(fenceImg, startX, startY, cropWidth, cropHeight, 0, 120, canvas.width, canvas.height);

    if (palyerWon){
        ctx.globalAlpha = opacity; // Set opacity
        ctx.fillStyle = "#265136"; // Set text color
        ctx.font = `bold ${fontSize+4}px Helvetica`; // Set font and size
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("You won!", canvas.width / 2, canvas.height / 5); // Draw the text
        ctx.fillStyle = "#3dba6b"; // Set text color
        ctx.font = `bold ${fontSize}px Helvetica`; // Set font and size
        ctx.fillText("You won!", canvas.width / 2, canvas.height / 5); // Draw the text

        // Update font size and opacity
        if (fontSize < maxFontSize) {
            fontSize += 2;
        }
        if (opacity < 1) {
            opacity += 0.02;
        }
    }

    if (palyerLose){
        window.pause = true;
        ctx.globalAlpha = opacity; // Set opacity
        ctx.fillStyle = "#7a0909"; // Set text color
        ctx.font = `bold ${fontSize+4}px Helvetica`; // Set font and size
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("You Lost", canvas.width / 2, canvas.height / 5); // Draw the text
        ctx.fillStyle = "#e31212"; // Set text color
        ctx.font = `bold ${fontSize}px Helvetica`; // Set font and size
        ctx.fillText("You Lost", canvas.width / 2, canvas.height / 5); // Draw the text

        // Update font size and opacity
        if (fontSize < maxFontSize) {
            fontSize += 2;
        }
        if (opacity < 1) {
            opacity += 0.02;
        }
    }

    for (let obj of objects) {
        if (!window.pause) {
            gravity(obj);
            obj.move(dt)
        }
        // console.log(obj)
        obj.draw();
    }

    ctx.fillStyle = "#555555"; // Set text color
    ctx.font = `bold 20px Helvetica`; // Set font and size
    ctx.fillText(`Score: ${totalScore}`, 10, 25);

    let nextBallImage = new Image();
    nextBallImage.src = ballsImgs[nextBall];
    if (nextBallImage && nextBallImage.complete) {
        
        // ctx.textAlign = 'center';
        // ctx.textBaseline = 'middle';
        ctx.fillText("Next:", 10, 60);
        ctx.drawImage(nextBallImage, 70, 35, 20*2, 20*2);
    }
    window.requestAnimationFrame(animate);
}

window.requestAnimationFrame(animate);