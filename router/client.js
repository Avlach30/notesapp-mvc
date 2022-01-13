const express = require('express');

const clientController = require('../controller/client');

const router = express.Router();

router.get('/', clientController.getIndex);

router.get('/about', clientController.getAbout);

module.exports = router;
