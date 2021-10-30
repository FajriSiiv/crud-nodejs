const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const methodOverrider = require("method-override");

require("./utils/db");
const Contact = require("./model/contact");

const app = express();
const port = process.env.PORT || 3000;

//setup method override
app.use(methodOverrider("_method"));

const { body, validationResult, check } = require("express-validator");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

//view-engine
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//config flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: {
      maxAge: 6000
    },
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);
app.use(flash());

//home
app.get("/", (req, res) => {
  const orang = [
    {
      nama: "Muhammad fajri",
      email: "fajri@gmail.com"
    },
    {
      nama: "Siiv",
      email: "fajri@gmail.com"
    },
    {
      nama: "Kolang",
      email: "fajri@gmail.com"
    }
  ];

  res.render("index", {
    layout: "layout/main-layout.ejs",
    nama: "Muhammad Fajris",
    title: "Express JS",
    orang
  });
});

//hal about
app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layout/main-layout.ejs",
    title: "About"
  });
});

//hal contact
app.get("/contact", async (req, res) => {
  const contacts = await Contact.find();

  res.render("contact", {
    layout: "layout/main-layout.ejs",
    title: "Contact",
    contacts: contacts,
    msg: req.flash("msg")
  });
});

//tambah data contact
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Form tambah data contact",
    layout: "layout/main-layout"
  });
});

app.post(
  "/contact",
  [
    body("nama").custom(async value => {
      const duplikat = await Contact.findOne({ nama: value });
      if (duplikat) {
        throw new Error("Nama contact sudah terdaftar!");
      }

      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("nohp", "Nomer HP tidak valid!").isMobilePhone("id-ID")
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        title: "Form tambah data contact",
        layout: "layout/main-layout",
        errors: errors.array()
      });
    } else {
      Contact.insertMany(req.body, (err, result) => {
        //kirimkan flash massage
        req.flash("msg", "Data berhasil di tambahkan!");
        res.redirect("/contact");
      });
    }
  }
);

//proses delete contact
// app.get("/contact/delete/:nama", async (req, res) => {
//   const contact = await Contact.findOne({ nama: req.params.nama });

//   //jika tidak ada
//   if (!contact) {
//     res.status(404);
//     res.send(`<h1>404</h1>`);
//   } else {
//     Contact.deleteOne({ _id: contact._id }).then(rest => {
//       req.flash("msg", "Data berhasil dihapus!");
//       res.redirect("/contact");
//     });
//   }
// });
app.delete("/contact", (req, res) => {
  Contact.deleteOne({ nama: req.body.nama }).then(rest => {
    req.flash("msg", "Data berhasil dihapus!");
    res.redirect("/contact");
  });
});

//ubah data contact
app.get("/contact/edit/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render("edit-contact", {
    title: "Form ubah data contact",
    layout: "layout/main-layout",
    contact: contact
  });
});

//proses ubah data
app.put(
  "/contact",
  [
    body("nama").custom(async (value, { req }) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (value !== req.body.oldNama && duplikat) {
        throw new Error("Nama contact sudah terdaftar!");
      }

      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("nohp", "Nomer HP tidak valid!").isMobilePhone("id-ID")
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "Form ubah data contact",
        layout: "layout/main-layout",
        errors: errors.array(),
        contact: req.body
      });
    } else {
      Contact.updateOne(
        { _id: req.body._id },
        {
          $set: {
            nama: req.body.nama,
            email: req.body.email,
            nohp: req.body.nohp
          }
        }
      ).then(result => {
        //kirimkan flash massage
        req.flash("msg", "Data berhasil diubah!");
        res.redirect("/contact");
      });
    }
  }
);

//detail contact
app.get("/contact/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  console.log(contact);
  res.render("detail", {
    layout: "layout/main-layout.ejs",
    title: "Detail Contact",
    contact
  });
});

app.use((req, res) => {
  res.status(404);
  res.send(`<h1>404</h1>`);
});

app.listen(port, () => {
  console.log(`Mongo Contact App | Listening at localhost:${port}`);
});
