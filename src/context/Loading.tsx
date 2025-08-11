import { createContext, useState } from 'react';

const LoadingContext = createContext<{
    loader: boolean;
    setLoader: React.Dispatch<React.SetStateAction<boolean>>;
    loaderMessage: string | null;
    setLoaderMessage: React.Dispatch<React.SetStateAction<string | null>>;
}>({ loader: false, setLoader: () => {}, loaderMessage: null, setLoaderMessage: () => {} });

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [loader, setLoader] = useState(false);
    const [loaderMessage, setLoaderMessage] = useState<string | null>(null);
    return (
        <LoadingContext.Provider value={{ loader, setLoader, loaderMessage, setLoaderMessage }}>
            {children}
        </LoadingContext.Provider>
    );
};

export default LoadingContext;
