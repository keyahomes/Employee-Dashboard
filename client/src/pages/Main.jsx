import { useNavigate } from 'react-router-dom';


const sites = [
    {
        id: 'OFFICE',
        name: 'OFFICE',
    },
    {
        id: 'SALES',
        name: 'SALES',
    },
    {
        id: 'ENGINEERS',
        name: 'ENGINEERS',
    },

];

export default function Main() {
    const navigate = useNavigate();

    const handleCardClick = (clickedSiteId) => {
        const isLoggedInForSite = localStorage.getItem(`isLoggedIn_${clickedSiteId}`) === 'true';

        // Always update the selected projectId
        localStorage.setItem('siteId', clickedSiteId);
        console.log("Stored siteId:", localStorage.getItem("siteId"));

        if (isLoggedInForSite) {
            // Navigate to respective home page
            switch (clickedSiteId) {
                case 'OFFICE':
                    navigate('/officehome');
                    break;
                case 'SALES':
                    navigate('/saleshome');
                    break;
                case 'ENGINEERS':
                    navigate('/engineershome');
                    break;
                default:
                    navigate('/');
            }
        } else {
            // Not logged in for this project — go to login
            navigate('/login');
        }
    };



    return (
        <div style={styles.homeContainer}>
            <div id='topbar' style={styles.topbar}>
                <div style={styles.topbarContainer1}>
                    <div style={styles.topbarContainer2}>
                        <img
                            src="https://keyahomes.co.in/forms/static/media/keya_homes_logo.ae8e4b7c7c37a705231c.webp"
                            alt="Keya Homes"
                            height="50px"
                            className='logo'
                        />
                    </div>
                    <h4 style={styles.titleContainer}></h4>
                </div>
            </div>

            <div style={styles.heroSession}>
                <div style={styles.heroContent}>
                    <h1 style={styles.heroTitle}>Keya Homes Employee Dashboard</h1>
                </div>
            </div>

            <div style={styles.cardsContainer}>
                {sites.map((site) => (
                    <div style={styles.navCardWrapper}
                         key={site.id}
                         onClick={() => handleCardClick(site.id)}
                    >
                        <div style={styles.navCard} >
                            <div style={styles.cardTitle}>{site.name}</div>
                        </div>

                    </div>
                ))}
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
            rgba(118, 75, 162, 0.1) 100%
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
        padding: "5px",
    },

    topbarContainer1: {
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",        // d-flex
        alignItems: "center",
        justifyContent: "space-between", // md and above
    },

    topbarContainer2: {
        flex: "0 0 auto",
        width: "1200px",        // col-md-1
        minWidth: "80px",       // prevents logo collapse
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start", // md+

    },

    titleContainer: {
        flex: "1",                 // col-md-11
        display: "flex",
        alignItems: "center",
        justifyContent: "center",  // center on md+
        color: "rgb(142, 177, 35)",
        textAlign: "center",
        textTransform: "uppercase",
    },

    heroSession: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "20vh",
        minWidth: "90vw",
        // padding: "0.5rem",
        marginTop: "1rem",
        textAlign: "center",
        position: "relative",
        zIndex: "1",
        margin: "2px"
    },

    heroContent: {
        background: "rgba(255, 255, 255, 0.61)",
        backdropFilter: "blur(2px)",
        borderRadius: "20px",
        padding: "0.1rem 0.5rem",
        marginTop: "1rem",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        maxWidth: "100vw",
        // animation: "fadeInUp 0.8s ease-out",
        position: "relative",
        overflow: "hidden",
    },

    heroTitle: {
        fontSize: "1.9rem",
        fontWeight: "800",
        color: " #052866",
        /* margin-bottom: 1rem; */
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)",
        backgroundSize: "200% 200%",
        webkitBackgroundClip: "text",
        webkitTextFillColor: "transparent",
        backgroundClip: "text",
        position: "relative",
        zIndex: "2",
    },

    navCard: {
        marginTop:"50px",
        background: "#ffffff",
        // backdropFilter: "blur(5px)",
        borderRadius: "20px",
        // padding: "1.5rem",
        width: "100%",
        maxWidth: "250px",
        minHeight: "100px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
        cursor: "pointer",
        // transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        border: "1px solid #164493",
        // backdropFilter: "blur(10px)",
        
    },

    cardTitle: {
        color: "#164493",
        fontSize: "1.5rem",
        fontWeight: "700",
        textAlign: "center",
        marginBottom: "0.5rem",
        position: "relative",
        zIndex: "2",
        textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
    },

    cardsContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "1.5rem",
        padding: "0.5rem",
        maxWidth: "100vw",
        margin: "0 auto",
        position: "relative",
        zIndex: "1",
        marginTop: "1rem",
    },

    navCardWrapper: {
        display: "flex",
        justifyContent: "center",
    },

};
