const MOCK_DATA = [];
let WORD_ID = "";

function copyToClipboard(secretInfo) {
    const body = document.getElementsByTagName("body")[0]
    let tempInput = document.createElement('INPUT');

    body.appendChild(tempInput);

    tempInput.setAttribute('value', secretInfo)
    tempInput.select();
    document.execCommand('copy');

    body.removeChild(tempInput);
}

function RemoveElement(id) {
    var elem = document.getElementById(id);
    return elem.parentNode.removeChild(elem);
}

function UpdateElement(data) {
    var li = document.getElementById(data._id);

    li.setAttribute("data-name", data.name);
    li.setAttribute("data-mean", data.mean);
    li.setAttribute("data-groups", data.groups.join(","));
    
    li.childNodes[1].innerText = `${data.name} - ${data.mean}`; // textContent or innerText
}

async function Update(request, url) {
    try {
        const response = await fetch(url, {
            method: "PUT",
            body: JSON.stringify(request),
            headers:{
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

async function Delete(id, url) {
    const result = confirm("Do you delete this word?");
    if(!result) return;

    try {
        const response = await fetch(url, {
            method: "DELETE",
            body: JSON.stringify({_id: id}),
            headers:{
                'Content-Type': 'application/json'
              }
        });
        const data = await response.json();
        
        if (data.error.length > 0) {
            alert(data.error[0]);
        } else {            
            RemoveElement(id);
        }

    } catch (error) {
        alert(error);
    }

}

function FormUpdate(id) {
    let wordElement = document.getElementById(id);

    const name = wordElement.getAttribute("data-name");
    const mean = wordElement.getAttribute("data-mean");
    const groups = wordElement.getAttribute("data-groups");

    document.getElementById("textid").value = id;
    document.getElementById("textname").value = name;
    document.getElementById("textmean").value = mean || "";
    document.getElementById("textgroups").value = groups || "";

    document.getElementById("button-submit-word").style.display = "none";
    document.getElementById("button-update-word").style.display = "inline-block";
    document.getElementById("button-cancel-word").style.display = "inline-block";
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
        || form.elements[i].nodeName === "file"){
            continue;
        }
        
        form.elements[i].value = "";
    }

    document.getElementById("button-submit-word").style.display = "inline-block";
    document.getElementById("button-update-word").style.display = "none";
    document.getElementById("button-cancel-word").style.display = "none";
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

function CreateElement(elementName, text) {
    // Create a <button> element
    let element = document.createElement(elementName);
    // Create a text node
    const t = document.createTextNode(text);
    element.appendChild(t);
    // Append the text to <Element>
    return element;
}

function FillList(strData, listElement) {
    const arrName = strData.split(",");
    listElement.innerHTML = "";

    const arrMean = QueryMeanWord();
    for (let i = 0; i < arrName.length; i++) {
        const text = arrName[i];
        const mean = arrMean[i] || "";
        if (!text) continue;
        const li = CreateElement("LI", `${text.trim()} - ${mean}`);
        listElement.appendChild(li);
    }
}

function QueryMeanWord() {
    let result = [];
    const arrMean = document.getElementById("textmean").value.split(",");
    if (!arrMean) return result;

    return arrMean.map(d => d.trim());
}

function FetchData(data, listElement) {
    // Clear data
    listElement.innerHTML = "";

    for (let i = 0; i < data.length; i++) {
        const record = data[i];
        const li = CreateElement("LI", "");

        li.setAttribute("id", record._id);
        li.setAttribute("data-name",record.name);
        li.setAttribute("data-mean",record.mean);
        li.setAttribute("data-groups",record.groups.join(","));

        const span = CreateElement("SPAN", `${record.name} - ${record.mean}`);

        let copy = CreateElement("I", "copy");
        copy.setAttribute("class", "copy");
        copy.setAttribute("onclick", `copyToClipboard('${record._id}')`);

        let update = CreateElement("I", "update");
        update.setAttribute("class", "update");
        update.setAttribute("onclick", `FormUpdate('${record._id}')`);

        let delte = CreateElement("I", "delete");
        delte.setAttribute("class", "delete");
        delte.setAttribute("onclick", `Delete('${record._id}', '/word')`);


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

async function Init() {
    const data = await GetWord();
    if (!data) {
        FetchData(MOCK_DATA, document.getElementById("dataTableWord"));
    } else {
        FetchData(data, document.getElementById("dataTableWord"));
    }   
}

function HandleError(errors) {
    let resultError = [];
    const regex = /\w+(?=")/g;
    for (let i = 0; i < errors.length; i++) {
        const err = errors[i];
        const field = regex.exec(err)[0];
        if(!field) continue;

        resultError.push(field);        
    }
    return resultError;
}

(function () {

    const LIST_ELEMENT = document.getElementById("list-word");
    /*
    * Init function 
    */
    Init();

    // document.getElementById("submitFrm").addEventListener("click", function () {
    //     const li = CreateElement("LI", "test create element");
    //     LIST_ELEMENT.appendChild(li);
    // });

    document.getElementById("frm-word").addEventListener("submit", async function (e) {
        e.preventDefault();

        let request = SerializeForm(this);

        request.mean = request.mean || "";
        
        const url = this.action;
        const method = "POST";

        const response = await fetch(url, {
         method: method,
         body: JSON.stringify(request),
         headers: new Headers({
            'Content-Type': 'application/json'
         })
        });

        const data = await response.json();
        const error = HandleError(data.error);
        //const error = data.error;
        if (error.length > 0) {
            alert(`Some words can't insert: ${error.join(", ")}`)
        }
        if (data.saved.length > 0) {
            const dataWords = await GetWord();
            FetchData(dataWords, document.getElementById("dataTableWord"));
        }
    }, false);

    document.getElementById("button-update-word").addEventListener("click", async function (e) {
        await Update(SerializeForm(document.getElementById("frm-word")), "/word");  
    });    

    document.getElementById("button-cancel-word").addEventListener("click", function (e) {
        Cancel(document.getElementById("frm-word"));
   });    


    // Run fill list after 1s keyup text input
    let _changeIntervalKeyup = null;
    document.getElementById("textname").addEventListener("keyup", function () {
        const value = this.value;
        clearInterval(_changeIntervalKeyup);
        _changeIntervalKeyup = setInterval(function () {
            FillList(value, LIST_ELEMENT);
            clearInterval(_changeIntervalKeyup);
        }, 1000);
    });

    let _changeIntervalKeyupMean = null;
    document.getElementById("textmean").addEventListener("keyup", function () {
        const value = document.getElementById("textname").value;
        clearInterval(_changeIntervalKeyupMean);
        _changeIntervalKeyupMean = setInterval(function () {
            FillList(value, LIST_ELEMENT);
            clearInterval(_changeIntervalKeyupMean);
        }, 1000);
    });

    //search-box-word

    document.getElementById("search-box-word").addEventListener("change", function () {
        const value = this.value;
        SearchDataTable(value, document.getElementById("dataTableWord"));
    });

    let _changeIntervalKeyupSearchBoxWord = null;
    document.getElementById("search-box-word").addEventListener("keyup", function () {
        const value = this.value;
        clearInterval(_changeIntervalKeyupSearchBoxWord);
        _changeIntervalKeyupSearchBoxWord = setInterval(function () {
            SearchDataTable(value, document.getElementById("dataTableWord"));
            clearInterval(_changeIntervalKeyupSearchBoxWord);
        }, 1000);
    });
})();