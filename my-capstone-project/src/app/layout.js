import "./globals.css";
import EmotionRegistry from "./EmotionRegistry";
import CustomAppBar from "./components/customAppBar";
import ClientSessionProvider from "./components/ClientSessionProvider";

export const metadata = {
  title: "IELTS Mate",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientSessionProvider>
          <EmotionRegistry>
            <CustomAppBar />
            {children}
          </EmotionRegistry>
        </ClientSessionProvider>
      </body>
    </html>
  );
}
