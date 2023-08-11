const bcrypt = require('bcryptjs') //bcrypt 1
const jwt = require('jsonwebtoken'); //jwt 1
const User = require('../model/UserModel');
const cookieParser = require('cookie-parser')


const salt = bcrypt.genSaltSync(10); //bcrypt 2

const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const usernameFormat = /^[A-Za-z][A-Za-z0-9_]{1,29}$/
const passwordFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;



const registerUser = async (req, res) => {

    const { name, phone, email, username, password } = req.body;

    //validations
    if (name.length < 2 || name.length > 50) {
        //converted response to json object
        res.status(400).json('Name should be greater than 1 and less than equal to 50 characters')
        return;
    }
    if (phone < 1000000000) {
        res.status(400).json('Invalid Phone Number')
        return
    }
    if (!mailformat.test(email)) {
        res.status(400).json('Invalid Email Address')
        return
    }
    if (!usernameFormat.test(username)) {
        res.status(400).json('Invalid username! first character should be alphabet [A-Za-z] and other characters can be alphabets, numbers or an underscore so, [A-Za-z0-9_].')
        return
    }
    if (!passwordFormat.test(password)) {
        res.status(400).json('password should have minimum of eight characters, at least one uppercase letter, one lowercase letter, one number and one special character:')
        return;
    }

    //save into database
    try {

        const userByEmail = await User.findOne({ email: email });//to check in db if user with same email exists then show alert
        if (userByEmail) {
            res.status(400).json('Email already exists');
            return;
        }

        const userByUsername = await User.findOne({ username: username });//to check in db if user with same username exists then show alert
        if (userByUsername) {
            res.status(400).json('User with same username already exists');
            return;
        }



        const userDoc = await User.create({
            name,
            phone,
            email,
            username,
            password: bcrypt.hashSync(password, salt)
        });
        res.status(201).json(userDoc);
    }
    catch (err) {
        res.status(400).json({ error: 'Bad Request' });
    }

}

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!usernameFormat.test(username)) {
        res.status(400).json('Invalid username! first character should be alphabet [A-Za-z] and other characters can be alphabets, numbers or an underscore so, [A-Za-z0-9_].')
        return
    }
    if (!passwordFormat.test(password)) {
        res.status(400).json('password should have minimum of eight characters, at least one uppercase letter, one lowercase letter, one number and one special character:')
        return;
    }
    try {
        const userDoc = await User.findOne({ username })
        if (!userDoc) {
            res.status(400).json({ error: 'Incorrect Username' })
            return;
        }
        const isPasswordCorrect = bcrypt.compareSync(password, userDoc.password)
        if (!isPasswordCorrect) {
            res.status(400).json({ error: 'Incorrect Password' })
            return;
        }
        //const token = jwt.sign({ id: userDoc._id }, 'fvshfkhsfkshfkhfksdkfsfhlsflsshfhklshfn', { expiresIn: '1h' }) //jwt2
        const token = jwt.sign({ id: userDoc._id }, process.env.JWT_SECRET, { expiresIn: '1h' }) //jwt2
        // console.log('token ', token);
        // res.status(200).end(token)
        // res.status(200).json({ success: 'User Logged in' })
        // res.cookie('token', token, { httpOnly: true }).status(200).json({ success: 'User Logged in' })

        res.cookie('token', token, { httpOnly: true }).status(200).json({
            success: 'User Logged in',
            data: {
                userId: userDoc._id,
                username: userDoc.username
            }

        })
    }
    catch (err) {
        res.end('err')
    }

    // console.log(req.body);
    // res.json('done')
}

const logoutUser = (req, res) => {
    res.clearCookie('token').status(200).json({ success: "User Logged Out" })
}

module.exports = { registerUser, loginUser, logoutUser }