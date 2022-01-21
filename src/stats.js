let weeklyChart = document.getElementById("weeklyChart").getContext("2d");
let dailyChart = document.getElementById("dailyChart").getContext("2d");
const customTitlebar = require("custom-electron-titlebar");

new customTitlebar.Titlebar({
  backgroundColor: customTitlebar.Color.fromHex("#141418"),
  icon: "../assets/images/logo.ico",
  overflow: "visible",
  shadow: "true",
});
// Global options
Chart.defaults.global.defaultFontFamily = "Poppins,sans-serif";
Chart.defaults.global.defaultFontSize = 18;
Chart.defaults.global.defaultFontColor = "black";

let barChart = new Chart(weeklyChart, {
  type: "bar", // bar, horizontalBar, pie, line, doughnut, radar,polarArea
  data: {
    labels: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    datasets: [
      {
        label: "Gaming Time",
        data: [1, 3, 2, 3, 5, 6, 7],
        backgroundColor: [
          "rgba(255,99,132,1)",
          "rgba(54,162,235,1)",
          "rgba(255,206,86,1)",
          "rgba(75,192,192,1)",
          "rgba(153,102,255,1)",
          "rgba(255,159,64,1)",
          "rgba(255,99,132,1)",
          "rgba(255,99,132,1)",
        ],
        borderWidth: 1,
        borderColor: "#777",
        hoverBorderWidth: 3,
      },
    ],
    borderWidth: 1,
    borderColor: "#777",
    hoverBorderWidth: 3,
  },
  options: {
    title: {
      display: true,
      text: "Your Gaming Time during this week",
      fontSize: 25,
    },
    responsive: true,
    maintainRatioAspect: false,
    legend: {
      display: false,
      position: "right",
      labels: {
        fontColor: "black",
      },
    },
    layout: {
      padding: {
        left: 50,
        right: 0,
        bottom: 0,
        top: 0,
      },
    },



    scales: {
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: "Hours/Day",
          },
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },



  },
});

// Daily stats

let doughnutChart = new Chart(dailyChart, {
  type: "doughnut", // bar, horizontalBar, pie, line, doughnut, radar,polarArea
  data: {
    labels: ["GTA5.exe", "LeagueClient.exe", "VALORANT.exe"],
    datasets: [
      {
        label: "Gaming Time",
        data: [1, 3, 2],
        backgroundColor: [
          "rgba(255,99,132,1)",
          "rgba(54,162,235,1)",
          "rgba(255,206,86,1)",
        ],
        borderWidth: 1,
        borderColor: "#777",
        hoverBorderWidth: 3,
      },
    ],
  },
  options: {
    title: {
      display: true,
      text: "Your Gaming Time Today ",
      fontSize: 25,
    },
    responsive: true,
    maintainRatioAspect: false,
    legend: {
      display: true,
      position: "left",
      labels: {
        fontColor: "black",
        text: "Hours",
      },
    },
    layout: {
      padding: {
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
      },
    },
    scales: {},
  },
});

var list = document.getElementById("datas");

// initialisation du store
const Store = require("electron-store");
const store = new Store();

var datas = store.get("data");
console.log(datas);
datas.forEach((element) => {
  var startTime = new Date(element.startTime);
  var endTime = new Date(element.endTime);

  console.log(
    "You played " + timeDiffCalc(endTime, startTime) + " on " + element.name
  );

  var li = document.createElement("li");
  li.innerHTML =
    "You played " +
    timeDiffCalc(endTime, startTime) +
    " on " +
    element.name +
    " from " +
    new Date(element.startTime) +
    " to " +
    new Date(element.endTime);
  list.appendChild(li);
});

function timeDiffCalc(dateFuture, dateNow) {
  let diffInMilliSeconds = Math.abs(dateFuture - dateNow) / 1000;

  // calculate days
  const days = Math.floor(diffInMilliSeconds / 86400);
  diffInMilliSeconds -= days * 86400;

  // calculate hours
  const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
  diffInMilliSeconds -= hours * 3600;

  // calculate minutes
  const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
  diffInMilliSeconds -= minutes * 60;

  let difference = "";
  if (days > 0) {
    difference += days === 1 ? `${days} day, ` : `${days} days, `;
  }

  difference +=
    hours === 0 || hours === 1 ? `${hours} hour, ` : `${hours} hours, `;

  difference +=
    minutes === 0 || hours === 1 ? `${minutes} minutes` : `${minutes} minutes`;

  return difference;
}
