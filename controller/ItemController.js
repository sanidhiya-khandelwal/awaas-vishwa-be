const jwt = require('jsonwebtoken')//token1
const PropertyAd = require('../model/PropertyAd')
const sendEmail = require('../utility/email/email')
const UserModel = require('../model/UserModel')
const { getBuyerEnquiryEmailBody } = require('../utility/email/emailTemplates')
const EnquiryMailModel = require('../model/EnquiryMailModel')

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

const getItems = async (req, res) => {
    console.log('req.query', req.query);
    const pageNo = req.query.page;
    const type = req.query.type;
    console.log('type', type);
    const pageSize = 10;
    const skips = (pageNo - 1) * pageSize;
    const propertyAdList = await PropertyAd
        .find({ listType: type ? type : { $exists: true } })
        .sort({ _id: -1 })
        .skip(skips)
        .limit(pageSize);
    // const propertyAdList = await PropertyAd.find();
    let propertyAdListResponse = []

    for (const propertyAdItem of propertyAdList) {
        propertyAdListResponse.push({
            title: propertyAdItem.title,
            location: propertyAdItem.location,
            price: propertyAdItem.price,
            listType: propertyAdItem.listType,
            imgList: propertyAdItem.imgList,
            createdAt: propertyAdItem.createdAt,
            id: propertyAdItem._id,
        })
    }
    res.status(200).json({
        data: propertyAdListResponse
    })
}

const getItemDetails = async (req, res) => {
    // console.log(req.params);
    const { token } = req.cookies;
    console.log('req.cookies', req.cookies);
    const { itemId } = req.params;
    if (itemId == null || itemId == undefined || itemId.length == 0) {
        res.status(400).json({ error: 'invalid item id' })
        return;
    }
    try {
        // const PropertyAdDoc = await PropertyAd.findById(itemId);
        // const PropertyAdDoc = await PropertyAd.findById(itemId).populate('author', ['name', 'phone', 'email']);
        const PropertyAdDoc = await PropertyAd.findById(itemId).populate('author', ['name']);
        if (token) {
            // const tokenInfo = jwt.verify(token, process.env.JWT_SECRET);
            // userDoc = await UserModel.findById(tokenInfo.id);
            jwt.verify(token, process.env.JWT_SECRET, async (err, userInfo) => {
                if (err) {
                    res.status(401).json({ error: 'Unauthenticated' })
                    return;
                }
                userDoc = await UserModel.findById(userInfo.id);
                res.status(200).json({
                    data: {
                        ...PropertyAdDoc._doc,
                        edit: userDoc?._id?.toString() === PropertyAdDoc?.author?._id.toString() ? true : false
                    }
                });
            });

        } else {
            res.status(200).json({
                data: {
                    ...PropertyAdDoc._doc,
                    edit: false
                }
            });
        }
        // console.log('userDoc._id', userDoc._id);
        // console.log('PropertyAdDoc.author._id', PropertyAdDoc.author._id);
        // console.log(userDoc._id == PropertyAdDoc.author._id);
        // console.log(userDoc._id.toString() == PropertyAdDoc.author._id.toString());

    } catch (err) {
        res.status(400).json({ error: 'Something Went Wrong' })
        return;
    }
}

const postLead = async (req, res) => {
    const token = req.cookies.token;
    const { itemId } = req.body;
    // console.log(itemId);
    if (!token) {
        res.status(401).json({ error: 'Invalid user' })
        return
    }
    if (!itemId) {
        res.status(400).json({ error: 'Invalid ItemId' })
        return
    }
    try {
        const tokenInfo = jwt.verify(token, process.env.JWT_SECRET);
        // console.log('token info', tokenInfo);

        const sendUserDoc = await UserModel.findById(tokenInfo.id); //Buyer info
        // console.log('Buyer info', sendUserDoc);

        const propertyAdDoc = await PropertyAd.findById(itemId);
        // console.log('propertyAdDoc', propertyAdDoc);
        const receiverDocId = propertyAdDoc.author.toString();
        // console.log('receiverDocId', receiverDocId);
        const receiverUserDoc = await UserModel.findById(receiverDocId);
        // console.log('receiverUserDoc', receiverUserDoc);

        // const enquiryMailDoc=
        const enquiryMailDoc = await EnquiryMailModel.findOne({
            propertyAdId: itemId,
            sendersId: sendUserDoc._id,
            receiverId: receiverUserDoc._id
        })
        if (enquiryMailDoc) {
            res.status(400).json({ error: 'Already Sent Interest' })
        }

        // const emailBody = getBuyerEnquiryEmailBody(receiverUserDoc.name, itemId, sendUserDoc.name, sendUserDoc.email, sendUserDoc.phone)
        // console.log(emailBody)
        // sendEmail(to,subject,body)
        sendEmail(
            receiverUserDoc.email,
            'An interested Lead for your property - Awaas Vishwa',
            getBuyerEnquiryEmailBody(receiverUserDoc.name, itemId, sendUserDoc.name, sendUserDoc.email, sendUserDoc.phone)
        );
        const enquiryMailDocNew = await EnquiryMailModel.create({
            propertyAdId: itemId,
            sendersId: sendUserDoc._id,
            receiverId: receiverUserDoc._id

        })
        // console.log('4');
        // console.log(enquiryMailDocNew);

        res.status(201).json({ success: 'Interest shared with the owner' })
    }
    catch (err) {
        res.status(500).json({ error: 'Someting went wrong' })
    }
}

const editItem = async (req, res) => {
    const { itemId } = req.params;
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
    try {
        jwt.verify(token, process.env.JWT_SECRET, async (err, userInfo) => {
            if (err) {
                res.status(401).json({ error: 'token expired' })
                return;
            }
            const propertyAdDoc = await PropertyAd.findById(itemId).populate('author', ['name']);
            if (!propertyAdDoc) {
                res.status(400).json({ error: 'invalid item id' })
                return;
            }
            if (!(userInfo.id == propertyAdDoc?.author?._id.toString())) {
                res.status(403).json({ error: 'Permission denied' })
                return;
            }
            propertyAdDoc.title = title;
            propertyAdDoc.location = location;
            propertyAdDoc.price = price;
            propertyAdDoc.description = description;
            propertyAdDoc.imgList = imgList;
            propertyAdDoc.listType = listType;

            propertyAdDoc.save();

            res.status(200).json({
                success: 'Ad  Updated',
                data: propertyAdDoc
            })
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" })
    }
}


module.exports = { createItem, getItems, getItemDetails, postLead, editItem };