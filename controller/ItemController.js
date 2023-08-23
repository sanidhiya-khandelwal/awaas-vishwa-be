const jwt = require('jsonwebtoken')//token1
const PropertyAd = require('../model/PropertyAd')

const createItem = async (req, res) => {

    const token = req.cookies.token;//token2
    if (!token) {//token3
        res.status(401).json({ error: 'Invalid User' })
    }

    const { title, location, price, description, imgList, listType } = req.body;

    if (title.length < 5 || title.length > 100) {
        res.status(400).json({ error: 'title length should be greater than equals to 5 and less equals to 100 characters' })
        return
    }
    if (location.length < 3 || location.length > 100) {
        res.status(400).json({ error: 'location length should be greater than equals to 3 and less equals to 100 characters' })
        return
    }
    if (price < 0 || price > 1000000000) {
        res.status(400).json({ error: 'price should be greater than 0 and less than 100,00,00,000' })
        return
    }
    if (description.length > 1000) {
        res.status(400).json({ error: 'description length should be less than 1000 characters' })
        return
    }
    if (!listType) {
        res.status(400).json({ error: 'please select the list type' })
        return
    }

    // if (files.length > 10) {
    //     alert('Maximum 10 images are allowed to be uploaded')
    // return;
    // }


    // res.status(200).end('Hi')
    try {
        const tokenInfo = jwt.verify(token, process.env.JWT_SECRET);//token4
        console.log('token', tokenInfo);
        const PropertyAdDoc = await PropertyAd.create({
            title,
            location,
            price,
            description,
            imgList,
            listType,
            author: tokenInfo.id //token5
        })
        // res.status(201).json(PropertyAdDoc)
        res.status(201).json({
            success: "Ad Created",
            data: PropertyAdDoc
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" })
    }
}
module.exports = { createItem }