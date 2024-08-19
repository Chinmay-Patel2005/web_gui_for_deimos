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
            case 's':
                stopMovement();
                removeHighlight('btn-w');
                removeHighlight('btn-s');
                break;
            case 'a':
            case 'd':
                stopMovement();
                removeHighlight('btn-a');
                removeHighlight('btn-d');
                break;
        }
    });
});

function move(direction) {
    let linearX = 0;
    let angularZ = 0;
    
    // Define speed parameters
    const linearSpeed = 0.2;  // Adjust these values as needed
    const angularSpeed = 0.5;

    switch (direction) {
        case 'W':  // Move forward
            linearX = linearSpeed;
            break;
        case 'S':  // Move backward
            linearX = -linearSpeed;
            break;
        case 'A':  // Turn left
            angularZ = angularSpeed;
            break;
        case 'D':  // Turn right
            angularZ = -angularSpeed;
            break;
    }

    // Publish the velocity command
    const message = new ROSLIB.Message({
        linear: { x: linearX, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: angularZ }
    });
    cmdVelTopic.publish(message);
    console.log(`Published movement command: linearX=${linearX}, angularZ=${angularZ}`);
}

function stopMovement() {
    const message = new ROSLIB.Message({
        linear: { x: 0, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: 0 }
    });
    cmdVelTopic.publish(message);
    console.log('Published stop command');
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

// ROS connection setup
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

// Publisher for velocity commands
const cmdVelTopic = new ROSLIB.Topic({
    ros: ros,
    name: '/cmd_vel',
    messageType: 'geometry_msgs/Twist'
});

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

// Subscriber for TurtleBot speed data from /odom topic
const odomTopic = new ROSLIB.Topic({
    ros: ros,
    name: '/odom',
    messageType: 'nav_msgs/Odometry'
});

odomTopic.subscribe((message) => {
    const speed = message.twist.twist.linear.x;  // Linear speed in x direction
    updateValue('value1', `Speed: ${speed.toFixed(2)} m/s`);
    console.log('TurtleBot speed received: ', speed);
});
