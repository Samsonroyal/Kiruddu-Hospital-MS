const User = require("../models/user");
const Doctor = require("../models/doctor");
const Patient = require("../models/patient");

const crypto = require('crypto');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');

/**
 * 
 * 
 * const OAuth2 = google.auth.OAuth2;
// Create an OAuth2 client with your credentials
const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    'https://developers.google.com/oauthplayground' // Redirect URI
);

oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
});

// Generate an access token
const accessToken = oauth2Client.getAccessToken();

// Create a nodemailer transporter using OAuth2
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        accessToken,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN
    }
});

const isUserValid = (newUser) => {
    // Your validation code remains unchanged
};

const saveVerificationToken = async (userId, verificationToken) => {
    // Your saveVerificationToken function remains unchanged
};

const generateVerificationToken = () => {
    // Your generateVerificationToken function remains unchanged
};

// Send an email with a verification link
const sendVerificationEmail = async (email, token) => {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Verify your email address',
        text: `Please click the following link to verify your email address: http://localhost:3001/verify/${token}`,
        html: `<p>Please click this link to verify your account:</p> <a href="http://localhost:3001/verify/${token}">Verify</a>`,
    };

    let resp = await transporter.sendMail(mailOptions);
    return resp;
};

module.exports = async (req, res) => {
    const newUser = req.body;

    const userValidStatus = isUserValid(newUser);
    if (!userValidStatus.status) {
        res.json({ message: "error", errors: userValidStatus.errors });
    } else {
        try {
            const userDetails = await User.create({
                email: newUser.email,
                username: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                password: newUser.password,
                userType: newUser.userType,
            });

            let verificationToken = generateVerificationToken();
            await saveVerificationToken(userDetails._id, verificationToken);

            if (newUser.userType === "Doctor") {
                await Doctor.create({
                    userId: userDetails._id,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email,
                    username: newUser.email
                });
            } else if (newUser.userType === "Patient") {
                await Patient.create({
                    userId: userDetails._id,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email,
                    username: newUser.email
                });
            }

            let resp = await sendVerificationEmail(userDetails.email, verificationToken.token);
            res.json({ message: "success" });
        } catch (error) {
            res.json({ message: "error", errors: [error.message] });
        }
    }
};


 * 
 * 
 * 
 */


const isUserValid = (newUser) => {
    const errorList = [];
    const nameRegex = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!newUser.firstName) {
        errorList.push('Please enter first name');
    } else if (!nameRegex.test(newUser.firstName)) {
        errorList.push('First name is invalid');
    }
    if (!newUser.lastName) {
        errorList.push('Please enter last name');
    } else if (!nameRegex.test(newUser.lastName)) {
        errorList.push('Last name is invalid');
    }

    if (!newUser.email) {
        errorList.push("Please enter email");
    } else if (!emailRegex.test(newUser.email)) {
        errorList.push("Invalid email format");
    }

    if (!newUser.password) {
        errorList.push("Please enter password");
    }
    // else if (!passwordRegex.test(newUser.password)) {
    //     errorList.push(
    //         "Password should be at least 8 characters long and contain at least one letter and one number"
    //     );
    // }

    if (!newUser.confirmPassword) {
        errorList.push("Please re-enter password in Confirm Password field");
    }

    if (!newUser.userType) {
        errorList.push("Please enter User Type");
    }

    if (newUser.password !== newUser.confirmPassword) {
        errorList.push("Password and Confirm Password did not match");
    }

    if (errorList.length > 0) {
        return { status: false, errors: errorList };
    } else {
        return { status: true };
    }
};

const saveVerificationToken = async (userId, verificationToken) => {
    await User.findOneAndUpdate({ _id: userId }, { "verificationToken": verificationToken });
    return;
}

const generateVerificationToken = () => {
    const token = crypto.randomBytes(64).toString('hex');
    const expires = Date.now() + 3 * 60 * 60 * 1000; // 3 hours from now
    let verificationToken = {
        "token": token,
        "expires": expires
    };
    return verificationToken;
};

// Send an email with a verification link
const sendVerificationEmail = async (email, token) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Verify your email address',
        text: `Please click the following link to verify your email address: http://localhost:3001/verify/${token}`,
        html: `<p>Please click this link to verify your account:</p> <a href="http://localhost:3001/verify/${token}">Verify</a>`,
    };

    let resp = await transporter.sendMail(mailOptions);
    return resp;
};

const signUp = (req, res) => {
    const newUser = req.body;

    const userValidStatus = isUserValid(newUser);
    if (!userValidStatus.status) {
        res.json({ message: "error", errors: userValidStatus.errors });
    } else {
        User.create(
            {
                email: newUser.email,
                username: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                password: newUser.password,
                userType: newUser.userType,
            },
            (error, userDetails) => {
                if (error) {
                    res.json({ message: "error", errors: [error.message] });
                } else {
                    let verificationToken = generateVerificationToken()
                    saveVerificationToken(userDetails._id, verificationToken);

                    if (newUser.userType === "Doctor") {
                        Doctor.create(
                            {
                                userId: userDetails._id,
                                firstName: newUser.firstName,
                                lastName: newUser.lastName,
                                email: newUser.email,
                                username: newUser.email
                            },
                            (error2, doctorDetails) => {
                                if (error2) {
                                    User.deleteOne({ _id: userDetails });
                                    res.json({ message: "error", errors: [error2.message] });
                                } else {
                                    let resp = sendVerificationEmail(userDetails.email, verificationToken.token);
                                    res.json({ message: "success" });
                                }
                            }
                        );
                    }
                    if (newUser.userType === "Patient") {
                        Patient.create(
                            {
                                userId: userDetails._id,
                                firstName: newUser.firstName,
                                lastName: newUser.lastName,
                                email: newUser.email,
                                username: newUser.email
                            },
                            (error2, patientDetails) => {
                                if (error2) {
                                    User.deleteOne({ _id: userDetails });
                                    res.json({ message: "error", errors: [error2.message] });
                                } else {
                                    let resp = sendVerificationEmail(userDetails.email, verificationToken.token);
                                    res.json({ message: "success" });
                                }
                            }
                        );
                    }
                }
            }
        );
    }
};

const verifyUser = (req, res) => {
    const token = req.params.id;
    const verifyEmail = async (token) => {
        const user = await User.findOneAndUpdate({
            'verificationToken.token': token,
            'verificationToken.expires': { $gt: Date.now() } // Check that the token has not expired
        }, {
            "activated": true,
            "verificationToken.token": null
        });

        if (!user) {
            console.log("Email could not be verified");
            res.status(500).json({ message: 'Error verifying account' });
        }
        else {
            console.log("Email verified");
            res.send("Email verified");
        }
    };
    verifyEmail(token);
}

module.exports = {
    signUp   
}
