import { useEffect, useState, useRef } from "react";

import { getDatabase, ref, update, onValue, get } from "firebase/database";
import { getAuth } from "firebase/auth";


function isValidUrl(str) {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}

function EngineersHome() {
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
        <div style={styles.homeContainer}>

            {/*Topbar*/}
            <div id='topbar' style={styles.topbar}>
                <div style={styles.topbarContainer1} className="mobile-responsive-width">

                    {/*Keya Logo */}
                    <div style={styles.topbarContainer2}>
                        <img
                            src="https://keyahomes.co.in/forms/static/media/keya_homes_logo.ae8e4b7c7c37a705231c.webp"
                            alt="Keya Homes"
                            height="50px"
                            className='logo'
                        />
                    </div>

                    {/* User profile & Logout */}
                    <div style={styles.headerProfile}>
                        <div
                            style={styles.headerAvatar}
                            onClick={() => setShowLogout((prev) => !prev)}
                        >
                            {profileImage ? (
                                <img
                                    src="{profileImage}"
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
                        <div style={{ fontSize: "18px", fontWeight: 500, color: "#000000", width: "100px" }} className="mobile-responsive-hello">
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

            <div style={styles.bodyContainerMain} className="mobile-responsive-grid">
                {/*Body Container - left*/}
                <div style={styles.bodyContainer}>

                    <div style={styles.bodyCol1}>

                        {/*Employee Basic Details */}
                        <div style={styles.empDetails}>
                            <div style={styles.cardTitle}>
                                Employee Basic Details
                            </div>
                            <div style={styles.cardBody}>
                                <div style={styles.tableWrapper} className="mobile-responsive-table">
                                    <table style={styles.table}>
                                        <tbody>
                                            {summaryRow(1, "DOJ", userData?.DOJ)}
                                            {summaryRow(2, "AGE", userData?.Age)}
                                            {summaryRow(3, "NAME", userData?.Employee_Name)}
                                            {summaryRow(4, "GENDER", userData?.Gender)}
                                            {summaryRow(5, "DEPARTMENT", userData?.Department)}
                                            {summaryRow(6, "REPORTING MANAGER", userData?.Reporting_Manager)}
                                            {summaryRow(7, "EMERGENCY CONTACT 1", userData?.Emergency_Contact_No_1)}
                                            {summaryRow(8, "EMERGENCY CONTACT 2", userData?.Emergency_Contact_No_2)}
                                            {summaryRow(9, "BLOOD GROUP", userData?.Blood_Group)}
                                            {summaryRow(10, "PERMANENT ADDRESS", userData?.Permanent_Address)}
                                            {summaryRow(11, "CURRENT ADDRESS", userData?.Current_Address)}

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/*Leave Details */}
                        <div style={styles.empDetails}>
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

                    </div>
                </div>

                {/* Body Container - Right */}
                <div style={styles.bodyContainer1}>

                    {/* Right Top */}
                    <div style={styles.bodyContainer}>

                        <div style={styles.bodyContainer2} className="mobile-responsive-flex">

                            {/* Middle Column */}
                            <div style={styles.bodyCol1}>

                                {/*Learning and Development Details */}
                                <div style={styles.cardMain1}>
                                    <div style={styles.cardTitle1}>
                                        Learning and Development
                                    </div>
                                    <div style={styles.cardBody}>
                                        <div style={styles.titleCard1}>

                                            {/* FAQ  */}
                                            <div style={styles.file}>
                                                <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=000000" width="18" />
                                                <a href={userData.FAQ} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }}>
                                                    FAQ
                                                </a>
                                            </div>

                                            {/* SOP's */}
                                            <div style={styles.file}>
                                                <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=000000" width="18" />
                                                <a href={userData.SOPs} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }}>
                                                    SOP's
                                                </a>
                                            </div>

                                            {/* Task List */}
                                            {/* <div style={styles.file}>
                                                <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=000000" width="18" />
                                                <a href={userData.Task_List} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }}>
                                                    Task List
                                                </a>
                                            </div> */}

                                            {/* Training Video */}
                                            <div style={styles.file}>
                                                <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=000000" width="18" />
                                                <a href={userData.Training_Videos} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }} >
                                                    Training Video
                                                </a>
                                            </div>

                                        </div>
                                    </div>
                                </div>

                                {/*Task List */}
                                <div style={styles.cardMain1}>
                                    <div style={styles.cardTitle1}>
                                        Task List
                                    </div>
                                    <div style={styles.cardBody}>
                                        <div style={styles.titleCard1}>

                                            {/* General Task */}
                                            <div style={styles.file}>
                                                <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=000000" width="18" />
                                                <a href={userData.General_Task} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }}>
                                                        GENERAL TASK
                                                </a>
                                            </div>

                                            {/* Department Task */}
                                            <div style={styles.file}>
                                                <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=000000" width="18" />
                                                <a href={userData.Department_Task} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }}>
                                                    DEPARTMENT TASK
                                                </a>
                                            </div>

                                        </div>
                                    </div>
                                </div>

                                {/*Application Cards */}
                                <div style={styles.cardMain1}>
                                    <div style={styles.titleCard1}>

                                        {/* Form 16 */}
                                        <div style={styles.file}>
                                            <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=000000" width="18" />
                                            <a href={userData.Form_16} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }} >
                                                Apply for Form16
                                            </a>
                                        </div>

                                        {/* Payslip */}
                                        <div style={styles.file}>
                                            <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=000000" width="18" />
                                            <a href={userData.Payslip} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }}>
                                                Apply for Payslip
                                            </a>
                                        </div>

                                        {/* Employment letter */}
                                        <div style={styles.file}>
                                            <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=000000" width="18" />
                                            <a href={userData.Employment_Letter} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }} >
                                                Employment Letter
                                            </a>
                                        </div>

                                    </div>
                                </div>


                            </div>

                            {/*Right Column - Links card */}
                            <div style={styles.bodyCol1}>

                                {/*Holiday List Card */}
                                <div style={styles.cards}>
                                    <div style={styles.titleCard}>
                                        <a href={userData.Holiday_List_2026} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }}>
                                            Holiday List - 2026 
                                        </a>
                                    </div>
                                </div>

                                {/*employment Policy Card */}
                                <div style={styles.cards}>
                                    <div style={styles.titleCard}>
                                        <a href={userData.Employment_Policy} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }}>
                                            Employment Policy
                                        </a>
                                    </div>
                                </div>

                                {/*Dress Code Card */}
                                <div style={styles.cards}>
                                    <div style={styles.titleCard}>
                                        <a href={userData.Dress_Code} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }}>
                                            Dress Code
                                        </a>
                                    </div>
                                </div>

                                {/*Insurance Details Card */}
                                <div style={styles.cards}>
                                    <div style={styles.titleCard}>
                                        <a href={userData.Insurance_Details} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }} >
                                            Insurance Details
                                        </a>
                                    </div>
                                </div>

                                {/*Usage of Phone Card */}
                                <div style={styles.cards}>
                                    <div style={styles.titleCard}>
                                        <a href={userData.Mobile_Usage_Policy} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#000000" }}>
                                            Usage of Phone
                                        </a>
                                    </div>
                                </div>

                                {/*Keya Update */}
                                <div style={styles.cards}>
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
                    <div style={styles.empDetails3}>
                        <div style={styles.cardTitle}>
                            Current Month Birthdays
                        </div>
                        <div style={styles.cardBody}>
                            {birthdays.length === 0 ? (
                                <div style={styles.noBirthdayText}>
                                    Keya has no birthdays this month
                                </div>
                            ) : (
                                <div style={styles.tableWrapperBirthday} className="mobile-responsive-table">
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
        // flex: "0 0 auto",
        width: "1200px",        // col-md-1
        minWidth: "80px",       // prevents logo collapse
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start", // md+

    },

    headerProfile: {
        position: "relative",
        marginRight: "60px",
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
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "auto 1fr",   // ⭐ THIS FORCES EQUAL BOTTOM
        gap: "10px",
        maxWidth: "1200px",
        margin: "20px auto",
        alignItems: "stretch",
    },

    bodyContainer: {
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        height: "100%",
    },

    bodyContainer1: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        height: "100%",
        // justifyContent: "flex-start"
    },

    bodyContainer2: {
        display: "flex",
        gap: "10px",
        justifyContent: "center",
    },

    bodyCol1: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },

    empDetails: {
        display: "flex",
        flexDirection: "column",
        border: "1px solid #d6d6d6ff",
        borderRadius: "20px",
        height: "100%",
        width: "100%",
        boxShadow: "0 8px 18px rgba(228, 182, 255, 0.08)",
        backgroundColor: "#f4f6ff",
        flexGrow: 1,

    },

    empDetails2: {
        display: "flex",
        flexDirection: "column",
        border: "1px solid #d6d6d6ff",
        borderRadius: "20px",
        height: "100%",
        width: "100%",
        boxShadow: "0 8px 18px rgba(228, 182, 255, 0.08)",
        backgroundColor: "#f4f6ff",
        // margin: "0px 23px",
    },

    empDetails3: {
        display: "flex",
        flexDirection: "column",
        border: "1px solid #d6d6d6ff",
        borderRadius: "20px",
        height: "100%",
        width: "100%",
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
        // margin: "0px",
        fontFamily: "lato",
        borderRadius: "20px",
    },

    th: {
        border: "1px solid #0c4338",
        // padding: "8px",
        // backgroundColor: "#f0da95",
        color: "#0c4338",
    },

    td: {
        // border: "1px solid #0c4338",
        padding: "7px",
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
        // margin: "0px",
        fontFamily: "lato",
        borderRadius: "20px",
        // tableLayout: "fixed",
    },

    tdBirthday: {
        // border: "1px solid #0c4338",
        padding: "6px",
        color: "#000000ff",
        fontWeight: "400",
        // paddingLeft:"10px",
    },

    noBirthdayText: {
        textAlign: "center",
        fontSize: "14px",
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
        gap: "6px",
        color: "#000000",
        paddingBottom: "7px",
        fontWeight: "500",
        TextDecoder: "none",
        width: "100%",
    },

    cardTitle: {
        backgroundColor: "white",
        height: "18px",
        // width: "600px",
        borderRadius: "20px 20px 0 0",
        padding: "8px",
        // border: "1px solid black",
        textAlign: "center",
        fontSize: "16px",
        fontWeight: "700",
        textTransform: "Uppercase",
        backdropFilter: "blur(5px)",

    },

    cardBody: {
        display: "flex",
        fontSize: "14px",
        // margin: "10px",
        padding: "10px 14px",
        justifyContent: "center",
        // backgroundColor:"red",
        // width:"100%"

    },

    cardTitle1: {
        backgroundColor: "white",
        height: "18px",
        width: "300px",
        borderRadius: "20px 20px 0 0",
        padding: "8px",
        // border: "1px solid black",
        textAlign: "center",
        fontSize: "16px",
        fontWeight: "700",
        textTransform: "Uppercase",
        backdropFilter: "blur(5px)",

    },

    cardMain1: {
        borderRadius: "16px",
        border: "1px solid #d6d6d6ff",
        minHeight: "100px",
        minWidth: "300px",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        // padding: "10px",
        boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
        backgroundColor: "#f2f4ff"
    },

    cards: {
        borderRadius: "16px",
        border: "1px solid #d6d6d6ff",
        height: "54px",
        minWidth: "300px",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        padding: "1.6px",
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
        // padding: "10px",
        boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
        backgroundColor: "#f2f4ff"
    },

    titleCard: {
        fontSize: "16px",
        fontWeight: "600",
        textTransform: "Uppercase",
    },

    titleCard1: {
        fontSize: "14px",
        textTransform: "Uppercase",
        display: "flex",
        flexDirection: "column",
        margin: "12px",
        // backgroundColor: "#0c5bef1a",
        // width: "90%",
        // borderRadius: "10px"
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



export default EngineersHome;