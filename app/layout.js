import './globals.css';

export const metadata = { title: 'Pastebin Lite', description: 'Share text with a link' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main className="wrap">
          <header>
            <a href="/" className="brand">Pastebin Lite</a>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
