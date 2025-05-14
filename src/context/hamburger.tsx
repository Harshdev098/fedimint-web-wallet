import { createContext, useState, useEffect } from "react";

const HamburgerContext = createContext<{
  hamburger: boolean;
  setHamburger: React.Dispatch<React.SetStateAction<boolean>>;
}>({ hamburger: false, setHamburger: () => {} });

export const HamburgerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hamburger, setHamburger] = useState(() => window.innerWidth <= 850);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 850) {
        setHamburger(true);
      } else {
        setHamburger(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <HamburgerContext.Provider value={{ hamburger, setHamburger }}>
      {children}
    </HamburgerContext.Provider>
  );
};

export default HamburgerContext;
