import Nav from "./Nav";
import { CartProvider } from "./CartContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#fff", color: "#111" }}>
        <CartProvider>
          <Nav />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
