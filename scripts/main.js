// new speech recognition object
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var recognition = new SpeechRecognition();

// recognition.interimResults = true;
recognition.continuous = true;

// This runs when the speech recognition service starts
recognition.onstart = function () {
  console.log("We are listening. Speak!");
};

// This runs when the speech recognition service returns result
recognition.onresult = function (event) {
  const result = event.results[event.results.length - 1][0];
  const transcript = result.transcript;
  const confidence = result.confidence;
  handleResults(transcript, confidence);
};

// start recognition
// recognition.start();

function handleResults(transcript, confidence) {
  console.log("You said: " + transcript + " \nConfidence: " + confidence);
  updateTextarea(` ${transcript}`);
}

let mainBtn = document.getElementById("record");
let recording = false;
const textarea = document.getElementById("testTextarea");

mainBtn.addEventListener("click", () => {
  if (recording) {
    handleRecordingStop();
    manuallyStopRecording();
  } else {
    handleRecordingStart();
  }
});

function handleRecordingStart() {
  console.log("Reording started...");
  recording = true;
  mainBtn.className = "recording";
  recognition.start();
}

function handleRecordingStop() {
  console.log("Recording stopped");
  recording = false;
  mainBtn.className = "inactive";
}

function manuallyStopRecording() {
  recognition.stop();
}

function updateTextarea(text) {
  textarea.value += text;
}

let cardsLocal = [];

// A Note is a {title: String, body: String, createdAt: Number}
// __ -> Array of Note Objects
/**
 * @returns notes : Note[]
 */
function getNoteIds() {
  const manifest = localStorage.manifest;
  if (manifest) {
    return JSON.parse(manifest);
  } else {
    return [];
  }
}

/**
 * Fetches the notes for each ID in a list
 * @param ids : ID[]
 * @returns Note[]
 */
function idsToNotes(ids) {
  return ids.map((id) => {
    return localStorage[`note-${id}`];
  });
}

function makeCard(title, body, date) {
  cardsLocal.push({ title, body, date });
}

function makeNote(title, body, createdAt) {
  return { title, body, createdAt };
}

/* <div class="note">
  <p class="text">This is a test note to test the UI of this app</p>
  <p class="date">September 26th, 2021</p>
</div> */

/**
 * Converts a Note to an Element
 * @param Note
 * @returns Element
 */
function noteToElem({ title, body, createdAt }) {
  let div = document.createElement("div");
  div.classList.add("note");
  let bodyp = document.createElement("p");
  bodyp.textContent = body;
  bodyp.classList.add("text");
  let dateelem = document.createElement("p");
  let formattedDate = Date(createdAt).toLocaleDateString();
  dateelem.textContent = formattedDate;
  dateelem.classList.add("date");
  div.append(bodyp, dateelem);
  return div;
}

const notesElem = document.getElementById("notes");

function initializeNotes() {
  let ids = getNoteIds();
  let notes = idsToNotes(ids);
  let noteElems = notes.map((note) => noteToElem(note));
  addNotesToPage(noteElems);
}

/**
 * Inserts a list of note elements into the page
 * @param notes Element[]
 */
function addNotesToPage(notes) {
  let frag = document.createDocumentFragment();
  notes.forEach((note) => frag.append(note));
  notesElem.append(frag);
}

// function updateManifest(new_id) {
//   const manifest = localStorage.manifest
//   let manifest_arr
//   if (manifest) {
//     manifest_arr = JSON.parse(manifest);
//   } else {
//     manifest_arr = [];
//   }
//   return manifest_arr.push(new_id)

// }

/**
 *
 * @param {Number} new_id
 * @returns Void
 * Mutates manifest on LS by adding the new id to it
 */
function updateManifest(new_id) {
  const oldManifest = JSON.parse(localStorage.getItem("manifest")) ?? [];
  localStorage.setItem("manifest", JSON.stringify([...oldManifest, new_id]));
}

/**
 *
 * @param {Number} id
 * @param {Note Object} note
 * @returns Void
 *
 * Adds note at specified ID to local storage
 */
function persistNote(id, note) {
  localStorage.setItem(`note-${id}`, JSON.stringify(note));
}

function addNote(title, body) {
  const createdAt = Date.now();
  const note = makeNote(title, body, createdAt);
  const ids = getNoteIds();
  const last_id = ids[ids.length - 1];
  const curr_id = last_id + 1;
  updateManifest(curr_id);
  persistNote(curr_id, note);
}
