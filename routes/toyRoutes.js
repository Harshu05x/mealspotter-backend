// routes/toyRoutes.js
const express = require("express");
const router = express.Router();
const toyController = require("../controllers/toyController");
const { jwtAuthMiddleware } = require("../middleware/jwtAuthMiddleware");
const multer  = require('multer');
const path = require("path");
const AWS = require("aws-sdk");
const multerS3 = require('multer-s3');


// Configure AWS credentials (replace with your actual values)
AWS.config.update({
    accessKeyId: process.env.S3_ACCESS,
    secretAccessKey: process.env.S3_SECRET,
    region: process.env.S3_REGION
});

const s3 = new AWS.S3();

// Configure Multer storage for direct S3 upload
const multerUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.BUCKET_NAME, // Replace with your bucket name
        acl: 'public-read', // Set access permissions (optional)
        contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically detect content type
        key: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname); // Customize file naming (optional)
        }
    }),
    limits: { fileSize: 1024 * 1024 * 1 }, // Set file size limit to 5MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb("Error: Images only (jpeg, jpg, png)");
        }
    }
});


// Define API routes for toys
router.get("/", jwtAuthMiddleware, toyController.getAllToys);
router.post("/", jwtAuthMiddleware, toyController.createToy);

// Update a toy by ID (protected with JWT auth)
router.put("/:id", jwtAuthMiddleware, toyController.updateToy);

//delete a toy by ID:
router.delete("/:id", jwtAuthMiddleware, toyController.deleteToy);

//upload toy images
router.post("/uploadImage",jwtAuthMiddleware, multerUpload.single('image'), toyController.uploadImages)

// toy history
router.post("/history", jwtAuthMiddleware, toyController.getToyHistory);

// update toys status in bulk
router.post("/updateStatus", jwtAuthMiddleware, toyController.updateToysStatus);

router.post("/getToyAvailablilty", jwtAuthMiddleware, toyController.getToyAvailablilty);

module.exports = router;
