// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Map keypresses to button clicks
    document.addEventListener('keydown', (event) => {
        switch (event.key.toLowerCase()) {
            case 'w':
                move('W');
                highlightButton('btn-w');
                break;
            case 'a':
                move('A');
                highlightButton('btn-a');
                break;
            case 's':
                move('S');
                highlightButton('btn-s');
                break;
            case 'd':
                move('D');
                highlightButton('btn-d');
                break;
        }
    });

    // Remove button highlight on key release
    document.addEventListener('keyup', (event) => {
        switch (event.key.toLowerCase()) {
            case 'w':
                removeHighlight('btn-w');
                break;
            case 'a':
                removeHighlight('btn-a');
                break;
            case 's':
                removeHighlight('btn-s');
                break;
            case 'd':
                removeHighlight('btn-d');
                break;
        }
    });
});

function move(direction) {
    console.log(`Moving ${direction}`);
    // Add your logic to send commands to the rover
}

function highlightButton(buttonId) {
    document.getElementById(buttonId).classList.add('active');
}

function removeHighlight(buttonId) {
    document.getElementById(buttonId).classList.remove('active');
}

// Example function to update values dynamically
function updateValue(id, value) {
    document.getElementById(id).textContent = value;
}

// Example updates (these could be from a live data feed)
updateValue('value1', 'Speed: 10m/s');
updateValue('value2', 'Battery: 95%');
updateValue('value3', 'Temperature: 20°C');
updateValue('value4', 'Distance: 150m');

const ros = new ROSLIB.Ros({
    url: 'ws://localhost:9090'  // Replace with your ROS bridge address
});

ros.on('connection', () => {
    console.log('Connected to ROS');
});

ros.on('error', (error) => {
    console.error('Error connecting to ROS: ', error);
});

ros.on('close', () => {
    console.log('Connection to ROS closed');
});

// Publisher for directions
const directionTopic = new ROSLIB.Topic({
    ros: ros,
    name: '/mars_rover/direction',
    messageType: 'std_msgs/String'
});

function publishDirection(direction) {
    const message = new ROSLIB.Message({
        data: direction
    });
    directionTopic.publish(message);
    console.log(`Published direction: ${direction}`);
    highlightButton(`btn-${direction.toLowerCase()}`);
}

// Subscriber for telemetry data
const telemetryTopic = new ROSLIB.Topic({
    ros: ros,
    name: '/mars_rover/telemetry',
    messageType: 'std_msgs/String'  // Adjust messageType based on your ROS setup
});

telemetryTopic.subscribe((message) => {
    const data = JSON.parse(message.data);  // Assuming telemetry data is JSON
    updateValue('value1', `Speed: ${data.speed} m/s`);
    updateValue('value2', `Battery: ${data.battery}%`);
    updateValue('value3', `Temperature: ${data.temperature}°C`);
    updateValue('value4', `Distance: ${data.distance} m`);
    console.log('Telemetry data received: ', data);
});
