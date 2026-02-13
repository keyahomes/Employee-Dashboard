import { useEffect, useState, useRef } from "react";

import { getDatabase, ref, update, onValue, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import { UserCog, Info } from "lucide-react";

import "./salesHome.css";

function isValidUrl(str) {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}

function SalesHome() {
    if (!document.getElementById("scrollStyles")) {
        const styleTag = document.createElement("style");
        styleTag.id = "scrollStyles";
        styleTag.innerHTML = `
        @keyframes scroll-left {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
        }
        .scroll-text { animation: scroll-left 20s linear infinite; }
        .scroll-text:hover { animation-play-state: paused !important; cursor: pointer; }

        @media (max-width: 768px) {
            .mobile-responsive-grid {
                grid-template-columns: 1fr !important;
                gap: 10px !important;
            }
            .mobile-responsive-flex {
                flex-direction: column !important;
                gap: 10px !important;
            }
            .mobile-responsive-width {
                width: 100% !important;
                max-width: 100% !important;
            }
            .mobile-responsive-padding {
                padding: 5px !important;
            }
            .mobile-responsive-font {
                font-size: 12px !important;
            }
            .mobile-responsive-card {
                min-width: 100% !important;
                width: 100% !important;
            }
            .mobile-responsive-table {
                overflow-x: auto !important;
                -webkit-overflow-scrolling: touch !important;
            }
            .mobile-responsive-avatar {
                width: 30px !important;
                height: 30px !important;
                font-size: 18px !important;
            }
            .mobile-responsive-hello {
                font-size: 14px !important;
                width: 80px !important;
            }
        }
        `;
        document.head.appendChild(styleTag);
    }

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [showLogout, setShowLogout] = useState(false);
    const [showPayslipModal, setShowPayslipModal] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [showPersonalDetailsModal, setShowPersonalDetailsModal] = useState(false);


    let birthdays = [];

    try {
        if (Array.isArray(userData?.birthdays)) {
            birthdays = userData.birthdays;
        } else if (typeof userData?.birthdays === "string") {
            birthdays = JSON.parse(`[${userData.birthdays}]`);
        }
    } catch (e) {
        console.error("Invalid birthday JSON:", e);
    }


    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/";
    };

    const handlePayslipClick = () => {
        setShowPayslipModal(true);
        setSelectedMonth("");
        setSelectedYear("");
    };


    // payslip generation
    const generatePayslip = async () => {
        const empId = localStorage.getItem("empId");
        const siteId = localStorage.getItem("siteId");
        if (!selectedMonth || !selectedYear) {
            alert("Please select month and year");
            return;
        }

        try {
            const API_BASE = "https://api-myt2td5dja-uc.a.run.app";
            const res = await fetch(`${API_BASE}/generate-payslip`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    site: siteId,
                    empId: empId,
                    month: selectedMonth,
                    year: selectedYear
                })
            });

            if (!res.ok) {
                alert("Payslip not found");
                return;
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            // FORCE DOWNLOAD
            const a = document.createElement("a");
            a.href = url;
            a.download = `Payslip: ${selectedMonth}-${selectedYear}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();

        } catch (err) {
            console.error(err);
            alert("Backend not running");
        }
    };


    const closeModal = () => {
        setShowPayslipModal(false);
    };

    const handlePersonalDetailsClick = () => {
        setShowPersonalDetailsModal(true);
    }

    const closePersonalDetailsModal = () => {
        setShowPersonalDetailsModal(false);
    }

    useEffect(() => {

        const email = localStorage.getItem("email");
        const empId = localStorage.getItem("empId");
        const siteId = localStorage.getItem("siteId");

        if (!email || !siteId || !empId) {
            // setError("User not logged in or site id missing");
            // setLoading(false);
            window.location.href = "/login";
            return;
        }

        const fetchUserData = async () => {
            try {
                // get stored identifiers
                const email = localStorage.getItem("email");
                const empId = localStorage.getItem("empId");
                const siteId = localStorage.getItem("siteId");

                // sanitized key for DB path
                const sanitizedEmpId = (empId || "").toString().trim().replace(/\s+/g, "_");

                const db = getDatabase();
                const userRef = ref(db, `${siteId}/Users/${sanitizedEmpId}`);
                const snap = await get(userRef);

                if (!snap.exists()) {
                    throw new Error("User data not found in database.");
                }

                const data = snap.val();
                setUserData(data);

            } catch (err) {
                console.error("Error fetching user data:", err);
                setError(err.message || "Failed to fetch user data.");
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;


    return (
        <>
            <div style={styles.homeContainer}>

                {/*Topbar*/}
                <div id='topbar' style={styles.topbar}>
                    <div className="office-topbar-container" style={styles.topbarContainer1} >

                        {/*Keya Logo */}
                        <div className="office-logo-container" style={styles.topbarContainer2}>
                            <img
                                src="https://keyahomes.co.in/forms/static/media/keya_homes_logo.ae8e4b7c7c37a705231c.webp"
                                alt="Keya Homes"
                                height="50px"
                                className='logo'
                            />
                        </div>

                        {/* User profile & Logout */}
                        <div className="office-header-profile" style={styles.headerProfile}>
                            <div
                                style={styles.headerAvatar}
                                onClick={() => setShowLogout((prev) => !prev)}
                            >
                                {profileImage ? (
                                    <img
                                        src={profileImage}
                                        alt="Profile"
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                            cursor: "pointer"
                                        }}
                                    />
                                ) : (
                                    <div style={styles.headerAvatarFallback} className="mobile-responsive-avatar">
                                        {userData?.Employee_Name?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                )}
                            </div>
                            <div style={{ fontSize: "14px", fontWeight: 500, color: "#000000", width: "100px" }} className="mobile-responsive-hello">
                                Hello, {userData?.Employee_Name?.split(" ")[0] || "User"}
                            </div>

                            {/* Dropdown */}
                            {showLogout && (
                                <div style={styles.logoutDropdown}>
                                    <div style={styles.logoutItem} onClick={handleLogout}>
                                        LOGOUT
                                    </div>
                                </div>
                            )}

                        </div>

                    </div>
                </div>

                <div className="office-body-main" style={styles.bodyContainerMain} >
                    {/*Body Container - left*/}
                    <div className="office-body-left" style={styles.bodyContainerLeft}>

                        <div className="office-col" style={styles.bodyCol1}>

                            {/*Personal Details Card */}
                            <div style={styles.personalDetailsCard}
                                onClick={handlePersonalDetailsClick}
                            >
                                <div style={styles.personalDetailsContent}>
                                    <UserCog size={48} color="#286be898" strokeWidth={1.5} />
                                    <div style={styles.personalDetailsTitle}>
                                        Personal Details
                                    </div>
                                    <div style={styles.personalDetailsCardSubHead}>
                                        click for more info
                                    </div>
                                </div>
                            </div>

                            {/*Leave Details */}
                            <div className="office-card" style={styles.empDetails}>
                                <div style={styles.cardTitle}>
                                    Leave Details
                                </div>
                                <div style={styles.cardBody}>
                                    <div style={styles.tableWrapper} className="mobile-responsive-table">
                                        <table style={styles.table}>
                                            <tbody>
                                                {summaryRow(1, "LEAVE AVAILABLE", userData?.Available_Leave)}
                                                {summaryRow(2, "AVAILED LEAVE", userData?.Availed_Leave)}
                                                {summaryRow(3, "BALANCE AVAILABLE LEAVE", userData?.Balance_Available_Leave)}
                                                {summaryRow(4, "LEAVE REQUEST FORM", userData?.Leave_Request_Form)}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Task List */}
                            <div className="office-card" style={styles.taskListCard}>
                                <div style={styles.cardTitle1}>
                                    Task List
                                </div>
                                <div style={styles.cardBody}>
                                    <div style={styles.titleCard1}>

                                        {/* General Task */}
                                        <div style={styles.file}>
                                            <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=000000" width="16" />
                                            <a href={userData.General_Task} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }}>
                                                GENERAL TASK
                                            </a>
                                        </div>

                                        {/* Department Task */}
                                        <div style={styles.file}>
                                            <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=000000" width="16" />
                                            <a href={userData.Department_Task} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }}>
                                                DEPARTMENT TASK
                                            </a>
                                        </div>

                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Body Container - Right */}
                    <div style={styles.bodyContainerRight}>

                        {/* Right Top */}
                        <div style={styles.bodyContainerLeft}>

                            <div className="office-body-right-top" style={styles.bodyContainer2} >

                                {/* Middle Column */}
                                <div style={styles.bodyCol1}>

                                    {/*Learning and Development Details */}
                                    <div className="office-card-small" style={styles.learningAndDevelopmentCard}>
                                        <div style={styles.cardTitle1}>
                                            Learning and Development
                                        </div>
                                        <div style={styles.cardBody}>
                                            <div style={styles.titleCard1}>

                                                {/* FAQ  */}
                                                <div style={styles.file}>
                                                    <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=000000" width="16" />
                                                    <a href={userData.FAQ} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }}>
                                                        FAQ
                                                    </a>
                                                </div>

                                                {/* SOP's */}
                                                <div style={styles.file}>
                                                    <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=000000" width="16" />
                                                    <a href={userData.SOPs} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }}>
                                                        SOP's
                                                    </a>
                                                </div>

                                                {/* Training Video */}
                                                <div style={styles.file}>
                                                    <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=000000" width="16" />
                                                    <a href={userData.Training_Videos} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }} >
                                                        Training Video
                                                    </a>
                                                </div>

                                            </div>
                                        </div>
                                    </div>


                                    {/*Application Cards */}
                                    <div style={styles.applicationCard}>
                                        <div style={styles.titleCard1}>

                                            {/* Form 16 */}
                                            <div style={styles.file}>
                                                <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=000000" width="16" />
                                                <a href={userData.Form_16} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }} >
                                                    Apply for Form16
                                                </a>
                                            </div>

                                            {/* Payslip */}
                                            <div style={styles.file}
                                                onClick={handlePayslipClick}
                                            >
                                                <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=000000" width="16" />
                                                <span>Generate Payslip</span>
                                            </div>

                                            {/* Employment letter */}
                                            <div style={styles.file}>
                                                <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=000000" width="16" />
                                                <a href={userData.Employment_Letter} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }} >
                                                    Employment Letter
                                                </a>
                                            </div>

                                        </div>
                                    </div>

                                </div>

                                {/*Right Column - Links card */}
                                <div style={styles.rightCol}>

                                    {/*Holiday List Card */}
                                    <div className="office-card-links" style={styles.cards}>
                                        <div style={styles.titleCard}>
                                            <a href={userData.Holiday_List_2026} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }}>
                                                Holiday List - 2026
                                            </a>
                                        </div>
                                    </div>

                                    {/*Employment Card */}
                                    <div className="office-card-links" style={styles.cards}>
                                        <div style={styles.titleCard}>
                                            <a href={userData.Employment_Policy} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }}>
                                                Employment Policy
                                            </a>
                                        </div>
                                    </div>

                                    {/*Dress Code Card */}
                                    <div className="office-card-links" style={styles.cards}>
                                        <div style={styles.titleCard}>
                                            <a href={userData.Dress_Code} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }}>
                                                Dress Code
                                            </a>
                                        </div>
                                    </div>

                                    {/*Insurance Details Card */}
                                    <div className="office-card-links" style={styles.cards}>
                                        <div style={styles.titleCard}>
                                            <a href={userData.Insurance_Details} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }}>
                                                Insurance Details
                                            </a>
                                        </div>
                                    </div>

                                    {/*PF Website */}
                                    <div className="office-card-links" style={styles.cards}>
                                        <div style={styles.titleCard}>
                                            <a href={userData.PF_Website} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }}>
                                                PF Website
                                            </a>
                                        </div>
                                    </div>

                                    {/*Usage of Phone Card */}
                                    <div className="office-card-links" style={styles.cards}>
                                        <div style={styles.titleCard}>
                                            <a href={userData.Mobile_Usage_Policy} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }}>
                                                Usage of Phone
                                            </a>
                                        </div>
                                    </div>

                                    {/*Keya Update */}
                                    <div className="office-card-links" style={styles.cards}>
                                        <div style={styles.titleCard}>
                                            <a href={userData.Keya_Update} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }}>
                                                Keya Update
                                            </a>
                                        </div>
                                    </div>



                                </div>
                            </div>
                        </div>

                        {/* Birthday  */}
                        <div className="office-card" style={styles.birthdayCard}>
                            <div style={styles.cardTitle}>
                                Current Month Birthdays
                            </div>
                            <div style={{ ...styles.cardBody, justifyContent: "flex-start", alignItems: "flex-start" }}>
                                {birthdays.length === 0 ? (
                                    <div style={styles.noBirthdayText}>
                                        Keya has no birthdays this month
                                    </div>
                                ) : (
                                    <div style={styles.tableWrapperBirthday} >
                                        <table style={styles.tableBirthday}>
                                            <tbody>
                                                {tableHeaderRow()}

                                                {birthdays.map((item, idx) =>
                                                    birthdayRow(idx + 1, item)
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>


            </div>

            {/* Payslip Modal */}
            {showPayslipModal && (
                <div style={styles.modalOverlay} onClick={closeModal}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Generate Payslip</h3>
                            <button style={styles.closeButton} onClick={closeModal}>
                                &times;
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Month</label>
                                <select
                                    style={styles.formSelect}
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                >
                                    <option value="">Select Month</option>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                        <option key={month} value={month}>
                                            {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Year</label>
                                <select
                                    style={styles.formSelect}
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                >
                                    <option value="">Select Year</option>
                                    <option value="2025">2025</option>
                                    <option value="2026">2026</option>
                                </select>
                            </div>
                        </div>
                        <div style={styles.modalFooter}>
                            <button style={styles.generateButton} onClick={generatePayslip}>
                                Generate
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Personal Details Modal */}
            {showPersonalDetailsModal && (
                <div style={styles.modalOverlay} onClick={closePersonalDetailsModal}>
                    <div style={styles.modalContentLarge} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Personal Details</h3>
                            <button style={styles.closeButton} onClick={closePersonalDetailsModal}>
                                &times;
                            </button>
                        </div>
                        <div style={styles.modalBodyScroll}>
                            <div style={styles.tableWrapper}>
                                <table style={styles.tableModal}>
                                    <tbody>
                                        {summaryRow(1, "DOJ", userData?.DOJ)}
                                        {summaryRow(2, "DOB", userData?.DOB)}
                                        {summaryRow(3, "AGE", userData?.Age)}
                                        {summaryRow(4, "NAME", userData?.Employee_Name)}
                                        {summaryRow(5, "GENDER", userData?.Gender)}
                                        {summaryRow(6, "DEPARTMENT", userData?.Department)}
                                        {summaryRow(7, "REPORTING MANAGER", userData?.Reporting_Manager)}
                                        {summaryRow(8, "EMERGENCY CONTACT 1", userData?.Emergency_Contact_No_1)}
                                        {summaryRow(9, "EMERGENCY CONTACT 2", userData?.Emergency_Contact_No_2)}
                                        {summaryRow(10, "BLOOD GROUP", userData?.Blood_Group)}
                                        {summaryRow(11, "PERMANENT ADDRESS", userData?.Permanent_Address)}
                                        {summaryRow(12, "CURRENT ADDRESS", userData?.Current_Address)}
                                        {summaryRow(13, "PF NUMBER", userData?.PF_Number)}
                                        {summaryRow(14, "UAN NUMBER", userData?.UAN_Number)}
                                        {summaryRow(15, "BANK NAME", userData?.Bank_Name)}
                                        {summaryRow(16, "IFSC CODE", userData?.IFSC_Code)}
                                        {summaryRow(17, "ACCOUNT NUMBER", userData?.Account_Number)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

const styles = {
    homeContainer: {
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `
            linear-gradient(
            135deg,
            rgba(42, 78, 240, 0.1) 0%,
            rgba(118, 75, 162, 0.04) 100%
            ),
            url("")
        `,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
        position: "relative",
        overflowX: "hidden",
    },

    topbar: {
        display: "flex",
        alignItems: "center",
        position: "fixed-top",
        backgroundColor: "#fff",
        padding: "3px",
        height: "55px",
        marginBottom: "20px",
    },

    topbarContainer1: {
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",        // d-flex
        alignItems: "center",
        justifyContent: "space-between", // md and above
    },

    topbarContainer2: {
        width: "1200px",        // col-md-1
        minWidth: "80px",       // prevents logo collapse
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start", // md+
    },

    headerProfile: {
        position: "relative",
        marginRight: "50px",
        display: "flex",
        flexDirection: "row",
        border: "1px solid #286be898",
        borderRadius: "20px",
        padding: "5px 10px",
        backgroundColor: "#fff",
        alignItems: "center",
        gap: "10px",
    },

    headerAvatarFallback: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        backgroundColor: " #0c5bef1a",
        color: "#286be898",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
        fontWeight: "700",
        border: "1.5px solid #0c5bef1a",
    },

    dashboardLayout: {
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr 0.8fr",
        gap: "15px",
        marginTop: "25px",
        alignItems: "stretch",  // let each card take natural height
    },

    logoutDropdown: {
        position: "absolute",
        top: "60px",
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: "6px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
        zIndex: 1200,
    },

    logoutItem: {
        padding: "10px 15px",
        cursor: "pointer",
        fontWeight: "600",
        color: "#000000",
        whiteSpace: "nowrap",
    },

    bodyContainerMain: {
        display: "flex",
        gap: "10px",
        maxWidth: "1200px",
        margin: "50px auto",
        alignItems: "stretch",
    },


    bodyContainerLeft: {
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        height: "100%",
        flexDirection: "column",
        flex: "1",
        // backgroundColor:"green"
    },

    bodyContainerRight: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        height: "100%",
        flex: "1",
    },

    bodyContainer2: {
        display: "flex",
        gap: "13px",
        justifyContent: "center",
    },

    bodyCol1: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        height: "100%",
    },

    personalDetailsCard: {
        display: "flex",
        flexDirection: "column",
        border: "1px solid #d6d6d6ff",
        borderRadius: "20px",
        minHeight: "160px",
        width: "100%",
        boxShadow: "0 8px 18px rgba(228, 182, 255, 0.08)",
        backgroundColor: "#f4f6ff",
        flexGrow: 1,
        justifyContent: "center",
    },

    // Leave details card
    empDetails: {
        display: "flex",
        flexDirection: "column",
        border: "1px solid #d6d6d6ff",
        borderRadius: "20px",
        maxHeight: "150px",
        width: "100%",
        boxShadow: "0 8px 18px rgba(228, 182, 255, 0.08)",
        backgroundColor: "#f4f6ff",
        flexGrow: 1,
        // width: "550px",
    },

    taskListCard: {
        display: "flex",
        flexDirection: "column",
        border: "1px solid #d6d6d6ff",
        borderRadius: "20px",
        minHeight: "120px",
        width: "100%",
        boxShadow: "0 8px 18px rgba(228, 182, 255, 0.08)",
        backgroundColor: "#f4f6ff",
        flexGrow: 1,
        // width: "550px",
    },

    // Learning And Development Card
    learningAndDevelopmentCard: {
        display: "flex",
        flexDirection: "column",
        border: "1px solid #d6d6d6ff",
        borderRadius: "20px",
        minHeight: "160px",
        width: "100%",
        boxShadow: "0 8px 18px rgba(228, 182, 255, 0.08)",
        backgroundColor: "#f4f6ff",
        flexGrow: 1,
        // width: "550px",
    },

    rightCol: {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        height: "100%",
    },

    // Birthday card
    birthdayCard: {
        display: "flex",
        flexDirection: "column",
        border: "1px solid #d6d6d6ff",
        borderRadius: "20px",
        height: "100%",
        width: "100%",
        // width: "628px",
        boxShadow: "0 8px 18px rgba(228, 182, 255, 0.08)",
        backgroundColor: "#f4f6ff",
        flexGrow: 1,
    },

    tableWrapper: {
        overflow: "hidden",
        borderRadius: "10px",
        width: "100%"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: "lato",
        borderRadius: "20px",
    },

    th: {
        border: "1px solid #0c4338",
        color: "#0c4338",
    },

    td: {
        padding: "5px",
        color: "#000000ff",
    },

    tableWrapperBirthday: {
        overflow: "hidden",
        borderRadius: "10px",
        width: "100%"
    },

    tableBirthday: {
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: "lato",
        borderRadius: "20px",
        height: "100%",
    },

    tdBirthday: {
        padding: "4px",
        color: "#000000ff",
        fontWeight: "400",
    },

    noBirthdayText: {
        textAlign: "center",
        fontSize: "12px",
        color: "#555",
        fontStyle: "italic",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",         // ⭐ vertical center
        width: "100%",
    },

    file: {
        display: "flex",
        alignItems: "flex-start",
        gap: "5px",
        color: "#000000",
        fontWeight: "500",
        textDecoration: "none",
        width: "100%",
        cursor: "pointer",
    },

    cardTitle: {
        backgroundColor: "white",
        height: "20px",
        borderRadius: "20px 20px 0 0",
        padding: "6px",
        textAlign: "center",
        fontSize: "14px",
        fontWeight: "700",
        textTransform: "Uppercase",
        backdropFilter: "blur(5px)",
    },

    cardBody: {
        display: "flex",
        fontSize: "11px",
        padding: "8px 10px",
        justifyContent: "center",
        flexGrow: 1,
        alignItems: "center",
    },

    cardTitle1: {
        backgroundColor: "white",
        width: "100%",          // ✅ FIX
        borderRadius: "16px 16px 0 0",
        padding: "8px",
        textAlign: "center",
        fontSize: "14px",
        fontWeight: "700",
        textTransform: "uppercase",
    },

    // Application Card 
    applicationCard: {
        borderRadius: "16px",
        border: "1px solid #d6d6d6ff",
        minHeight: "140px",
        // minWidth: "300px",
        width: "100%",
        justifyContent: "flex-start",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
        backgroundColor: "#f2f4ff",
        flexGrow: 1,
    },

    cards: {
        borderRadius: "16px",
        border: "1px solid #d6d6d6ff",
        maxHeight: "36px",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        padding: "1.4px",
        boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
        backgroundColor: "#f2f4ff"

    },

    cardMain: {
        borderRadius: "16px",
        border: "1px solid #d6d6d6ff",
        minHeight: "100px",
        width: "405px",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
        backgroundColor: "#f2f4ff"
    },

    titleCard: {
        fontSize: "12px",
        fontWeight: "600",
        textTransform: "Uppercase",
    },

    titleCard1: {
        fontSize: "11px",
        textTransform: "Uppercase",
        display: "flex",
        flexDirection: "column",
        margin: "8px",
        gap: "12px",
        justifyContent: "center",
        alignItems: "center",
        flexGrow: 1,
    },

    // Modal Styles
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
    },

    modalContent: {
        backgroundColor: "#fff",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
    },

    modalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: "1px solid #e0e0e0",
        backgroundColor: "#f8f9ff",
        borderRadius: "16px 16px 0 0",
    },

    modalTitle: {
        margin: 0,
        fontSize: "16px",
        fontWeight: "700",
        color: "#000000",
        textTransform: "uppercase",
    },

    closeButton: {
        background: "none",
        border: "none",
        fontSize: "24px",
        color: "#666",
        cursor: "pointer",
        padding: "0",
        width: "30px",
        height: "30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        transition: "background-color 0.2s ease",
    },

    closeButtonHover: {
        backgroundColor: "#f0f0f0",
    },

    modalBody: {
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },

    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },

    formLabel: {
        fontSize: "12px",
        fontWeight: "600",
        color: "#333",
    },

    formSelect: {
        padding: "8px 10px",
        border: "1px solid #d6d6d6ff",
        borderRadius: "8px",
        fontSize: "12px",
        backgroundColor: "#fff",
        outline: "none",
        transition: "border-color 0.2s ease",
    },

    formSelectFocus: {
        borderColor: "#286be898",
        boxShadow: "0 0 0 3px rgba(40, 107, 232, 0.1)",
    },

    modalFooter: {
        padding: "12px 16px 16px 16px",
        display: "flex",
        justifyContent: "flex-end",
        borderTop: "1px solid #e0e0e0",
        backgroundColor: "#f8f9ff",
        borderRadius: "0 0 16px 16px",
    },

    generateButton: {
        backgroundColor: "#286be898",
        color: "#fff",
        border: "none",
        padding: "8px 16px",
        borderRadius: "8px",
        fontSize: "12px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s ease",
        textTransform: "uppercase",
    },

    generateButtonHover: {
        backgroundColor: "#286be8",
        transform: "translateY(-1px)",
        boxShadow: "0 4px 12px rgba(40, 107, 232, 0.3)",
    },

    // Personal Details Card Styles
    personalDetailsCard1: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid #d6d6d6ff",
        borderRadius: "16px",
        padding: "12px 20px",
        backgroundColor: "#f2f4ff",
        boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
        cursor: "pointer",
        transition: "all 0.2s ease",
        minHeight: "150px",
        width: "100%",
        // maxWidth: "510px",
        position: "relative",
    },

    personalDetailsContent: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        width: "100%",
    },

    personalDetailsTitle: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#000",
        textTransform: "uppercase",
        textAlign: "center",

    },

    personalDetailsCardSubHead: {
        paddingTop: "0px",
        fontSize: "12px",
    },

    infoIconContainer: {
        position: "absolute",
        top: "12px",
        right: "12px",
        cursor: "help",
        zIndex: 10,
    },

    infoTooltip: {
        position: "absolute",
        top: "30px",
        right: "0",
        backgroundColor: "#fff",
        border: "1px solid #d6d6d6ff",
        borderRadius: "8px",
        padding: "10px 12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        fontSize: "11px",
        color: "#333",
        width: "220px",
        lineHeight: "1.4",
        zIndex: 1000,
        whiteSpace: "normal",
    },

    // Modal Content Large for Personal Details
    modalContentLarge: {
        backgroundColor: "#fff",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "700px",
        maxHeight: "85vh",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
    },

    modalBodyScroll: {
        padding: "16px",
        overflowY: "auto",
        maxHeight: "70vh",
    },

    // Table for Modal with 12px font size
    tableModal: {
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: "lato",
        borderRadius: "20px",
        fontSize: "12px",
    },
};



const formatDate = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);
    if (isNaN(date)) return value; // fallback if not a valid date

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};


const summaryRow = (index, label, value = false) => {
    const isNumeric =
        value !== null &&
        value !== "" &&
        !isNaN(Number(value));

    const isLink =
        typeof value === "string" &&
        (value.startsWith("http://") || value.startsWith("https://"));

    const isDate =
        typeof value === "string" &&
        !isNaN(Date.parse(value));

    return (
        <tr
            key={index}
            style={{ backgroundColor: index % 2 === 0 ? "#0c5bef1a" : "#5488e831" }}
        >
            <td style={styles.td} className="mobile-responsive-font">{index}</td>
            <td style={styles.td} className="mobile-responsive-font">{label}</td>
            <td style={styles.td} className="mobile-responsive-font">
                {isLink ? (
                    <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            color: "#000000",
                            fontWeight: "400",
                            textDecoration: "underline",
                            cursor: "pointer",
                        }}
                    >
                        Request Form
                    </a>
                ) : isDate ? (
                    formatDate(value)
                ) : (
                    value || "N/A"
                )}
            </td>
        </tr>
    );
};

const birthdayRow = (index, person) => {
    return (
        <tr
            key={index}
            style={{ backgroundColor: index % 2 === 0 ? "#0c5bef1a" : "#5488e831" }}
        >
            {/* <td style={styles.tdBirthday}>{index}</td> */}
            <td style={{ ...styles.tdBirthday, paddingLeft: "10px" }}>{person.name}</td>
            <td style={styles.tdBirthday}>{person.dept}</td>
            <td style={styles.tdBirthday}>{person.birthday}</td>
        </tr>
    );
};

const tableHeaderRow = () => (
    <tr style={{ backgroundColor: "#0c5bef1a" }}>
        {/* <td style={{ ...styles.tdBirthday, fontWeight: "600" }}>#</td> */}
        <td style={{ ...styles.tdBirthday, fontWeight: "600", paddingLeft: "10px" }}>Name</td>
        <td style={{ ...styles.tdBirthday, fontWeight: "600" }}>Department</td>
        <td style={{ ...styles.tdBirthday, fontWeight: "600" }}>Birth Date</td>
    </tr>
);



export default SalesHome;