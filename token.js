'use strict';

const jwt = require('jsonwebtoken');

function getJWToken(userPas, userLogin){
    let data = {
        time : Date(),
        userPas : userPas,
        userName : userLogin
    };

    return jwt.sign(data, 'diplomSecretToken');
}

exports.getJWToken = getJWToken;