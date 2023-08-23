const express = require('express');
const router = express.Router();
const { createItem } = require('../controller/ItemController')

router.post('/', createItem)

module.exports = router