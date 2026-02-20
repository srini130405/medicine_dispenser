
# Doctor UI Project

This repository contains:

* Frontend – React.js
* Backend – Node.js / Express

Follow the steps below to set up and run the project locally.


## 1. Prerequisites

### Install Visual Studio Code

Download and install from:
[https://code.visualstudio.com/](https://code.visualstudio.com/)

---

### Install Node.js (Includes npm)

Download the **LTS version** from:
[https://nodejs.org/](https://nodejs.org/)

After installation, verify:

```bash
node -v
npm -v
```

Both commands should return version numbers.

---

## 2. Clone the Repository

```bash
git clone <your-repository-url>
cd doctor-ui
```

Replace `<your-repository-url>` with your actual GitHub repository link.

---

## 3. Install Dependencies

### Install Frontend Dependencies (from root folder)

```bash
npm install
```

### Install Backend Dependencies

```bash
cd backend
npm install
```

---

## 4. Run the Application

### Start Frontend (from root folder)

```bash
npm start
```

### Start Backend

```bash
cd backend
npm start
```

If your backend uses nodemon:

```bash
npm run dev
```

---

## Project Structure

```
doctor-ui/
 ├── public/
 ├── src/
 ├── package.json
 ├── backend/
 │    ├── package.json
 │    └── ...
```

---

## Troubleshooting

If dependency installation fails:

### Frontend

```bash
rm -rf node_modules package-lock.json
npm install
```

### Backend

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

---

Anyone can now clone the repository, install dependencies, and run both frontend and backend locally.
