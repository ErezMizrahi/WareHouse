const express = require('express');
const cors = require('cors');
const monk = require('monk');
const dateFormat = require('dateformat');
// const uplodaer = require('express-fileupload');
var XLSX = require('xlsx');
var path = require('path'); //used for file path
var fs = require('fs'); //used for file path
// const multer = require('multer');
const app = express();

var multer = require('multer');
// var upload = multer({ dest: 'uploads/' })

var storage = multer.diskStorage({
  destination: './uploads',
  filename: function (req, file, cb) {
    //req.body is empty...
    //How could I get the new_file_name property sent from client here?
    cb(null, 'data-' + '.xlsx');
  },
});

const upload = multer({
  storage: storage,
});

const db = monk(process.env.MONGO_URI || 'localhost/itamarWareshouse');
db.catch(function (err) {
  console.log(err);
});
const savedItems = db.get('savedItems');

app.use(cors());
app.use(express.json());
// app.use(uplodaer());
app.use(express.static('public'));

app.use('/uploads', express.static('uploads'));

//routes

app.get('/test/', (req, res) => {
  res.json({
    message: 'it works',
  });
});

app.get('/items/', (req, res) => {
  savedItems.find().then((items) => {
    res.json(items);
  });
});

app.get('/items/:query', (req, res) => {
  console.log(req.params.query);
  savedItems.find({ name: req.params.query }).then((items) => {
    res.json(items);
  });
});

app.post('/items', (req, res) => {
  if (isValidItem(req.body)) {
    // add to db
    const item = {
      name: req.body.name.toString(),
      ammount: req.body.ammount.toString(),
      location: req.body.location.toString(),
      createdAt: dateFormat(Date(), 'shortDate'),
    };

    savedItems.insert(item).then((createdItem) => {
      res.json(createdItem);
    });
  } else {
    res.status(422);
    res.json({
      message: 'invalid item data',
    });
  }
});

app.post('/excel', upload.single('excelFile'), (req, res) => {
  console.log(req.file.path);
  const pa = req.file.path;
  if (req.file) {
    //     let file = req.files.excelFile;
    //     let fileName = 'data.xlsx';

    //     console.log(path.dirname('uploads/' + fileName));
    //     // file.mv(__dirname + '/uploads/' + fileName, (error)=> {
    //         file.mv(path.join('uploads/', fileName), (error)=> {
    //             if (error) {
    //             console.log(error);
    //             res.send(error);
    //         } else {
    savedItems.remove();
    const referer = req.get('referer');
    saveExcelToDB(res, pa, referer);
    //             //res.send('file was uploaded');
    //         }
    //     });
  }
  res.status(200);
});

app.post('/update', (req, res) => {
  console.log(req.body);
  savedItems.findOneAndUpdate(
    { _id: req.body.id },
    { $set: { name: req.body.name, location: req.body.location } },
    { upsert: true }
  );
  res.json({
    message: 'ds',
  });
});

const port = 5500;

//start at port
app.listen(port, () => {
  console.log(`lisiting on port ${port}`);
});

//data validation
function isValidItem(body) {
  return (
    body.name &&
    body.name.toString().trim() !== '' &&
    body.ammount &&
    body.ammount.toString().trim() !== '' &&
    body.location &&
    body.location.toString().trim() !== ''
  );
}

function saveExcelToDB(res, pa, referer) {
  console.log(pa + 'passss');
  var workbook = XLSX.readFile(pa);
  var sheet_name_list = workbook.SheetNames;
  var JSONData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

  var jsonLowercase = JSONData.map((data) => {
    var mapped = {};
    for (var key in data) {
      mapped[key.toLowerCase()] = data[key];
    }

    return mapped;
  });

  console.log(jsonLowercase);

  savedItems.insert(jsonLowercase).then(() => {
    res.redirect(referer);
  });
}
