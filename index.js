let myLeads = [];
let tasks = [];
const inputEl = document.getElementById("input-el");
const inputBtn = document.getElementById("input-btn");
const ulEl = document.getElementById("ul-el");
const deleteBtn = document.getElementById("delete-btn");
const leadsFromLocalStorage = JSON.parse(localStorage.getItem("myLeads"));
const tabBtn = document.getElementById("tab-btn");
const taskInput = document.getElementById("task-input");
const timeInput = document.getElementById("time-input");
const addTaskBtn = document.getElementById("add-task-btn");
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-keywords");
const wordCount = document.getElementById("word-count");

if (leadsFromLocalStorage) {
    myLeads = leadsFromLocalStorage;
    render(myLeads);
}

tabBtn.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        myLeads.push(tabs[0].url);
        localStorage.setItem("myLeads", JSON.stringify(myLeads));
        render(myLeads);
    });
});

function render(leads) {
    let listItems = "";
    for (let i = 0; i < leads.length; i++) {
        listItems += `
            <li>
                <a target='_blank' href='${leads[i]}'>
                    ${leads[i]}
                </a>
            </li>
        `;
    }
    ulEl.innerHTML = listItems;
}

deleteBtn.addEventListener("dblclick", function () {
    localStorage.clear();
    myLeads = [];
    render(myLeads);
});

inputBtn.addEventListener("click", function () {
    myLeads.push(inputEl.value);
    inputEl.value = "";
    localStorage.setItem("myLeads", JSON.stringify(myLeads));
    render(myLeads);
});

addTaskBtn.addEventListener("click", function () {
    const task = taskInput.value;
    const time = timeInput.value;

    if (task && time) {
        tasks.push({ task, time });
        renderTasks();
        setTimer(task, time);
        taskInput.value = "";
        timeInput.value = "";
    } else {
        alert("Please enter a task and time");
    }
});

function renderTasks() {
    let taskItems = "";
    for (let i = 0; i < tasks.length; i++) {
        taskItems += `
            <li>
                ${tasks[i].task} - ${tasks[i].time}
            </li>
        `;
    }
    document.getElementById("tasks-list").innerHTML = taskItems;
}

function setTimer(task, time) {
    const timeInSeconds = convertTimeToSeconds(time);
    setTimeout(() => {
        alert(`Time's up for: ${task}`);
    }, timeInSeconds * 1000);
}

function convertTimeToSeconds(time) {
    const [hours, minutes] = time.split(":");
    return parseInt(hours) * 3600 + parseInt(minutes) * 60;
}

searchBtn.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const activeTab = tabs[0];
        chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            function: getPageContent
        }).then((result) => {
            const pageContent = result[0].result.toLowerCase();
            const searchWord = searchInput.value.toLowerCase();
            const regex = new RegExp("\\b" + searchWord + "\\b", "g");
            const match = pageContent.match(regex);
            const count = match ? match.length : 0;

            wordCount.textContent = `Word count of "${searchWord}" on this page: ${count}`;
        });
    });
});

function getPageContent() {
    return document.body.innerText;
}
