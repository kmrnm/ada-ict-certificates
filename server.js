const express = require("express");
const PDFDocument = require("pdfkit");
const path = require("path");
const students = require("./students.json");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/templates", express.static("templates"));
app.use(express.urlencoded({ extended: true }));

function findStudent(id) {
  return students.find((student) => student.id === id);
}

app.get("/", (req, res) => {
  res.render("index", { students });
});

app.post("/certificate", (req, res) => {
  const student = findStudent(req.body.studentId);

  if (!student) {
    return res.status(404).send("Student not found.");
  }

  res.redirect(`/certificate/${student.id}`);
});

app.get("/certificate/:id", (req, res) => {
  const student = findStudent(req.params.id);

  if (!student) {
    return res.status(404).send("Certificate not found.");
  }

  const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;

  res.render("certificate", { student, appUrl });
});

app.get("/certificate/:id/download", (req, res) => {
  const student = findStudent(req.params.id);

  if (!student) {
    return res.status(404).send("Certificate not found.");
  }

  const doc = new PDFDocument({
    size: [1748, 1240],
    margin: 0
  });

  const safeName = student.name.replaceAll(" ", "_");
  const fileName = `${safeName}_certificate.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

  doc.pipe(res);

  const templatePath = path.join(__dirname, "templates", "certificate-empty.png");

  doc.image(templatePath, 0, 0, {
    width: 1748,
    height: 1240
  });

  doc
    .font("Times-Italic")
    .fontSize(117)
    .fillColor("#c98624")
    .text(student.name, 0, 562, {
      align: "center",
      width: 1748
    });

  doc.end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
