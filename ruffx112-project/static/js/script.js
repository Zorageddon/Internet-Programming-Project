const crlf = "\r\n";

async function addTask() {
	await fetch('http://localhost:4131/addForm')
		.then(res => {
			if (res.ok) {
				location.assign(res.url);
			} else {
				console.err('redirect failed');
			}
		});
}

async function deleteTask(id) {
	await fetch(`http://localhost:4131/delete/${id}`)
		.then(async function (res) {
			if (res.ok) {
				await filter();
			} else {
				console.err('failed redirect');
			}
		});
}

async function cycle(id) {
	await fetch(`http://localhost:4131/cycle/${id}`)
		.then(async function (res) {
			if (res.ok) {
				await filter()
			} else {
				console.err('failed cycle')
			}
		});
}

async function filter() {
	const statusDeadline = getStatusDeadline();
	
	await fetch(`http://localhost:4131/filter/${statusDeadline[0]}/${statusDeadline[1]}`)
		.then(async function (res) {
			if (res.ok) {
				const html = await res.text();
				document.getElementById('container').innerHTML = html;
			} else {
				console.err('failed filter');
			}
		});
}

function getStatusDeadline() {
	const status = document.getElementById('statusFilter');
	const deadline = document.getElementById('deadlineFilter');
	let statusVal = '';
	let deadlineVal = '';
	
	for (let i=0; i<status.length; i++) {
		if (status[i].selected == true) {
			statusVal = status[i].value;
		}
	}
	for (let i=0; i<deadline.length; i++) {
		if (deadline[i].selected == true) {
			deadlineVal = deadline[i].value;
		}
	}

	return [statusVal, deadlineVal];
}