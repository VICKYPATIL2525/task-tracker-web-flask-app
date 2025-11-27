# College Todo App

A simple and intuitive web-based todo application built with Flask. Organize your tasks using the Eisenhower Matrix (Important/Urgent prioritization) with user authentication and Excel export capabilities.

## Features

- **User Authentication**: Secure login and signup system with password hashing
- **Priority-Based Task Management**: Organize tasks using the Eisenhower Matrix
  - Important & Urgent (Critical)
  - Not Important & Urgent
  - Important & Not Urgent
  - Not Important & Not Urgent
- **Task Operations**:
  - Create new tasks with deadlines
  - Mark tasks as completed/pending
  - Delete tasks
  - Track creation and completion timestamps
- **Excel Export**: Export your tasks to Excel (.xlsx) format
  - Export all tasks
  - Export only pending tasks
  - Export only completed tasks
  - Color-coded priority levels
- **Responsive UI**: Clean and modern interface
- **User Isolation**: Each user only sees their own tasks

## Technologies Used

- **Backend**: Flask (Python)
- **Database**: SQLite3
- **Frontend**: HTML, CSS, JavaScript
- **Excel Export**: openpyxl
- **Authentication**: Werkzeug (password hashing)

## Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.7 or higher
- pip (Python package installer)

## Installation & Setup

Follow these steps to set up the project after cloning:

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd college-todo-app
```

### 2. Create a Virtual Environment

**Windows (PowerShell):**
```powershell
python -m venv myenv
myenv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
python -m venv myenv
myenv\Scripts\activate.bat
```

**macOS/Linux:**
```bash
python3 -m venv myenv
source myenv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Application

```bash
python app.py
```

The application will start on `http://127.0.0.1:5000/`

### 5. Access the Application

Open your web browser and navigate to:
```
http://127.0.0.1:5000/
```

## Usage

### First Time Setup

The application comes with dummy data for testing purposes. You can login with:

**Test Accounts:**
- Username: `vicky` | Password: `password123`
- Username: `admin` | Password: `password123`
- Username: `testuser` | Password: `password123`

Alternatively, create your own account using the signup page.

### Managing Tasks

1. **Add a Task**:
   - Enter task description in the input field
   - Select priority level (Important/Urgent checkboxes)
   - Optionally set a deadline
   - Click "Add Task"

2. **Complete a Task**:
   - Click the toggle button in the task row to mark as completed

3. **Delete a Task**:
   - Click the delete button to remove a task permanently

4. **Export Tasks**:
   - Use the export buttons to download your tasks as Excel files
   - Choose between All, Pending, or Completed tasks

## Project Structure

```
college-todo-app/
│
├── app.py                  # Main Flask application
├── requirements.txt        # Python dependencies
├── todo_app.db            # SQLite database (auto-created)
│
├── templates/             # HTML templates
│   ├── index.html         # Main todo interface
│   ├── login.html         # Login page
│   └── signup.html        # Signup page
│
└── static/                # Static files (CSS, JS, images)
    ├── css/
    ├── js/
    └── images/
```

## Configuration

### Change Secret Key (Important for Production)

Before deploying to production, change the secret key in `app.py`:

```python
app.secret_key = 'your-secret-key-here-change-in-production'
```

Generate a secure secret key using:
```python
import secrets
print(secrets.token_hex(32))
```

### Database

The application uses SQLite and automatically creates the database file (`todo_app.db`) on first run. To reset the database, simply delete the `todo_app.db` file and restart the application.

## API Endpoints

- `GET /` - Main todo interface (requires authentication)
- `GET /login` - Login page
- `POST /login` - Login authentication
- `GET /signup` - Signup page
- `POST /signup` - Create new account
- `GET /logout` - Logout current user
- `GET /api/tasks` - Get all tasks for current user
- `POST /api/tasks` - Create new task
- `POST /api/tasks/<id>/toggle` - Toggle task completion
- `DELETE /api/tasks/<id>` - Delete task
- `GET /export/<type>` - Export tasks (type: all/pending/done)

## Troubleshooting

### Virtual Environment Issues

If you have trouble activating the virtual environment:
- On Windows, you may need to enable script execution:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

### Port Already in Use

If port 5000 is already in use, modify the port in `app.py`:
```python
app.run(debug=True, port=5001)  # Change to any available port
```

### Database Locked Error

If you encounter database locked errors, ensure:
- Only one instance of the app is running
- Close any database browser tools accessing `todo_app.db`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available for educational purposes.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Made with Flask and Python
