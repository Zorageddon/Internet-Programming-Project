### Initial Launch Instructions
To launch the program, open a terminal, navigate to the program folder, and run _npm install_. Once the required modules are installed run
_npm run start_. Open a web browser and navigate to the url _http://localhost:4131/_, this will take you to the sign in page for the program.
Database Credentials: (username: C4131S25S02U61, password: anorak)

### Sign in/Sign up
Current users: (username: a, password: a), (username: b, password: b)
To sign up a new user simply select the _Sign Up_ radio option and enter the desired username and password, if successful the page will
reload and you will be prompted to sign in.

### Using the App/Implemented Features
The app will display the current user's tasks, in the order they were added. If you wish to filter by status or deadline simply select the
desired filter from the relevant drop down. If you wish to change the status of a task click the _cycle_ button under the task status. This will cycle the
task through 3 statuses, _Todo_, _In Progress_, and _Done_, and any status changes will be reflected in the mysql database. The _Delete_ button at the far right of each
task entry allows you to delete tasks. The _Add Task_ button in the top left will take you to a form that allows a new task to be added. Finally, in the top right of the page,
the _Logout_ button will destroy the current user session and the _Delete Account_ button will delete the user account and all associated tasks from the mysql database.<br><br>
Two advanced features were implemented, deadlines and pug templating. The app has no static html, every page is rendered server-side by pug before being sent
to the client. Deadlines can be set when adding a task and the _Todo_ page allows a user to filter by overdue tasks, as well as in ascending and descending deadline order.
All inputs are also sanitized using _express-sanitizer_

### Current URLs
_http://localhost:4131/_ and _http://localhost:4131/todo_ both lead to the Todo list page. _http://localhost:4131/auth_ leads to the login page. _http://localhost:4131/addForm_ leads to the add task form.<br><br>
Attempting to navigate to any URL besides _/auth_ while not logged in will lead to a redirect to _/auth_. All other routes within the express server perform some backend function before
eventually redirecting to _/todo_, _/auth_, or _/addForm_.