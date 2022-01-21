const electron = require("electron");
const Store = require("electron-store");
const url = require("url");
const path = require("path");
const find = require("find-process");
const { Notification } = require("electron");
const { app, BrowserWindow, Menu } = electron;

let mainWindow;
let store;

// AutoLaunch on startup login boot
var AutoLaunch = require("auto-launch");

var autoLauncher = new AutoLaunch({
  name: "@ddict",
});

autoLauncher.enable();

//autoLauncher.disable();
autoLauncher
  .isEnabled()
  .then(function (isEnabled) {
    if (isEnabled) {
      return;
    }
    autoLauncher.enable();
  })
  .catch(function (err) {
    // handle error
  });

// Listen for app to be ready
app.on("ready", function () {
  // Create new window
  mainWindow = new BrowserWindow({
    minHeight: 730,
    minWidth: 1400,
    x: 50,
    y: 20,
    icon: "assets/images/logo.ico",
    titleBarStyle: "hidden",
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  mainWindow.on("close", (event) => {
    if (app.quitting) {
      mainWindow = null;
    } else {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "src/mainWindow.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);

  // Initialize store
  store = new Store();

  // If it is the first time using addict
  if (store.get("processes") === undefined) {
    var data = [];
    var processes = [];
    var runningProcesses = [];
    store.set("data", data);
    store.set("processes", processes);
    store.set("runningProcesses", runningProcesses);
  }

  startProcessDetection();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  mainWindow.show();
});

app.on("before-quit", () => (app.quitting = true));

// Create menu template
const mainMenuTemplate = [
  {
    label: "",
  },
];

// Add developper tools if not in prod
if (process.env.NODE_ENV !== "production") {
  mainMenuTemplate.push({
    label: "Developer Tools",
    submenu: [
      {
        label: "Toggle DevTools",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
      { role: "reload" },
    ],
  });
}

// Detect if a listed process is currently running on a specified interval
function startProcessDetection() {
  setInterval(function () {
    console.log("Let's see if you play a game of the following list");
    console.log(store.get("processes"));

    // Loop on each game in the list
    store.get("processes").forEach((process_name) => {
      // Compare with the current computer processes running
      find("name", process_name, true).then(function (list) {
        // If one or more process corresponding to the name is running
        if (list.length > 0) {
          console.log("there is a " + process_name + " process");

          // CHECK IF THE GAME HASN'T ALREADY BEEN DETECTED
          if (!isDetectedAsRunning(process_name)) {
            var newRunningProcess = {
              name: process_name,
              startTime: Date.now(),
              endTime: null,
            };
            addRunningProcessToList(newRunningProcess);
            console.log("Added to current games : " + process_name);
          } else {
            checkNotifications(process_name);
          }
        } else {
          console.log(
            "No process of " + process_name + " is currently running"
          );

          // IF THE GAME HAS ALREADY BEEN DETECTED AND IS OVER
          if (isDetectedAsRunning(process_name)) {
            var terminated_process = store
              .get("runningProcesses")
              .find((process) => (process.name = process_name));

            console.log(terminated_process);

            // delete terminated process of running processes list
            deleteProcessOfRunningProcessList(terminated_process);

            // add process use datas to database
            addProcessUse(terminated_process);
          }
        }
      });
    });
  }, 10 * 1000); // 10 secondes
}

/**
 * Returns running process if true, else false
 * @param {*} process_name
 * @returns boolean
 */
function isDetectedAsRunning(process_name) {
  return store
    .get("runningProcesses")
    .find((process) => process.name === process_name);
}

/**
 * Add a running process to a list to identify when it closes
 * @param {*} process
 */
function addRunningProcessToList(process) {
  var runningProcesses = store.get("runningProcesses");
  runningProcesses.push(process);
  store.set("runningProcesses", runningProcesses);
}

/**
 * Delete a process of the running processes list
 * @param {*} processName
 */
function deleteProcessOfRunningProcessList(process) {
  var runningProcesses = store.get("runningProcesses");

  runningProcesses.splice(runningProcesses.indexOf(process), 1);
  store.set("runningProcesses", runningProcesses);
}

/**
 * Add datas to database about a terminated process
 * @param {*} process
 */
function addProcessUse(process) {
  process.endTime = Date.now();
  process.duration = process.endTime - process.startTime;

  var data = store.get("data");
  data.push(process);

  store.set("data", data);
}

/**
 * Checks if a notifications is linked to this process
 * @param {*} process_name
 */
function checkNotifications(process_name) {
  var runningProcesses = store.get("runningProcesses");
  var now = Date.now();
  var startTime = runningProcesses.find(
    (runningProcess) => (runningProcess.name = process_name)
  ).startTime;
  var notifications = store.get("notifications");
  if (notifications == undefined) {
    notifications = [];
    store.set("notifications", notifications);
  }
  var notif = notifications.find(
    (notification) => (notification.process = process_name)
  );

  if (notif == undefined) {
    console.log("no notification for this game: " + process_name);
    return;
  }
  var timeAfterPopUpNotification = notif.timeAfterPopUpNotification;

  var diffMs = now - startTime; // milliseconds between now & Christmas
  var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes

  console.log(
    "la diff de minute entre maintennat et le debut du jeu : " +
    process_name +
    " est de " +
    diffMins +
    ". Il faut " +
    timeAfterPopUpNotification
  );
  if (diffMins == timeAfterPopUpNotification) {
    const notification = {
      title: "@ddict !",
      body: "The time is up! Stop playing " + process_name,
      icon: "./assets/images/logo.ico"
    };
    new Notification(notification).show();

    notifications.splice(notifications.indexOf(notif), 1);
    store.set("notifications", notifications);
  }
}
