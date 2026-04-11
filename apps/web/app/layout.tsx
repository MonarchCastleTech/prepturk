import type { Metadata } from 'next';
import Chrome from '../components/Chrome';
import '../app/globals.css';

export const metadata: Metadata = {
  title: 'PrepTürk | Çevrimdışı Bilgi Komuta Merkezi',
  description: 'Türkiye için çevrimdışı mevzuat, acil durum ve eğitim kaynakları komuta merkezi',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="dark">
      <body 
        className="min-h-screen bg-nomad-bg font-sans text-foreground antialiased" 
        style={{ 
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          // @ts-ignore
          '--font-plex-sans': 'system-ui, sans-serif',
          '--font-plex-mono': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
        }}
      >
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{if(localStorage.getItem('prepturk:easyMode')==='true'){document.documentElement.classList.add('easy-mode');}if(localStorage.getItem('prepturk:powerMode')==='true'){document.documentElement.classList.add('low-power-mode');}}catch(e){}})();`
        }} />
        <Chrome>{children}</Chrome>
      </body>
    </html>
  );
}
