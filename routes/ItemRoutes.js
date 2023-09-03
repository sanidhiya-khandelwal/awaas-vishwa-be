const express = require('express');
const router = express.Router();
const { createItem, getItems, getItemDetails } = require('../controller/ItemController')

router.post('/', createItem)
router.get('/', getItems)
router.get('/:itemId', getItemDetails)

module.exports = router
