import type { Metadata } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";
import {QueryClientProvider} from "@/providers/CustomQueryClientProvider";
import Script from "next/script";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Devb.io - Effortless Portfolios for Developers",
  description: "Effortless Portfolios for Developers"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
      <head>
          <script type="text/javascript"></script>
          <Script id="clarity-script" strategy="afterInteractive">
              {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
          `}
          </Script>
          <Script id="google-analytics" strategy="afterInteractive">
                {`
                import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
        import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";

        // Your web app's Firebase configuration
        // For Firebase JS SDK v7.20.0 and later, measurementId is optional
        const firebaseConfig = {
            apiKey: "AIzaSyDNfTJ9M8Bd4ZmnpJ3ZHdJT_Hs9CTvd1Mw",
            authDomain: "devbio1.firebaseapp.com",
            projectId: "devbio1",
            storageBucket: "devbio1.firebasestorage.app",
            messagingSenderId: "205729381961",
            appId: "1:205729381961:web:b3d6306656a5c93c068998",
            measurementId: ${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID},
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const analytics = getAnalytics(app);
            `}
          </Script>
      </head>
      <body
          className={`${outfit.variable} ${spaceGrotesk.variable} font-outfit`}
      >
      <QueryClientProvider>
          {children}
      </QueryClientProvider>
      </body>
      </html>
  );
}
