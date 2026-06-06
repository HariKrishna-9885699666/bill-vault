import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { useEffect, useState } from "react";
import { store, persistor } from "./index";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <Provider store={store}>{children}</Provider>;
  }
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
