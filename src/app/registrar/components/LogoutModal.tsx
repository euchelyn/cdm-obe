import { useRouter } from "next/navigation";
import '../../alumni/globals.css';

export default function LogoutModal({
    showLogoutConfirm,
    setShowLogoutConfirm
}) {

    const router = useRouter();

    //==================================
    // CONFIRM LOGOUT
    //==================================
    const confirmLogout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
            });

            localStorage.removeItem("current_user");

            setShowLogoutConfirm(false);
            router.push("/");
        } catch (err) {
            console.error(err);
        }
    };

    //==================================
    // CANCEL LOGOUT
    //==================================
    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };


    return (
        <>
            {showLogoutConfirm && (
    <div className="modal-overlay">
        <div className="modal-card">
            <h2>Log Out</h2>
            <p>Are you sure you want to exit the dashboard?</p>

            <div className="modal-actions">
                <button 
                    className="cancel-btn" 
                    onClick={cancelLogout} 
                >
                    Cancel
                </button>
                <button 
                    className="logout-confirm-btn" 
                    onClick={confirmLogout}
                >
                    Confirm
                </button>
            </div>
        </div>
    </div>
)}
        </>
    );
}
