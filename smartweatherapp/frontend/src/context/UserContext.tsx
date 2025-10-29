import { useContext, useEffect, createContext, type ReactNode, useState } from "react";
import { firestore } from "../config/firebase";
import { doc, getDoc, setDoc, DocumentSnapshot, type DocumentData } from "firebase/firestore";
import { useAuth } from "./AuthContext";

export interface UserConfig {
  preferedLanguage: string;
  preferedUnits: string;
  email: string;
}

interface UserConfigContext {
  config: UserConfig | null;
  setConfig: React.Dispatch<React.SetStateAction<UserConfig | null>>;
  updateUserConfig: (updates: Partial<UserConfig>) => Promise<void>;
}

const UserConfigContext = createContext<UserConfigContext | undefined>(undefined);

export const UserConfigProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [config, setConfig] = useState<UserConfig | null>(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            if (currentUser?.email) {
                const userConfig = await getOrCreateUserConfig(currentUser.email);
                setConfig(userConfig);
            } else {
                setConfig(null);
            }
        };
        fetchData();
    }, [currentUser]);

    const updateUserConfig = async (updates: Partial<UserConfig>) => {
        if (!currentUser?.email) {
            throw new Error("User must be authenticated to update config");
        }
        try {
            const userEmail = currentUser.email;
            const docRef = doc(firestore, "userConfig", userEmail);
            await setDoc(docRef, updates, { merge: true });
            
            // Update local state
            setConfig(prevConfig => prevConfig ? { ...prevConfig, ...updates } : null);
        } catch (err) {
            console.error("Error updating user config:", err);
            throw err;
        }
    };

    return (
    <UserConfigContext.Provider value={{ config, setConfig, updateUserConfig }}>
        {children}
    </UserConfigContext.Provider>
    );
}

export const useUserConfig = (): UserConfigContext => {
    const context = useContext(UserConfigContext);
    if (!context) {
        throw new Error("useUserConfig must be used within a UserConfigProvider");
    }
    return context;
}

export const getOrCreateUserConfig = async (email: string): Promise<UserConfig> => {
    try {
        const docRef = doc(firestore, "userConfig", email);
        const docSnap: DocumentSnapshot<DocumentData> = await getDoc(docRef);
        
        if (docSnap.exists()) {
            console.log("User config found for:", email);
            console.log(docSnap.data());
            return docSnap.data() as UserConfig;
        } else {
            console.log("Creating new user config for:", email);
            const defaultConfig: UserConfig = {
                preferedLanguage: "en",
                preferedUnits: "metric",
                email: email
            };
            
            await setDoc(docRef, defaultConfig);
            return defaultConfig;
        }
    } catch (err) {
        console.error("Error fetching/creating user config:", err);
        throw err;
    }
}
