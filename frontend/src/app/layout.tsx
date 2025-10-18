import "./globals.css";
import { ReactNode } from "react";
import { QueryProvider } from "./providers/query-provider";
import { ThemeProvider } from "./providers/theme-provider";
import { ThemeToggle } from "./components/ThemeToggle";

export const metadata = {
  title: "LLM Lab",
  description: "Experiment with LLM parameter sweeps",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <header className="flex justify-end p-4">
              <ThemeToggle />
            </header>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
