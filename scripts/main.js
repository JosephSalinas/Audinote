let recording = false
let noteId = false
let noteElem = false
let noteOpen = false
const notes = document.getElementById("notes")
const mainBtn = document.getElementById("record")
const textarea = document.getElementById("testTextarea")
const modal = document.getElementById("recording-result")
const overlay = document.getElementById("dim-overlay")
const noteTitle = document.getElementById("noteTitle")
const buttons = document.getElementById("buttons")
const noteDelete = document.getElementById("noteDelete")
const noteDone = document.getElementById("noteDone")

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

noteDelete.addEventListener("click", ()=>{
  deleteNote()
})
noteDone.addEventListener("click", ()=>{
  finishNote()
})

// new speech recognition object
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var recognition = new SpeechRecognition();

// recognition.interimResults = true;
recognition.continuous = true;
recognition.maxAlternatives = 0;

// This runs when the speech recognition service starts
recognition.onstart = function () {
  console.log("We are listening. Speak!");
};

// This runs when the speech recognition service returns result
recognition.onresult = function (event) {
  const result = event.results[event.results.length - 1][0];
  // (event.results)
  const transcript = result.transcript;
  const confidence = result.confidence;
  handleResults(transcript, confidence);
};

// start recognition
// recognition.start();

function handleResults(transcript, confidence) {
  console.log("You said: " + transcript + " \nConfidence: " + confidence);
  if (noteOpen) {
    updateTextarea(`${transcript}`);
  }
}

function closeModal() {
  noteOpen = false
  overlay.classList.remove("visible")
  modal.classList.add("hidden")
  modal.classList.remove("waiting")
  modal.classList.remove("editing")
  buttons.classList.remove("all")
}
function modalEditing() {
  noteOpen = true
  overlay.classList.add("visible")
  modal.classList.remove("hidden")
  modal.classList.add("editing")
  modal.classList.remove("waiting")
  buttons.classList.add("all")
}
function modalRecording() {
  noteOpen = true
  overlay.classList.add("visible")
  modal.classList.remove("hidden")
  modal.classList.remove("editing")
  modal.classList.add("waiting")
  buttons.classList.add("all")
}

function stopEditing() {
  closeModal()
  stopRecording()
  noteId = false
  if (noteElem) noteElem.classList.remove("selected")
  noteElem = false
  noteOpen = false
  recording = false
  setTimeout(()=>{
    clearModal()
  }, 400)
}

function newNote() {
  modalRecording()
  startRecording()
}

mainBtn.addEventListener("click", () => {
  if (!noteOpen) {
    newNote()
  }
  else {
    if (recording) {
      modalEditing()
      stopRecording()
    } else {
      modalRecording()
      startRecording()
    }
  }
});

function updateRecordButton() {
  mainBtn.classList.remove(recording ? "inactive" : "recording")
  setTimeout(()=>{
    mainBtn.classList.add(recording ? "recording" : "inactive")
  }, 150)
}

function shakeModal() {
  modal.classList.add("shake")
  setTimeout(()=>{
    modal.classList.remove("shake")
  }, 1000)
}

function startRecording() {
  recognition.start()
  recording = true
  updateRecordButton()
  console.log("Recording started...")
}

function stopRecording() {
  recognition.stop()
  recording = false
  updateRecordButton()
  console.log("Recording stopped")
}

function deleteNote() {
  if (noteId) {
    storage.deleteNote(noteId)
    noteElem.parentNode.removeChild(noteElem)
  }
  stopEditing()
}

function finishNote() {
  const title = noteTitle.value.trim()
  const body = textarea.value.trim()
  // If the title or body is empty, prevent saving the note
  if (title == "" && body == "" && !noteId) {
    stopEditing()
    return
  }
  else if (title == "" || body == "") {
    shakeModal()
    return
  }
  
  if (noteId) {
    console.log("Would Save:", noteId, noteTitle.value, textarea.value)
    storage.updateNote(noteId, noteTitle.value, textarea.value)
    updateNote(storage.getNote(noteId), noteElem)
  }
  else {
    const id = storage.addNote(title, body, Date.now())
    const note = storage.getNote(id)
    notes.prepend(noteToElem(note))
  }
  stopEditing()
}

function updateNote({title, body}, elem) {
  elem.children[0].textContent = title
  elem.children[1].textContent = body
}

function updateTextarea(text) {
  if (textarea.value.length > 0) {
    textarea.value += " " + text;
  }
  else {
    textarea.value = text;
  }
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
function noteToElem({ title, body, createdAt, id }) {
  let div = document.createElement("div");
  div.classList.add("note");
  let titlep = document.createElement("p")
  titlep.textContent = title
  titlep.classList.add("title")
  let bodyp = document.createElement("p");
  bodyp.textContent = body;
  bodyp.classList.add("text");
  let dateelem = document.createElement("p");
  dateelem.textContent = dateToString(createdAt);
  dateelem.classList.add("date");
  div.append(titlep, bodyp, dateelem);
  div.addEventListener("click", ()=>{
    editNote(div, id)
  })
  return div;
}

const notesElem = document.getElementById("notes");

function clearModal() {
  if (!noteOpen) {
    noteTitle.value = ""
    textarea.value = ""
  }
}

function noteIntoModal({title, body}) {
  noteTitle.value = title
  textarea.value = body
}

function editNote(elem, id) {
  noteElem = elem
  noteId = id
  elem.classList.add("selected")
  noteIntoModal(storage.getNote(id))
  modalEditing()
}

function initializeNotes() {
  const notesList = storage.getAllNotes()
  notesList.sort((n1, n2)=>n2.createdAt - n1.createdAt)
  const frag = document.createDocumentFragment()
  frag.append(...notesList.map(noteToElem))
  notes.append(frag)
}
initializeNotes()

overlay.addEventListener("click", ()=>{
  finishNote()
})

function numToOrdinal(num) {
  if ([1, 11, 21, 31].includes(num)) return `${num}st`
  if ([2, 12, 22].includes(num)) return `${num}nd`
  if ([3, 13, 23].includes(num)) return `${num}rd`
  return `${num}th`
}

function dateToString(ts) {
  let date = new Date(ts)
  return `${MONTHS[date.getMonth()]} ${numToOrdinal(date.getDate())}, ${date.getFullYear()}`
}