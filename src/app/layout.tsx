import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
  weight: ['500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'AI Sales Agent Platform | Discover. Qualify. Engage. Convert.',
  description: 'Enterprise AI sales automation platform that discovers public requirements, enriches prospect intelligence, and autonomously qualifies leads via multilingual voice agents.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      className={cn(plusJakartaSans.variable, outfit.variable, "font-sans antialiased")} 
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground selection:bg-indigo-500/30 selection:text-indigo-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
