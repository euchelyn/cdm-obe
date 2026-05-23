import { useRouter } from "next/navigation";


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
                <div className="edit-modal-overlay">
                    <div className="edit-modal-content">
                        <h3>Log Out</h3>
                        <p>Are you sure you want to log out?</p>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                            <button className="outline-btn" onClick={cancelLogout}>
                                Cancel
                            </button>
                            <button className="control-btn danger" onClick={confirmLogout}>
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
