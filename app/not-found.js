export default function NotFound() {
  return (
    <div className="card">
      <h1>Paste unavailable</h1>
      <p>This paste doesn’t exist, has expired, or has reached its view limit.</p>
      <p><a href="/">Create a new paste</a></p>
    </div>
  );
}
