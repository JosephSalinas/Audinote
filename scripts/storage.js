const MANIFEST = "manifest"

class NoteStorage {
  constructor() {
    this.manifest = JSON.parse(localStorage.getItem(MANIFEST)) ?? []
    this.noteCache = {}
  }
  /**
   * Gets a note from the cache or localstorage if unavailible
   * @param {Natural} id 
   * @returns {Note}
   */
  getNote(id) {
    const cacheResult = this.noteCache[id]
    if (cacheResult) {
      return cacheResult
    }
    else {
      const storageResult = JSON.parse(localStorage.getItem(`note-${id}`))
      const note = {id: id, ...storageResult}
      this.noteCache[id] = note
      return note
    }
  }
  /**
   * Gets the next note id
   * @returns {Number}
   */
  nextId() {
    if (this.manifest.length == 0) {
      return 0
    }
    else {
      return this.manifest[this.manifest.length-1] + 1
    }
  }
  /**
   * Deletes the note with the given id
   * @param {Natural} id The id of the note to delete
   */
  deleteNote(id) {
    const index = this.manifest.indexOf(id)
    this.manifest = [...this.manifest.slice(0, index), ...this.manifest.slice(index+1)]
    this.persistManifest()
    localStorage.removeItem(`note-${id}`)
    if (this.noteCache[id]) {
      delete this.noteCache[id]
    }
  }
  /**
   * Creates a new note with the given pieces of information
   * @param {String} title The title of the note
   * @param {String} body The body of the note
   * @param {Natural} createdAt The timestamp the note was created
   * @returns {Natural} The id of the new note
   */
  addNote(title, body, createdAt) {
    const id = this.nextId()
    this.manifest = [...this.manifest, id]
    const noteObj = {title, body, createdAt, id}
    this.noteCache[id] = noteObj
    localStorage.setItem(`note-${id}`, JSON.stringify(noteObj))
    this.persistManifest()
    return id
  }
  persistManifest() {
    localStorage.setItem(MANIFEST, JSON.stringify(this.manifest))
  }
  /**
   * Updates a note record in localStorage
   * @param {Number} id The id of the note to update
   * @param {String} title The new title of the note
   * @param {String} body The new body of the note
   */
  updateNote(id, title, body) {
    const oldNote = this.getNote(id)
    if (!oldNote) {
      console.error(`No note with ${id} to update!`)
      return
    }
    const createdAt = oldNote.createdAt
    const newNote = {title, body, createdAt}
    this.noteCache[id] = newNote
    localStorage.setItem(`note-${id}`, JSON.stringify(newNote))
  }
  /**
   * Gets a list of all note objects
   * @returns {Note[]}
   */
  getAllNotes() {
    return this.manifest.map(id => this.getNote(id))
  }
}

const storage = new NoteStorage()