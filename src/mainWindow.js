const customTitlebar = require("custom-electron-titlebar");
const Store = require("electron-store");

new customTitlebar.Titlebar({
  backgroundColor: customTitlebar.Color.fromHex("#141418"),
  icon: "../assets/images/logo.ico",
  overflow: "visible",
  shadow: "true",
});

// Initialization Store
const store = new Store();

// Fill in the games list with existing games from local storage (store)
var ul = document.getElementById("gameList");
if (store.get("processes") === undefined) {
  console.log("Pas encore d'executable dans la liste des process à surveiller");
} else {
  store.get("processes").forEach((game_process_name) => {
    var li = document.createElement("li");

    var deleteButton = document.createElement("button");
    deleteButton.id = "deleteButton";
    deleteButton.classList.add("eightbit-btn", "eightbit-btn--reset");
    deleteButton.innerHTML = "&Cross;";

    li.appendChild(document.createTextNode(game_process_name));
    li.appendChild(deleteButton);
    var hr = document.createElement("hr")
    li.lastChild.addEventListener("click", (event) => {
      event.target.parentElement.remove();
      var processes = store.get("processes");

      processes.splice(processes.indexOf(game_process_name), 1);
      store.set("processes", processes);
    });

    ul.appendChild(li);
  });
}

// EventListener on file input
document.querySelector("input").addEventListener("change", () => {
  var processName = document
    .querySelector("input")
    .value.replace(/^.*[\\\/]/, "");

  // If the game isn't already listed
  if (!store.get("processes").includes(processName)) {
    // add to database list
    addProcessToList(processName);

    // add to html list
    var ul = document.getElementById("gameList");
    var li = document.createElement("li");
    var deleteButton = document.createElement("button");
    deleteButton.id = "deleteButton";
    deleteButton.classList.add("eightbit-btn", "eightbit-btn--reset");
    deleteButton.innerHTML = "&Cross;";

    li.appendChild(document.createTextNode(processName));
    li.appendChild(deleteButton);

    li.lastChild.addEventListener("click", (event) => {
      event.target.parentElement.remove();
      var processes = store.get("processes");

      processes.splice(processes.indexOf(processName), 1);
      store.set("processes", processes);
    });

    ul.appendChild(li);
    console.log("You added a new process to observe : " + processName);
  }
});

/**
 * Add a process to the user's list
 */
function addProcessToList(processName) {
  var processes = store.get("processes");

  // Add it by copying the list
  processes.push(processName);
  store.set("processes", processes);
}
