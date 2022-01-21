// initialisation du store
const Store = require("electron-store");
const store = new Store();
const customTitlebar = require("custom-electron-titlebar");

new customTitlebar.Titlebar({
  backgroundColor: customTitlebar.Color.fromHex("#141418"),
  icon: "../assets/images/logo.ico",
  overflow: "visible",
  shadow: "true",
});

var timeInput = document.getElementById("time");
var select = document.getElementById("processes");
var notificationList = document.getElementById("notifications");

loadProcessesIntoSelect();
loadNotificationList();

document.getElementById("submit").addEventListener("click", () => {
  if (timeInput.value == "") alert("You need to add a time");
  else {
    var notification = {
      process: select.value,
      timeAfterPopUpNotification: timeInput.value,
    };
    addToNotificationList(notification);
  }
});

function addToNotificationList(notification) {
  var notifications = store.get("notifications");
  notifications.push(notification);
  store.set("notifications", notifications);
}

function loadNotificationList() {
  var notifications = store.get("notifications");

  notifications.forEach((notification) => {
    var li = document.createElement("li");

    var deleteButton = document.createElement("button");
    deleteButton.id = "deleteButton";
    deleteButton.classList.add("eightbit-btn", "eightbit-btn--reset", "margin-right");
    deleteButton.innerHTML = "&Cross;";

    li.appendChild(
      document.createTextNode(
        notification.process +
        " notifications within " +
        notification.timeAfterPopUpNotification +
        " minutes"
      )
    );
    li.appendChild(deleteButton);

    li.lastChild.addEventListener("click", (event) => {
      event.target.parentElement.remove();
      var notifications = store.get("notifications");

      notifications.splice(notifications.indexOf(notification.process), 1);
      store.set("notifications", notifications);
    });

    notificationList.appendChild(li);
  });
}

function loadProcessesIntoSelect() {
  var processes = store.get("processes");

  for (var i = 0; i < processes.length; i++) {
    var opt = document.createElement("option");
    opt.value = processes[i];
    opt.innerHTML = processes[i]; // whatever property it has

    // then append it to the select element
    select.appendChild(opt);
  }
}
