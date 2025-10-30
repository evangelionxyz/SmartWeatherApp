import { useContext, createContext, type ReactNode, useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc, DocumentSnapshot, type DocumentData } from "firebase/firestore";
import { firestore } from "../config/firebase";
import { useAuth } from "./AuthContext";

export interface UserConfig {
  preferredLanguage: string;
  preferredUnits: string;
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
    const lastFetchedEmailRef = useRef<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const userEmail = currentUser?.email || null;
            
            // Skip if we already fetched for this email
            if (userEmail === lastFetchedEmailRef.current) {
                return;
            }

            if (userEmail) {
                lastFetchedEmailRef.current = userEmail;
                const userConfig = await getOrCreateUserConfig(userEmail);
                setConfig(userConfig);
            } else {
                lastFetchedEmailRef.current = null;
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
            storeUserConfig(currentUser.email, updates as UserConfig);
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

export const storeUserConfig = async (email: string, config: UserConfig): Promise<void> => {
    try {
        const docRef = doc(firestore, "userConfig", email);
        await setDoc(docRef, config);
    } catch (err) {
        console.error("Error storing user config:", err);
        throw err;
    }
}

export const fetchUserConfig = async (email: string): Promise<UserConfig | null> => {
    try {
        const docRef = doc(firestore, "userConfig", email);
        const docSnap: DocumentSnapshot<DocumentData> = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as UserConfig;
        } else {
            return null;
        }
    } catch (err) {
        console.error("Error fetching user config:", err);
        throw err;
    }
}

export const getOrCreateUserConfig = async (email: string): Promise<UserConfig> => {
    try {
        const docRef = doc(firestore, "userConfig", email);
        const docSnap: DocumentSnapshot<DocumentData> = await getDoc(docRef);

        if (docSnap.exists()) {
            return fetchUserConfig(email)?.then(config => {
                if (config) {
                    console.log("User config found for:", email);
                    console.log(config);
                    return config;
                } else {
                    throw new Error("User config not found");
                }
            });
        } else {
            console.log("Creating new user config for:", email);
            const defaultConfig: UserConfig = {
                preferredLanguage: "en",
                preferredUnits: "metric",
                email: email
            };
            await storeUserConfig(email, defaultConfig);
            return defaultConfig;
        }
    } catch (err) {
        console.error("Error fetching/creating user config:", err);
        throw err;
    }
}