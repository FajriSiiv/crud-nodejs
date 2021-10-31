const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/wpu", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// //menambahkan satu data
// const contact1 = new Contact({
//   nama: "Dudu si",
//   nohp: "0812319999",
//   email: "dudusi@gmail.com"
// });

// //simpan ke collection
// contact1.save().then(res => console.log(res));
