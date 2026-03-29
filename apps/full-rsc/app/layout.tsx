import Nav from "./Nav";
import { CartProvider } from "./CartContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Nav />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
