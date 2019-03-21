
const MOCK_DATA = [],
BUTTON_NAME_SUBMIT = "submit",
BUTTON_NAME_UPDATE = "update",
BUTTON_NAME_CANCEL = "cancel";

const CHECK_ALL = document.getElementsByClassName("check-all"),
        DELETE_ALL = document.getElementsByClassName("delete-all");

// Word
const FORM_WORD = document.getElementById("frm-word"),
DATA_TABLE_WORD = document.getElementById("dataTableWord"),
LIST_ELEMENT_WORD = document.getElementById("list-word"),
SEARCH_WORD = document.getElementById("search-box-word");


// Group
const DATA_TABLE_GROUP = document.getElementById("dataTableGroup"),
FORM_GROUP = document.getElementById("frm-group"),
LIST_ELEMENT_GROUP = document.getElementById("list-group"),
SEARCH_GROUP = document.getElementById("search-box-group");

let WORD_ID = "";
let GROUP_ID = "";

function copyToClipboard(secretInfo) {
    const body = document.getElementsByTagName("body")[0]
    let tempInput = document.createElement('INPUT');

    body.appendChild(tempInput);

    tempInput.setAttribute('value', secretInfo)
    tempInput.select();
    document.execCommand('copy');

    body.removeChild(tempInput);
}

function ControlButton(form, buttons) {
    return buttons.map(d => form[d.name].style.display = d.display);
}

function RemoveElement(id) {
    var elem = document.getElementById(id);
    return elem.parentNode.removeChild(elem);
}

function UpdateElement(data) {
    var li = document.getElementById(data._id);

    let text = [];
    for (let key in data) {
        if (key === "_id") continue;

        if (data[key] instanceof Array) {
            li.setAttribute(`data-${key}`, data[key].join(","));
        } else {
            li.setAttribute(`data-${key}`, data[key]);

            text.push(data[key]);
        }
    }

    li.childNodes[1].innerText = text.join(" - "); // textContent or innerText
}

async function Update(request, url) {
    try {
        const response = await fetch(url, {
            method: "PUT",
            body: JSON.stringify(request),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (data.error.length > 0) {
            alert(data.error[0]);
        } else {
            UpdateElement(data.saved[0]);
        }
    } catch (error) {
        alert(error);
    }
}

async function Delete(id, url, message) {
    if ( message ) {
        const result = confirm(message);
        if (!result) return;
    }

    try {
        const response = await fetch(url, {
            method: "DELETE",
            body: JSON.stringify({ _id: id }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();

        if (data.error.length > 0) {
            if ( message ) {
                alert(data.error[0]);
            }
        } else {
            RemoveElement(id);
        }

    } catch (error) {
        if ( message ) {
            alert(error);
        }
    }

}

async function Search(request, url) {
    try {
        const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify(request),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        FetchData(data, LIST_ELEMENT_WORD, ["_id", "name", "mean", "groups"], FORM_WORD, "/word")
    } catch (error) {
        alert(error);
    }
}

function FormUpdate(id, frm, model) {
    let element = document.getElementById(id);

    if (!element) {
        return alert("Form update not found element");
    }

    frm["_id"].value = id;

    for (let i = 0; i < model.length; i++) {
        const inputFrmName = model[i];

        const value = element.getAttribute(`data-${inputFrmName}`);

        frm[inputFrmName].value = value || "";
    }

    frm.elements["submit"].style.display = "none";
    frm.elements["update"].style.display = "inline-block";
    frm.elements["cancel"].style.display = "inline-block";
}

function Cancel(form) {
    if (!form || form.nodeName !== "FORM") {
        return;
    }
    for (let i = form.elements.length - 1; i >= 0; i = i - 1) {
        if (form.elements[i].name === "") {
            continue;
        }

        if (form.elements[i].nodeName === "BUTTON"
            || (form.elements[i].nodeName === "INPUT" && form.elements[i].type === "submit")
            || (form.elements[i].nodeName === "INPUT" && form.elements[i].type === "button")
            || (form.elements[i].nodeName === "INPUT" && form.elements[i].type === "reset")
            || form.elements[i].nodeName === "file") {
            continue;
        }

        form.elements[i].value = "";
    }

    ControlButton(form,
        [
            { name: BUTTON_NAME_SUBMIT, display: "inline-block" },
            { name: BUTTON_NAME_CANCEL, display: "none" },
            { name: BUTTON_NAME_UPDATE, display: "none" }
        ]);
}

function SerializeForm(form) {
    if (!form || form.nodeName !== "FORM") {
        return;
    }
    var i, j, obj = {};
    for (i = form.elements.length - 1; i >= 0; i = i - 1) {
        if (form.elements[i].name === "") {
            continue;
        }
        switch (form.elements[i].nodeName) {
            case 'INPUT':
                switch (form.elements[i].type) {
                    case 'text':
                    case 'hidden':
                    case 'password':
                    case 'button':
                    case 'reset':
                    case 'submit':
                        //obj[form.elements[i].name] = encodeURIComponent(form.elements[i].value);
                        obj[form.elements[i].name] = form.elements[i].value;
                        break;
                    case 'checkbox':
                    case 'radio':
                        if (form.elements[i].checked) {
                            obj[form.elements[i].name] = form.elements[i].value;
                        }
                        break;
                }
                break;
            case 'file':
                break;
            case 'TEXTAREA':
                obj[form.elements[i].name] = form.elements[i].value;
                break;
            case 'SELECT':
                switch (form.elements[i].type) {
                    case 'select-one':
                        obj[form.elements[i].name] = form.elements[i].value;
                        break;
                    case 'select-multiple':
                        for (j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
                            if (form.elements[i].options[j].selected) {
                                obj[form.elements[i].name] = form.elements[i].value;
                            }
                        }
                        break;
                }
                break;
            case 'BUTTON':
                switch (form.elements[i].type) {
                    case 'reset':
                    case 'submit':
                    case 'button':
                        obj[form.elements[i].name] = form.elements[i].value;
                        break;
                }
                break;
        }
    }
    return obj;
}

function CreateElement(elementName, text, type) {
    // Create a <button> element
    let element = document.createElement(elementName);
    // Create a text node
    const t = document.createTextNode(text);
    // Append the text to <Element>
    element.appendChild(t);
    
    if ( type ) {
        element.setAttribute("type", type);
    }

    return element;
}
/**
 * TODO:  Watching this function 3/5/2019 9:57 PM
 */
function FillList() {
    let listElement = arguments[0],
        arrText = arguments[1];

    listElement.innerHTML = "";

    // Create array wrapper array text: [[a, b, c...] [a, b, c...] ...]
    for (let index = 2; index < arguments.length; index++) {
        const arrName = arguments[index];

        // wrapperArrText.push(arrName);
        for (let i = 0; i < arrText.length; i++) {
            arrText[i] += ` - ${arrName[i].trim()}`;
        }
    }

    // Append row to list
    for (let i = 0; i < arrText.length; i++) {
        let text = arrText[i];

        if (!text) continue;
        const li = CreateElement("LI", text, null);
        listElement.appendChild(li);
    }
}

function FetchData(data, listElement, model, frm, url) {
    // Clear data
    listElement.innerHTML = "";

    for (let i = 0; i < data.length; i++) {
        const record = data[i];
        const li = CreateElement("LI", "", null);

        for (let j = 0; j < model.length; j++) {
            const name = model[j] === "_id" ? "id" : model[j];
            const key = name === "id" ? name : `data-${name}`;
            const value = record[name] instanceof Array ? record[name].join(",") : record[name === "id" ? "_id" : name];

            li.setAttribute(key, value);
        }

        const check = CreateElement("input", "", "checkbox");

        const span = CreateElement("SPAN", `${record.name} - ${record.mean || record.description}`, null);

        let copy = CreateElement("I", "copy", null);
        copy.setAttribute("class", "copy");
        copy.addEventListener("click", copyToClipboard.bind(null, record._id), false);
        // copy.onclick = copyToClipboard(record._id);

        let update = CreateElement("I", "update", null);
        update.setAttribute("class", "update");
        const arrModel = model.filter(d => d !== "_id");
        update.addEventListener("click", FormUpdate.bind(null, record._id, frm, arrModel), false);
        // update.onclick = FormUpdate(record._id, FORM_WORD, arrModel);

        let delte = CreateElement("I", "delete", null);
        delte.setAttribute("class", "delete");
        delte.addEventListener("click", Delete.bind(null, record._id, url, "Do you want delete this record?"), false);
        // delte.onclick = Delete(record._id, '/word', "Do you want delete this word?");

        // checkbox for li
        li.appendChild(check);

        // text for li in span
        li.appendChild(span);

        // Add copy function in record
        li.appendChild(copy);

        // Add delete function in record
        li.appendChild(update);

        // Add delete function in record
        li.appendChild(delte);


        // Add record to list
        listElement.appendChild(li);
    }
}

function SearchDataTable(query, dataTable) {
    if (!dataTable) return false;

    query = query.toLowerCase();
    const items = dataTable.childNodes;

    for (let i = 0; i < items.length; i++) {
        let item = items[i];

        if (item.innerText.indexOf(query) < 0) {
            item.style.display = "none";
        } else {
            item.style.display = "list-item";
        }
    }
}

async function GetWord() {
    const response = await fetch("/word", {
        method: "GET",
    });
    const data = await response.json();
    return data;
}

async function GetGroup() {
    const response = await fetch("/group", {
        method: "GET",
    });
    const data = await response.json();
    return data;
}

async function Init() {
    const words = await GetWord();

    if (!words) {
        FetchData(MOCK_DATA, DATA_TABLE_WORD, ["_id", "name", "mean", "groups"], FORM_WORD, "/word");
    } else {
        FetchData(words, DATA_TABLE_WORD, ["_id", "name", "mean", "groups"], FORM_WORD, "/word");
    }

    const groups = await GetGroup();

    if (!groups) {
        FetchData(MOCK_DATA, DATA_TABLE_GROUP, ["_id", "name", "description", "words"], FORM_GROUP, "/group");
    } else {
        FetchData(groups, DATA_TABLE_GROUP, ["_id", "name", "description", "words"], FORM_GROUP, "/group");
    }
}

function HandleError(errors) {
    let resultError = [];
    const regex = /\w+(?=")/g;
    for (let i = 0; i < errors.length; i++) {
        const err = errors[i];
        const field = regex.exec(err)[0];
        if (!field) continue;

        resultError.push(field);
    }
    return resultError;
}

// function Event_KeyUp(g_changeIntervalKeyup, method) {
//     const value = this.value;
//     clearInterval(g_changeIntervalKeyup);
//     g_changeIntervalKeyup = setInterval(function () {
//         method();
//         clearInterval(g_changeIntervalKeyup);
//     }, 1000);
// } 

async function Submit() {
    let request = SerializeForm(this);

    for (let key in request) {
        request[key] = request[key] || "";
    }

    const url = this.action;
    const method = "POST";

    const response = await fetch(url, {
        method: method,
        body: JSON.stringify(request),
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    });

    const data =  await response.json();
    return data;
}

(function () {

   
    /*
    * Init function 
    */
    Init();


    /**
     * WORD SECTION
     */
    document.getElementById("frm-word").addEventListener("submit", async function (e) {
        e.preventDefault();
        
        const submitfnc = Submit.bind(this);
        const data = await submitfnc();
    
        const error = HandleError(data.error);
        if (error.length > 0) {            
            const rsConfirm = confirm(`Some element name can't insert: ${error.join(", ")}`);
            
            if ( rsConfirm ) {
                Cancel(this);
            }            
        } else {
            Cancel(this);
        }

        if (data.saved.length > 0) {
            const dataWords = await GetWord();
            FetchData(dataWords, DATA_TABLE_WORD, ["_id", "name", "mean", "groups"]);
        }
    }, false);

    FORM_WORD[BUTTON_NAME_UPDATE].addEventListener("click", async function (e) {
        await Update(SerializeForm(FORM_WORD), "/word");
    });

    FORM_WORD[BUTTON_NAME_CANCEL].addEventListener("click", function (e) {
        const form = FORM_WORD;
        Cancel(form);
    });

    //Run fill list after 1s keyup text input   
    document.getElementById("textname").addEventListener("keyup", function () {
        const name = this.value.split(",").map(d => d.trim());
        const mean = document.getElementById("textmean").value.split(",").map(d => d.trim());
    
        FillList(LIST_ELEMENT_WORD, name, mean);
    }, false);

    document.getElementById("textname").addEventListener("paste", function () {
        const name = this.value.split(",").map(d => d.trim());
        const mean = document.getElementById("textmean").value.split(",").map(d => d.trim());
    
        FillList(LIST_ELEMENT_WORD, name, mean);
    }, false);
 

    document.getElementById("textmean").addEventListener("keyup", function () {
        const mean = this.value.split(",").map(d => d.trim());
        const name = document.getElementById("textname").value.split(",").map(d => d.trim());

        FillList(LIST_ELEMENT_WORD, name, mean);
    }, false);

    document.getElementById("textmean").addEventListener("paste", function () {
        const mean = this.value.split(",").map(d => d.trim());
        const name = document.getElementById("textname").value.split(",").map(d => d.trim());

        FillList(LIST_ELEMENT_WORD, name, mean);
    }, false);

    //search-box-word

    SEARCH_WORD.addEventListener("change", function () {
        const value = this.value;
        SearchDataTable(value, document.getElementById("dataTableWord"));
    });

    SEARCH_WORD.addEventListener("keyup", function () {
        SearchDataTable(this.value, DATA_TABLE_WORD);
    }, false);

    /**
     * GROUP SECTION
     */
    FORM_GROUP.addEventListener("submit", async function (e) {
        e.preventDefault();

        const submitfnc = Submit.bind(this);
        const data = await submitfnc();

        const error = HandleError(data.error);
        if (error.length > 0) {
            const rsConfirm = confirm(`Some element name can't insert: ${error.join(", ")}`);
            
            if ( rsConfirm ) {
                Cancel(this);
            }            
        } else {
            Cancel(this);
        }
        if (data.saved.length > 0) {
            const dataGroups = await GetGroup();
            FetchData(dataGroups, DATA_TABLE_GROUP, ["_id", "name", "description", "words"]);
        }
    }, false);

    FORM_GROUP[BUTTON_NAME_UPDATE].addEventListener("click", async function (e) {
        await Update(SerializeForm(FORM_GROUP), "/group");
    });

    FORM_GROUP[BUTTON_NAME_CANCEL].addEventListener("click", function (e) {
        const form = FORM_GROUP;
        Cancel(form);
    });


    //Run fill list after 1s keyup text input

    document.getElementById("textgroupname").addEventListener("keyup", function () {
        const name = this.value.split(",").map(d => d.trim());
        const description = document.getElementById("textgroupdescription").value.split(",").map(d => d.trim());

        FillList(LIST_ELEMENT_GROUP, name, description);
    }, false);

    document.getElementById("textgroupdescription").addEventListener("keyup", function () {
        const description = this.value.split(",").map(d => d.trim());
        const name = document.getElementById("textgroupname").value.split(",").map(d => d.trim());

        FillList(LIST_ELEMENT_GROUP, name, description);
    }, false);

    //search-box-word

    SEARCH_GROUP.addEventListener("change", function () {
        const value = this.value;
        SearchDataTable(value, DATA_TABLE_GROUP);
    });

    SEARCH_GROUP.addEventListener("keyup", function () {
        SearchDataTable(this.value, DATA_TABLE_GROUP);
    }, false);

    for (let i = 0; i < CHECK_ALL.length; i++) {
        const element = CHECK_ALL[i];
        element.addEventListener("click", function () {
            const parent = this.parentNode;
            
            const checkboxes = parent.querySelectorAll("input[type=checkbox]");

            for (let j = 0; j < checkboxes.length; j++) {
                const checkbox = checkboxes[j];
                const checked = checkbox.getAttribute("checked");
                if ( checked ) {
                    checkbox.removeAttribute("checked");
                } else {
                    checkbox.setAttribute("checked", "checked");
                }
            }
        });
    }


    for (let i = 0; i < DELETE_ALL.length; i++) {
        const element = DELETE_ALL[i];
        element.addEventListener("click", function () {
            const parent = this.parentNode;            
            const checkboxes = parent.querySelectorAll("input[type=checkbox]");
            const url = this.getAttribute("data-url");

            for (let j = 0; j < checkboxes.length; j++) {
                const checkbox = checkboxes[j];
                const checked = checkbox.getAttribute("checked");
                if ( checked ) {
                    const li = checkbox.parentNode;
                    const id = li.getAttribute("id");                            

                    Delete(id, url, "");
                }
            }
        });
    }

    
})();

