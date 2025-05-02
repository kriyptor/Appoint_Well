const crypto = require('crypto');
require('dotenv').config();

const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

const encrypt = (text) => {
const sanatizedText = text.trim();
if (sanatizedText.length === 0) {
    throw new Error('Input text cannot be empty');
}
  const iv = crypto.randomBytes(16); 
  const cipher = crypto.createCipheriv(process.env.ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(sanatizedText), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}


const decrypt = (hash) => {
    const [ivHex, encryptedHex] = hash.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(process.env.ALGORITHM, key, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString();
}

const comparePassword = (password, hashedPassword) => {
   const storedPassword = decrypt(hashedPassword);
   return password === storedPassword;
}


module.exports = {
  encrypt,
  decrypt,
  comparePassword
}