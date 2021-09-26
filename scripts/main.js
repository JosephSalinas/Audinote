// new speech recognition object
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var recognition = new SpeechRecognition();

// This runs when the speech recognition service starts
recognition.onstart = function () {
  console.log("We are listening. Speak!");
};

// This runs when the speech recognition service returns result
recognition.onresult = function (event) {
  var transcript = event.results[0][0].transcript;
  var confidence = event.results[0][0].confidence;
  handleResults(transcript, confidence);
};

// start recognition
// recognition.start();

startBtn = document.getElementById("startBtn");
stopBtn = document.getElementById("stopBtn");
speechDump = document.getElementById("speechDump");

startBtn.addEventListener("click", () => {
  recognition.start();
});

stopBtn.addEventListener("click", () => {
  recognition.stop();
});

function handleResults(transcript, confidence) {
  speechDump.innerHTML =
    "You said: " + transcript + " \nConfidence: " + confidence;
}

let mainBtn = document.getElementById("record");
let recording = false;
