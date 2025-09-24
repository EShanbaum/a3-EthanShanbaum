// FRONT-END (CLIENT) JAVASCRIPT HERE

const urgencyToClass = new Map();
urgencyToClass.set("Overdue", "dark");
urgencyToClass.set("DO IT NOW", "danger");
urgencyToClass.set("High", "danger");
urgencyToClass.set("Medium", "warning");
urgencyToClass.set("Low", "success");

const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()

  /*
  
  const input = document.querySelector( "#yourname" ),
        json = { yourname: input.value },
        body = JSON.stringify( json )

  */

  const body = JSON.stringify({
    title: document.querySelector("#title").value,
    description: document.querySelector("#description").value,
    date: document.querySelector("#date").value,
  })

  const response = await fetch( "/submit", {
    method:"POST",
    headers: { 'Content-Type': 'application/json' },
    body: body,
  })

  const text = await response.text()
  document.querySelectorAll("input").forEach((element) => {
    element.value = "";
  })

  document.querySelector("textarea").value = ""

  console.log( "text:", text )
  updateTable();
}

const updateTable = async function(){
  const response = await fetch ("/data", {
    method: "GET",
  })

  const text = await response.text();
  const parsedData = JSON.parse(text);
  let tableHTML = '';
  parsedData.forEach(element => {
    tableHTML += `
      <tr id='table-row-${element._id}'>
        <th class='todo-title' scope='row'>${element.title}</th>
        <td class='todo-desc'>${element.description}</td>
        <td class='todo-date'>${element.date}</td>
        <td><span class="badge text-bg-${urgencyToClass.get(element.urgency)}">${element.urgency}</span></td>
        <td>
            <button class="btn btn-danger" onclick="deleteByID('${element._id}')">Delete</button>
            <button class="btn btn-info" onclick="createUpdateForm('${element._id}')">Update</button>
        </td>
      </tr>
    `
  });

  document.querySelector("tbody").innerHTML = tableHTML;
}

const deleteByID = async function(delID){
  const body = JSON.stringify({_id: delID})
  const response = await fetch( `/data`, {
    method:"DELETE",
    headers: { 'Content-Type': 'application/json' },
    body: body
  }).then(updateTable)

}

const createUpdateForm = async function(todoID){
    const currRow = document.querySelector(`#table-row-${todoID}`)
    document.querySelector("#update-section").innerHTML = `
    <h4>Update TODO Item</h4>
    <form>
        <p>
            <label class="form-label" for="update-title">Title</label>
            <input type="text" class="form-control" id="update-title" value="${currRow.querySelector(".todo-title").textContent}"/>
        </p>
        <p>
            <label class="form-label" for="update-description">Description</label>
            <textarea class="form-control" id="update-description" value="${currRow.querySelector(".todo-desc").textContent}">${currRow.querySelector(".todo-desc").textContent}</textarea>
        </p>
        <p>
            <label class="form-label" for="">Due Date</label>
            <input type="date" class="form-control" id="update-date" value="${currRow.querySelector(".todo-date").textContent}""/>
        </p>
        <button id="update-button" class="btn btn-primary" onclick="updateByID(event, '${todoID}')">Submit</button>
    </form>
    `
}

const updateByID = async function(event, updateID){
    event.preventDefault()
    const body = {
        _id: updateID,
        title: document.querySelector("#update-title").value,
        description: document.querySelector("#update-description").value,
        date: document.querySelector("#update-date").value
    }

    const response = await fetch("/update", {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(updateTable)
}


window.onload = function() {
  const button = document.querySelector("#submit-button");
  button.onclick = submit;
  updateTable();
}

