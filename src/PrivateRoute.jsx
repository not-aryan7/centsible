import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

export default function PrivateRoute({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div style={{
                minHeight: "100vh", display: "flex", alignItems: "center",
                justifyContent: "center", background: "linear-gradient(180deg, #F5F7FA 0%, #E8F0F2 100%)"
            }}>
                <p style={{ color: "#028090", fontSize: "18px", fontWeight: 600 }}>Loading...</p>
            </div>
        );
    }

    return user ? children : <Navigate to="/login" />;
}
