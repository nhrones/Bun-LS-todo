//@ts-nocheck

// js/selectBuilder.js
function resetTopicSelect() {
  topicSelect.innerHTML = '<option value="" disabled selected hidden>Select A Todo Topic</option>';
}
function addOptionGroup(label, options) {
  const len = options.length;
  let optionElement;
  const optionGroup = document.createElement("optgroup");
  optionGroup.label = label;
  for (let i = 0;i < len; ++i) {
    optionElement = document.createElement("option");
    optionElement.textContent = options[i].title || "fuck";
    optionElement.value = options[i].key || "fuck";
    optionGroup.appendChild(optionElement);
  }
  topicSelect.appendChild(optionGroup);
  return optionGroup;
}

// js/dbCache.js
async function initCache() {
  return await hydrate();
}
function restoreCache(records) {
  const tasksObj = JSON.parse(records);
  todoCache = new Map(tasksObj);
  persist();
}
function setCache(key, value, topicChanged = false) {
  todoCache.set(key, value);
  persist();
  if (topicChanged) {
  }
}
async function hydrate() {
  let result = localStorage.getItem("todos");
  todoCache = new Map(JSON.parse(`${result}`));
  buildTopics();
}
async function persist() {
  const todoJson = JSON.stringify(Array.from(todoCache.entries()));
  localStorage.setItem("todos", todoJson);
}
var todoCache = new Map;
var getFromCache = (key) => {
  return todoCache.get(key);
};

// js/backup.js
function backupData() {
  const jsonData = JSON.stringify(Array.from(todoCache.entries()));
  const link = document.createElement("a");
  const file = new Blob([jsonData], { type: "application/json" });
  link.href = URL.createObjectURL(file);
  link.download = "backup.json";
  link.click();
  URL.revokeObjectURL(link.href);
}
function restoreData() {
  const fileload = document.getElementById("fileload");
  const fileloadInput = fileload;
  fileloadInput.click();
  fileloadInput.addEventListener("change", function() {
    const reader = new FileReader;
    reader.onload = function() {
      restoreCache(reader.result);
      window.location.reload();
    };
    if (fileload && fileloadInput.files) {
      reader.readAsText(fileloadInput.files[0]);
    }
  });
}

// js/db.js
async function initDB() {
  await initCache();
}
function getTasks(key) {
  thisKeyName = key || "";
  if (thisKeyName.length) {
    let data = getFromCache(thisKeyName) ?? [];
    if (data === null) {
      console.log(`No data found for ${thisKeyName}`);
      data = [];
    }
    setTasks(data);
    refreshDisplay();
  }
}
function buildTopics() {
  const data = getFromCache("topics");
  resetTopicSelect();
  if (data && data.length > 0) {
    for (let i = 0;i < data.length; i++) {
      const parsedTopics = parseTopics(data[i]);
      addOptionGroup(parsedTopics.group, parsedTopics.entries);
    }
  } else {
    restoreData();
  }
}
var parseTopics = function(topics) {
  const topicObject = { group: "", entries: [] };
  const thisTopic = topics;
  const txt = thisTopic.text;
  const lines = txt.split("\n");
  topicObject.group = lines[0].trim();
  for (let i = 1;i < lines.length; i++) {
    const newObj = { title: "", key: "" };
    const element = lines[i];
    const items = element.split(",");
    const title = items[0];
    const keyName = items[1].trim();
    newObj.title = title;
    newObj.key = keyName;
    topicObject.entries[i - 1] = newObj;
  }
  return topicObject;
};
function saveTasks(topicChanged) {
  setCache(thisKeyName, tasks2, topicChanged);
}
function deleteCompleted() {
  const savedtasks = [];
  let numberDeleted = 0;
  tasks2.forEach((task) => {
    if (task.disabled === false) {
      savedtasks.push(task);
    } else {
      numberDeleted++;
    }
  });
  setTasks(savedtasks);
  saveTasks(currentTopic === "topics");
  popupText.textContent = `Removed ${numberDeleted} tasks!`;
  popupDialog.showModal();
}
var thisKeyName = "";

// js/templates.js
function taskTemplate(index, item) {
  const { disabled, text } = item;
  return `
   <div class="todo-container">
      <input type="checkbox" 
         id="checkbox-${index}" 
         class="todo-checkbox" 
         data-index=${index}
      ${disabled ? "checked" : ""}>
      <pre WIDTH="40"
         id="todo-${index}" 
         class="${disabled ? "disabled" : ""}" 
         data-index=${index}>${text}
      </pre>
   </div> `;
}

// js/tasks.js
function setTasks(data) {
  tasks2 = data;
}
function addTask(newTask, topics = false) {
  if (topics) {
    newTask = `${newTask}
      newTopic, newKey`;
  }
  console.log("added task ", newTask);
  tasks2.unshift({ text: newTask, disabled: false });
  saveTasks(topics);
  taskInput.value = "";
  taskInput.focus();
  refreshDisplay();
}
function refreshDisplay() {
  todoList.innerHTML = "";
  if (tasks2 && tasks2.length > 0) {
    tasks2.forEach((item, index) => {
      const p = document.createElement("p");
      p.innerHTML = taskTemplate(index, item);
      on(p, "click", (e) => {
        if (e.target.type === "checkbox")
          return;
        if (e.target.type === "textarea")
          return;
        const todoItem = e.target;
        const existingText = tasks2[index].text;
        const editElement = document.createElement("textarea");
        editElement.setAttribute("rows", "6");
        editElement.setAttribute("cols", "62");
        editElement.setAttribute("wrap", "hard");
        editElement.setAttribute("autocorrect", "on");
        editElement.value = existingText;
        todoItem.replaceWith(editElement);
        editElement.focus();
        on(editElement, "blur", function() {
          const updatedText = editElement.value.trim();
          if (updatedText.length > 0) {
            tasks2[index].text = updatedText;
            saveTasks(currentTopic === "topics");
          }
          refreshDisplay();
        });
      });
      on(p.querySelector(".todo-checkbox"), "change", (e) => {
        e.preventDefault();
        const index2 = e.target.dataset.index;
        tasks2[index2].disabled = !tasks2[index2].disabled;
        saveTasks(false);
      });
      todoList.appendChild(p);
    });
  }
  todoCount.textContent = "" + tasks2.length;
}
var on = (elem, event, listener) => {
  return elem.addEventListener(event, listener);
};
var tasks2 = [];

// js/dom.js
function setCurrentTopic(topic) {
  currentTopic = topic;
}
async function initDom() {
  await initDB();
  on2(taskInput, "keydown", function(evt) {
    const { key } = evt;
    if (key === "Enter") {
      evt.preventDefault();
      const tc = taskInput.value;
      if (tc.length > 0) {
        addTask(tc, currentTopic === "topics");
      }
    }
  });
  on2(topicSelect, "change", () => {
    setCurrentTopic(topicSelect.value.toLowerCase());
    getTasks(currentTopic);
  });
  on2(deleteCompletedBtn, "click", () => {
    deleteCompleted();
    refreshDisplay();
  });
  on2(popupDialog, "click", (event) => {
    event.preventDefault();
    popupDialog.close();
  });
  on2(popupDialog, "close", (event) => {
    console.log("popupDialog close");
    event.preventDefault();
    if (!pinOK)
      myDialog.showModal();
  });
  on2(popupDialog, "keyup", (evt) => {
    evt.preventDefault();
    popupDialog.close();
    if (!pinOK)
      myDialog.showModal();
  });
  on2(pinInput, "keyup", (event) => {
    event.preventDefault();
    pinTryCount += 1;
    console.log("pinInput key:", event.key);
    if (event.key === "Enter" || pinInput.value === "1313") {
      console.log("pinInput.value = ", pinInput.value);
      if (pinInput.value === "1313") {
        pinInput.value = "";
        pinOK = true;
        myDialog.close();
      } else {
        myDialog.close();
        pinInput.value = "";
        pinOK = false;
        popupText.textContent = pinTryCount === 3 ? `Incorrect pin entered ${pinTryCount} times!
 Please close this Page!` : `Incorrect pin entered!`;
        if (pinTryCount === 3) {
          document.body.innerHTML = `
               <h1>Three failed PIN attempts!</h1>
               <h1>Please close this page!</h1>`;
        } else {
          popupDialog.showModal();
        }
      }
    }
  });
  on2(backupBtn, "click", () => {
    backupData();
  });
  on2(restoreBtn, "click", () => {
    restoreData();
  });
  refreshDisplay();
  if (window.location.search !== "?ndh") {
    myDialog.showModal();
    pinInput.focus({ focusVisible: true });
  } else {
    pinOK = true;
  }
}
var currentTopic = "topics";
var $ = (id) => document.getElementById(id);
var on2 = (elem, event, listener) => {
  return elem?.addEventListener(event, listener);
};
var backupBtn = $("backupbtn");
var restoreBtn = $("restorebtn");
var taskInput = $("taskInput");
var todoCount = $("todoCount");
var todoList = $("todoList");
var deleteCompletedBtn = $("deletecompleted");
var topicSelect = $("topicselect");
var popupDialog = $("popupDialog");
var pinInput = $("pin");
var myDialog = $("myDialog");
var popupText = $("popup_text");
var pinOK = false;
var pinTryCount = 0;

// js/main.js
initDom();
