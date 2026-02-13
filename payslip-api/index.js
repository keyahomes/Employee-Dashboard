const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// ✅ Cloud-Run compatible Puppeteer
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.send("Payslip backend running 🚀");
});

/**
 * Generate Payslip (MATCHES LOCAL LOGIC)
 */
app.post("/generate-payslip", async (req, res) => {
  try {
    let { site, empId, month, year } = req.body;

    // 🔒 Validation
    if (!site || !empId || !month || !year) {
      return res.status(400).send("Missing fields");
    }

    // 🔁 FORCE month to number (important!)
    month = Number(month); // frontend MUST send 1–12
    const salaryKey = `${month}-${year}`;

    // 🔹 Month name (same as local)
    const monthName = new Date(2024, month - 1)
      .toLocaleString("default", { month: "long" });

    const db = admin.database();

    // 🔹 Fetch user data
    const userSnap = await db.ref(`${site}/Users/${empId}`).once("value");
    const user = userSnap.val();

    // 🔹 Fetch salary data
    const salSnap = await db.ref(`${site}/Salary/${empId}/${salaryKey}`).once("value");
    const sal = salSnap.val();

    if (!user || !sal) {
      return res.status(404).send("Data not found");
    }

    // 🔹 Load HTML template
    let html = fs.readFileSync(
      path.join(__dirname, "payslip.html"),
      "utf8"
    );

    // 🔹 Format DOJ (same as local)
    const formatDate = (dateString) => {
      if (!dateString) return "";
      if (typeof dateString === "string" && dateString.includes("/")) {
        const [dd, mm, yyyy] = dateString.split("/");
        return `${dd}-${mm}-${yyyy}`;
      }
      return dateString;
    };

    const formattedDOJ = formatDate(user.DOJ);

    // 🔹 Inject values (MATCH LOCAL NAMES)
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
      .replace("{{reimbursement}}", sal.Reimbursement)
      .replace("{{pt}}", sal.PT)
      .replace("{{pfDeduction}}", sal.PF)
      .replace("{{lwf}}", sal.LWF)
      .replace("{{totalEarnings}}", sal.Total_Earnings)
      .replace("{{totalDeductions}}", sal.Total_Deduction)
      .replace("{{netPay}}", sal.Net_Pay)
      .replace("{{netPayWords}}", sal.Net_Pay_in_Words);

    // 🔹 Launch Chromium (Cloud-Run safe)
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport
    });


    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true
    });

    await browser.close();

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=payslip.pdf"
    );
    res.contentType("application/pdf");
    res.send(pdf);

  } catch (err) {
    console.error("Payslip error:", err);
    res.status(500).send("Failed");
  }
});

// 🔥 Export Cloud Function
exports.api = onRequest(
  {
    memory: "1GiB",
    timeoutSeconds: 120,
    region: "us-central1"
  },
  app
);

