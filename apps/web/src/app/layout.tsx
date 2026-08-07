import "./global.css";

export const metadata = {
  title: "Pink Paprikaa",
  description: "Pink Paprikaa. New site under construction.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
