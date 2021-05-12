//console.log('hello');
let video;
let poseNet;
let pose;
let timestamps = [];
let editedTimestamps = [];
timestampsLoaded = false;
let startingValue;
let endingValue;
let soundPlaying = false;
let currentTimestamp = 0;
let counter = 0;
let limiter = 120;

const synth = new Tone.MembraneSynth().toDestination();


document.getElementById('button').addEventListener('click', () => {
    if (timestampsLoaded) {
        Tone.start();
        soundPlaying = true;
    }
});

function setup() {
    video = createCapture(VIDEO, () => {
        console.log('user video captured');
    });
    video.hide();
    poseNet = ml5.poseNet(video, () => {
        console.log('Model Ready');
    });
    poseNet.on('pose', (poses) => {
        if (poses.length > 0) {
            pose = poses[0].pose;
        }
    });
}

function draw() {
    if (pose) {
        let handDistance = dist(pose.rightWrist.x, pose.rightWrist.y, pose.leftWrist.x, pose.leftWrist.y);
        // console.log(handDistance);
        if (handDistance) {
            limiter = map(handDistance, 100, 500, 1, 120, true);
            limiter = floor(limiter);
            // console.log(limiter);
        } 
    }
    if (soundPlaying) {
        if (counter % ((editedTimestamps[currentTimestamp + 1] - editedTimestamps[currentTimestamp]) + limiter) === 0) {
            console.log(currentTimestamp);
            synth.triggerAttackRelease("C1", "8n");
            currentTimestamp++;
        }
        counter++;
        // console.log(counter);
    }
}

window.addEventListener('load', () => {
    fetch("http://earthquake.usgs.gov/fdsnws/event/1/query.geojson")
    .then(response => response.json())
    .then(data => {
        for (i = 0; i < 1000; i++) {
            let timestamp = data.features[i].properties.time;
            timestamps.push(timestamp);
        }
        console.log(timestamps);
        for (i = 999; i > -1; i--) {
            let timestampString = timestamps[i].toString();
            let timestamp = parseInt(timestampString.substring(0, 9));
            editedTimestamps.push(timestamp);
            // console.log(timestamp);
        }
        console.log(editedTimestamps);
        startingValue = editedTimestamps[0];
        endingValue = editedTimestamps[999];
        timestampsLoaded = true;
    });
});
