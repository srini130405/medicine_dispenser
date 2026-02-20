# Doctor UI Project

This project contains:

- Frontend (React.js)
- Backend (Node.js / Express)

To run this project locally, follow the setup instructions below.

---

## 1. Prerequisites

You must install the following software:

### 1. Visual Studio Code (Code Editor)

Download from:
https://code.visualstudio.com/

Install it according to your operating system.

---

### 2. Node.js and npm

npm comes bundled with Node.js.

Download Node.js (LTS version recommended):
https://nodejs.org/

After installation, verify:

node -v
npm -v

Both commands should return version numbers.

---

## 2. Project Setup

### Step 1: Clone the Repository

git clone <your-repository-url>
cd doctor-ui

---

### Step 2: Install Frontend Dependencies

From the root folder:

npm install

---

### Step 3: Install Backend Dependencies

cd backend
npm install

---

## 3. Running the Project

### Run Frontend

From root folder:

npm start

---

### Run Backend

cd backend
npm start

(or use: npm run dev if configured)

---

## Notes

- Ensure no other process is using the frontend or backend ports.
- If you encounter dependency issues, delete node_modules and package-lock.json and reinstall.

---

Project Structure:

doctor-ui/
 ├── public/
 ├── src/
 ├── package.json
 ├── backend/
 │    ├── package.json
 │    └── ...
