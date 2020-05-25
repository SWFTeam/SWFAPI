const jwt = require('jsonwebtoken');

const JWT_KEY = process.env.JWT_KEY || 'secret';
const JWT_EXPIRY = 24 * 60 * 60;

const log = console.log;

function _makeToken(id){
  return jwt.sign({ id }, JWT_KEY, { expiresIn: JWT_EXPIRY })
}

async function _authenticateToken(token){
  try{
    return jwt.verify(token, JWT_KEY);
  }catch(e){
    log(e);
  }
}

module.exports = {
    make: _makeToken,
    authenticate: _authenticateToken
}