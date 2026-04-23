import type { AppProps } from 'next/app';
import UnifiedDataProvider from '../contexts/UnifiedDataContext'; // ✅ NO curly braces - DEFAULT IMPORT
import ErrorBoundary from '../components/common/ErrorBoundary';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <UnifiedDataProvider> {/* ✅ AA HAVE KAAM KARSE */}
        <Component {...pageProps} />
      </UnifiedDataProvider>
    </ErrorBoundary>
  );
}

export default MyApp;