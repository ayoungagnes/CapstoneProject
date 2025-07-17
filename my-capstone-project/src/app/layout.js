import './globals.css';
import EmotionRegistry from './EmotionRegistry';
import CustomAppBar from './components/customAppBar';

export const metadata = {
  title: 'IELTS Mate'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <EmotionRegistry>
            <CustomAppBar />
            {children}
        </EmotionRegistry>
      </body>
    </html>
  );
}
