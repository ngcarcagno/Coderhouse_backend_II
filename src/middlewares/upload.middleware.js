const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const originalName = `img-${req.params.id}-${file.originalname}`;
    // Lo guardamos en el objeto req.query para usarlo en el controlador
    req.query.filename = originalName;
    cb(null, originalName);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
