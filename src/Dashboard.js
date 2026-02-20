export default function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
      <button onClick={() => window.location="/register"}>Register Patient</button>
      <button onClick={() => window.location="/prescription"}>Write Prescription</button>
      <button onClick={() => {
        localStorage.clear();
        window.location="/";
      }}>Logout</button>
    </div>
  );
}
