const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
const fs = require("fs");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

// Firebase Admin
const serviceAccount = require("./serviceKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://employee-dashboard-bac9a-default-rtdb.firebaseio.com/"
});

const db = admin.database();

// API
app.post("/api/payslip", async (req, res) => {
    try {
        const { site, empId, month, year } = req.body;
        const key = `${month}-${year}`;

        const monthName = new Date(2024, month - 1).toLocaleString("default", { month: "long" });

        const userSnap = await db.ref(`${site}/Users/${empId}`).once("value");
        const user = userSnap.val();

        const salSnap = await db.ref(`${site}/Salary/${empId}/${key}`).once("value");
        const sal = salSnap.val();

        if (!user || !sal) {
            return res.status(404).send("Data not found");
        }

        let html = fs.readFileSync("payslip.html", "utf8");

        // Format DOJ from dd/mm/yyyy to proper display format
        const formatDate = (dateString) => {
            if (!dateString) return "";
            
            // Handle dd/mm/yyyy format
            if (typeof dateString === "string" && dateString.includes("/")) {
                const parts = dateString.split("/");
                const day = parts[0];
                const month = parts[1];
                const year = parts[2];
                
                // Return in dd-mm-yyyy format for display
                return `${day}-${month}-${year}`;
            }
            
            return dateString;
        };

        const formattedDOJ = formatDate(user.DOJ);

        html = html
            .replace("{{month}}", monthName)
            .replace("{{year}}", year)
            .replace("{{empId}}", empId)
            .replace("{{name}}", user.Employee_Name)
            .replace("{{designation}}", sal.Designation)
            .replace("{{department}}", user.Department)
            .replace("{{doj}}", formattedDOJ)
            .replace("{{uan}}", sal.UAN_Number)
            .replace("{{pfN}}", sal.PF_Number)
            .replace("{{bank}}", sal.Bank_Name)
            .replace("{{account}}", sal.Account_Number)
            .replace("{{grossWages}}", sal.Gross_Wages)
            .replace("{{totalWorkingDays}}", sal.Total_Working_Days)
            .replace("{{leave}}", sal.Leave_Taken)
            .replace("{{lopDays}}", sal.LOP_Days)
            .replace("{{paidDays}}", sal.Paid_Days)
            .replace("{{basic}}", sal.Basic)
            .replace("{{hra}}", sal.HRA)
            .replace("{{special}}", sal.Special_Allowance)
            .replace("{{medical}}", sal.Medical_Allowance)
            .replace("{{conveyance}}", sal.Conveyance_Allowance)
            .replace("{{pt}}", sal.PT)
            .replace("{{pfDeduction}}", sal.PF)
            .replace("{{lwf}}", sal.LWF)
            .replace("{{totalEarnings}}", sal.Total_Earnings)
            .replace("{{totalDeductions}}", sal.Total_Deduction)
            .replace("{{netPay}}", sal.Net_Pay)
            .replace("{{netPayWords}}", sal.Net_Pay_in_Words);

        const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });

        const page = await browser.newPage();
        await page.setContent(html);
        const pdf = await page.pdf({ format: "A4" });
        await browser.close();

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=payslip.pdf"
        );
        res.contentType("application/pdf");
        res.send(pdf);

    } catch (err) {
        console.error(err);
        res.status(500).send("Failed");
    }
});

app.listen(5000, () => {
    console.log("Backend running on http://localhost:5000");
});