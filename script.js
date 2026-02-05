const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const gestureText = document.getElementById("gesture");

canvas.width = 640;
canvas.height = 480;

// Count open fingers
function countFingers(landmarks) {
  let count = 0;

  // Thumb
  if (landmarks[4].x < landmarks[3].x) count++;

  // Other fingers
  const tips = [8, 12, 16, 20];
  const base = [6, 10, 14, 18];

  for (let i = 0; i < tips.length; i++) {
    if (landmarks[tips[i]].y < landmarks[base[i]].y) {
      count++;
    }
  }
  return count;
}

const hands = new Hands({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7,
});

hands.onResults((results) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: "#00FF00", lineWidth: 2 });
      drawLandmarks(ctx, landmarks, { color: "#FF0000", lineWidth: 1 });

      let fingers = countFingers(landmarks);
      gestureText.innerText = "✋ Fingers: " + fingers;
    }
  } else {
    gestureText.innerText = "Show your hand ✋";
  }
});

const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 640,
  height: 480,
});

camera.start();
