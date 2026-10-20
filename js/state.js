/* ============================================================
   GET BACK MY KEY
   Local-only password attempt tracker
============================================================ */

const STORAGE_KEY = "get-back-my-key-data-v1";


/* ============================================================
   STATE
============================================================ */

let passwords = [];
let currentFilter = "all";
let searchTerm = "";

let pendingSuccessIndex = null;
let pendingDeleteIndex = null;

let toastTimer = null;

let audioContext = null;

let particleAnimation = null;

