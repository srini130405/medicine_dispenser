import logo from './logo.svg';
import './App.css';
import Login from "./Login";
import Dashboard from "./Dashboard";
import RegisterPatient from "./RegisterPatient";
import Prescription from "./Prescription";

function App() {
  if (!localStorage.token) return <Login />;

  const path = window.location.pathname;
  if (path === "/register") return <RegisterPatient />;
  if (path === "/prescription") return <Prescription />;

  return <Dashboard />;
}


export default App;
