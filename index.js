const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
// const dtSlider = document.getElementById("slider");
const objects = [];

const g_const = 20;
const friction = 0.7;
const density = 5E-4;

// Load the background image
const backgroundImage = new Image();
backgroundImage.src = './pics/background.jpg';

const ballsImgs = {20: "./pics/img1.png", 40: "./pics/img2.png", 60: "./pics/img3.png", 80: "./pics/img4.png", 100: "./pics/img5.png", 120: "./pics/img6.png", 140: "./pics/img7.png", 160: "./pics/img8.png", 180: "./pics/img9.png", 200: "./pics/img10.png", 220: "./pics/img11.png"}
const ballsNumber = 10;

// bottom: canvas.height - 10
const container = {top: 0, bottom: 0.75* canvas.height, left: 0.15*canvas.width, right: 0.85*canvas.width}
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
    constructor(x = 500, y = 400, r = 10, m = 0, isNew = false, imgSrc = null, velocity = { x: 0, y: 0 }, Ft = { x: 0, y: 0 }) {
        this.r = r;
        this.m = m;
        this.Ft = Ft;
        // this.color = ballsColors[r];
        this.position = { x: x, y: y };
        this.velocity = velocity;
        this.terminalVelocity = Math.round(Math.sqrt((2 * this.m * g_const) / (this.r * density)));
        this.isNew = isNew;
        this.image = new Image();
        this.image.src = ballsImgs[r];;
        if (imgSrc) {
            this.image.src = imgSrc;
        }

        let score = document.getElementById('score');
        score.innerText = parseInt(score.textContent) + r / 10;
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
        // obj.Ft.x = 0
        // obj.Ft.y = 0
        if (!isFingerDown && fingerPressed){
            fingerPressed = false;
            obj.isNew = false;
            newBallLaunched = true;
            obj.position.y += 2*obj.r;
            obj.Ft.x = obj.r;
        }
        else if (!isMouseDown || isFingerDown) {
            obj.position.x = mousePosition.x;
        }else{
            obj.isNew = false;
            newBallLaunched = true;
            obj.position.y += 2*obj.r;
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
    if (obj.position.y - obj.r < container.top){
        console.log("Lose")
        window.pause = true;
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

    if (obj1.r == obj2.r){
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
        let newCircle = new Circle(xpos, ypos, obj1.r + 20, obj1.r + 20, false, null, ballV);
        objects.push(newCircle);
        // }while(!isCircleValid(newCircle, objects))
        // objects.push(newCircle);
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
        return new Circle(x, y, r, r);
    }
    r = window.params.radius == -1 ? randomInt(20, 90) : window.params.radius;
    x = randomInt(container.left + r + 1, container.right - r - 1);
    // console.log(x);
    y = window.params.height == -1 ? randomInt(r + 1, canvas.height - r - 1) : window.params.height;
    
    return new Circle(x, y, r, r);
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
    // console.log(newBallLaunched, isMouseDown)
    if (newBallLaunched && !isMouseDown){
        newBallLaunched = false;
        // console.log(container.left, container.right, (container.left + container.right)/2)
        objects.push(new Circle((container.left + container.right)/2, 100, 20, 20, true));
    }

    // console.log(objects)
    const normalizedValue = (window.slider.value - window.slider.min) / ( window.slider.max -  window.slider.min);
    const logValue = 0.04 * Math.pow(10, normalizedValue);
    // const dt = 10**-((10-(window.slider.value))/3); 
    const dt = logValue;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    for (let obj of objects) {
        if (!window.pause) {
            gravity(obj);
            obj.move(dt)
        }
        // console.log(obj)
        obj.draw();
    }
    window.requestAnimationFrame(animate);
}

window.requestAnimationFrame(animate);