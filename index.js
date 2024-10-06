const canvas = document.getElementById('solarCanvas');
const ctx = canvas.getContext('2d');
let time = 0;
let speed = 1; // Initial speed factor

const originalPlanets = [
    { name: 'Mercury', a: 50, e: 0.20563, color: 'gray', period: 88, info: "Closest to the Sun." },
    { name: 'Venus', a: 70, e: 0.006772, color: 'yellow', period: 224.7, info: "Second planet from the Sun." },
    { name: 'Earth', a: 100, e: 0.016708, color: 'blue', period: 365.25, info: "Home to humans." },
    { name: 'Mars', a: 140, e: 0.0934, color: 'red', period: 687, info: "Known as the Red Planet." },
    { name: 'Jupiter', a: 200, e: 0.0489, color: 'orange', period: 4332.59, info: "Largest planet in the solar system." },
    { name: 'Saturn', a: 250, e: 0.0565, color: 'gold', period: 10759.22, info: "Famous for its rings." },
    { name: 'Uranus', a: 300, e: 0.046381, color: 'lightblue', period: 30688.5, info: "Known for its blue color." },
    { name: 'Neptune', a: 350, e: 0.009456, color: 'darkblue', period: 60182, info: "Farthest from the Sun." }
];

const planets = JSON.parse(JSON.stringify(originalPlanets)); // Create a copy of the original planets

// Variables for zoom and pan functionality
let scaleFactor = 1;
let offsetX = 0, offsetY = 0;
let isDragging = false, dragStartX, dragStartY;

// Handle zoom
canvas.addEventListener('wheel', function(event) {
    event.preventDefault();
    const zoomAmount = event.deltaY * -0.001;
    const zoom = Math.exp(zoomAmount);

    const mouseX = event.clientX - canvas.offsetLeft;
    const mouseY = event.clientY - canvas.offsetTop;

    offsetX -= (mouseX - offsetX) * (zoom - 1);
    offsetY -= (mouseY - offsetY) * (zoom - 1);

    scaleFactor *= zoom;
});

// Handle dragging (panning)
canvas.addEventListener('mousedown', function(event) {
    isDragging = true;
    dragStartX = event.clientX - offsetX;
    dragStartY = event.clientY - offsetY;
});

canvas.addEventListener('mousemove', function(event) {
    if (isDragging) {
        offsetX = event.clientX - dragStartX;
        offsetY = event.clientY - dragStartY;
    }
});

canvas.addEventListener('mouseup', function() {
    isDragging = false;
});

canvas.addEventListener('mouseleave', function() {
    isDragging = false;
});

// Draw Sun with transformations
function drawSun() {
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scaleFactor, scaleFactor);

    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 30, 0, 2 * Math.PI);
    ctx.fillStyle = 'yellow';
    ctx.fill();

    ctx.restore();
}

// Draw Planet's orbit with transformations
function drawOrbit(planet) {
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scaleFactor, scaleFactor);

    ctx.beginPath();
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
        const E = (i / steps) * 2 * Math.PI; // Mean anomaly
        const r = planet.a * (1 - planet.e * Math.cos(E)); // Distance from focus
        const x = canvas.width / 2 + r * Math.cos(E);
        const y = canvas.height / 2 + r * Math.sin(E);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.strokeStyle = 'white';
    ctx.stroke();

    ctx.restore();
}

// Draw Planet with transformations
function drawPlanet(planet) {
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scaleFactor, scaleFactor);

    const E = (time / planet.period) * 2 * Math.PI; // Mean anomaly
    const r = planet.a * (1 - planet.e * Math.cos(E)); // Distance from focus
    const x = canvas.width / 2 + r * Math.cos(E);
    const y = canvas.height / 2 + r * Math.sin(E);

    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = planet.color;
    ctx.fill();

    // Add labels for planets
    ctx.fillStyle = 'white';
    ctx.fillText(planet.name, x + 10, y);
    ctx.fillText(planet.info, x + 10, y + 10);

    ctx.restore();
}

// Function to convert time to years, months, and days
function formatTime() {
    const totalDays = Math.floor(time); // Total elapsed days
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = totalDays % 30;

    return `${days} days, ${months} months, ${years} years`;
}

// Main animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSun();
    planets.forEach(planet => {
        drawOrbit(planet);
        drawPlanet(planet);
    });

    time += speed; // Increment time based on speed
    document.getElementById('timeDisplay').innerText = `Time: ${formatTime()}`; // Update time display

    requestAnimationFrame(animate);
}

// Update planet parameters when the update button is clicked
document.getElementById('updateButton').onclick = function() {
    const selectedPlanetIndex = document.getElementById('planetSelect').value;
    const semiMajorAxis = parseFloat(document.getElementById('semiMajorAxis').value);
    const eccentricity = parseFloat(document.getElementById('eccentricity').value);
    const period = parseFloat(document.getElementById('period').value);
    const color = document.getElementById('colorPicker').value; // Get color value

    if (!isNaN(semiMajorAxis) && semiMajorAxis > 0) {
        planets[selectedPlanetIndex].a = semiMajorAxis;
    }
    if (!isNaN(eccentricity) && eccentricity >= 0 && eccentricity <= 1) {
        planets[selectedPlanetIndex].e = eccentricity;
    }
    if (!isNaN(period) && period > 0) {
        planets[selectedPlanetIndex].period = period;
    }
    planets[selectedPlanetIndex].color = color; // Update color

    // Update planet info display
    document.getElementById('planetInfo').innerText = planets[selectedPlanetIndex].info;
};

// Reset planets to original parameters
document.getElementById('resetButton').onclick = function() {
    for (let i = 0; i < planets.length; i++) {
        planets[i] = JSON.parse(JSON.stringify(originalPlanets[i])); // Restore original values
    }
    document.getElementById('planetInfo').innerText = ""; // Clear info display
};

// Update speed when the slider is moved
document.getElementById('speedControl').oninput = function() {
    speed = parseFloat(this.value); // Update speed as a float
    document.getElementById('speedValue').innerText = speed.toFixed(1); // Display the speed value
};

// Start the animation
animate();
