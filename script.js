const employeesURL = 'https://randomuser.me/api/?results=12';
const searchContainer = document.querySelector('.search-container');
const gallery = document.querySelector('#gallery');
const headerTxtContainer = document.querySelector('.header-text-container h1');

// Variables for the "No employees found!" message.
let noEmployeesFoundMessage;
let noEmployeesFoundMessageDisplayed = false;

// Creates the markup for the searchbar and appends it to the search container.
const searchBar = document.createElement('form');
searchBar.innerHTML = `
  <form action="#" method="get">
  <input type="search" id="search-input" class="search-input" placeholder="Search...">
  <input type="submit" value="&#x1F50D;" id="serach-submit" class="search-submit">
  </form>
`;

searchContainer.appendChild(searchBar);

/**
 * Hides or displays employees.
 * @param searchInput - Input typed by the user in the searchbar.
 */
function hideOrDisplayEmployees(searchInput) {
	const employeeList = gallery.children;

	let hiddenEmployees = 0;

	let foundEmployees = 0;

	let errorDiv = document.createElement('P');
	errorDiv.id = 'no-employee-found';

	for (let i = 0; i < employeeList.length; i++) {
		const item = employeeList[i];
		const name = item.querySelector('#name');

		if (name.textContent.includes(searchInput)) {
			item.style.display = '';
			foundEmployees += 1;
		} else {
			item.style.display = 'none';
			hiddenEmployees += 1;
		}
	}

	if (hiddenEmployees === 12 && foundEmployees === 0) {
		if (!noEmployeesFoundMessageDisplayed) {
			let html = `No employees found!`;
			errorDiv.innerHTML = html;
			gallery.insertAdjacentElement('afterend', errorDiv);
			noEmployeesFoundMessageDisplayed = true;
		}
	} else if (foundEmployees >= 1) {
		if (noEmployeesFoundMessageDisplayed) {
			noEmployeesFoundMessage = document.getElementById('no-employee-found');
			document.body.removeChild(noEmployeesFoundMessage);
			noEmployeesFoundMessageDisplayed = false;
		}
	}
}

/**
 * Converts the employee birthday dateinput to a format which is easier to read and understand.
 * @param date
 */
function reformatBirthday(date) {
	let month = date.substring(5, 7);
	let day = date.substring(8, 10);
	let year = date.substring(2, 4);
	let newDate = month + '/' + day + '/' + year;
	return newDate; // Example output: 14/09/86
}

/**
 * Handles the API request and converts the string to JSON.
 * @param url - Takes an API resource as a parameter.
 */
async function getJSON(url) {
	try {
		const response = await fetch(url);
		return await response.json();
	} catch (error) {
		throw error;
	}
}

/**
 * Constructs variables containing employee data.
 * @param url - Takes JSON data as a parameter.
 */
async function getEmployees(url) {
	const peopleJSON = await getJSON(url);

	const profiles = peopleJSON.results.map(async (person) => {
		const name = `${person.name.first} ${person.name.last}`;
		const email = person.email;
		const location = `${person.location.city}, ${person.location.state}`;
		const address = `${person.location.street.name} ${person.location.street.number}, ${person.location.city}, ${person.location.state} ${person.location.postcode}`;
		const large = person.picture.large;
		const phoneNumber = person.phone;
		const birthday = person.dob.date;
		return { name, email, location, address, large, phoneNumber, birthday };
	});

	return Promise.all(profiles);
}

/**
 * Creates the gallery HTML containing all employees with data for each employee.
 * @param data - Takes employee data as a parameter
 */
function galleryHTML(data) {
	data.map((person) => {
		const cardDiv = document.createElement('div');
		gallery.appendChild(cardDiv);
		cardDiv.className = 'card';
		cardDiv.innerHTML = `
    <div class="card-img-container">
      <img class="card-img" src="${person.large}" alt="profile picture">
    </div>
    <div class="card-info-container">
      <h3 id="name" class="card-name cap">${person.name}</h3>
      <p class="card-text">${person.email}</p>
      <p class="card-text cap">${person.location}</p>
    </div>
    `;

		// Listens for clicks on an employee card and opens a modal with further information about the employee.
		cardDiv.addEventListener('click', () => {
			const modalDiv = document.createElement('modal');
			gallery.insertAdjacentElement('afterend', modalDiv);
			modalDiv.className = 'modal-container';
			modalDiv.innerHTML = `
      <div class="modal">
        <button type="button" id="modal-close-btn" class="modal-close-btn"><strong>X</strong></button>
        <div class="modal-info-container">
          <img class="modal-img" src="${person.large}" alt="profile picture">
          <h3 id="name" class="modal-name cap">${person.name}</h3>
          <p class="modal-text">${person.email}</p>
          <p class="modal-text cap">${person.location}</p>
          <hr>
          <p class="modal-text">Phone: ${person.phoneNumber}</p>
          <p class="modal-text">Address: ${person.address}</p>
          <p class="modal-text">Birthday: ${reformatBirthday(
						person.birthday
					)}</p>
        </div>
      `;

			const modalCloseBtn = document.querySelector('.modal-close-btn');

			// Listens for click on the close button on the modal window.
			modalCloseBtn.addEventListener('click', () => {
				document.querySelector('.modal-container').style.display = 'none';
			});
		});
	});
}

/**
 * Executes the program.
 */
getEmployees(employeesURL)
	.then(galleryHTML)
	.catch((e) => {
		headerTxtContainer.textContent = 'Something went wrong!';
		console.error(e);
	});

// Listens for a search submit and displays the relevant employees.
document.getElementById('serach-submit').addEventListener('click', (e) => {
	e.preventDefault();
	let userInput = document.getElementById('search-input').value;
	hideOrDisplayEmployees(userInput);
});

// Listens for letters typed in the search bar and displays the relevant employees.
document.getElementById('search-input').addEventListener('keyup', () => {
	let userInput = document.getElementById('search-input').value;
	hideOrDisplayEmployees(userInput);
});
