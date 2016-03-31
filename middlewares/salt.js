var crypto = require("crypto");


// md5
exports.md5 = function md5(str) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
}


// 加密
exports.encrypt = function(str, secret){
	var cipher = crypto.createCipher("aes192", secret);
	var enc = cipher.update(str, "utf8", "hex");
	enc += cipher.final('hex');
	return enc;
}

// 相应解密
exports.decrypt = function(str,secret) {
   var decipher = crypto.createDecipher('aes192', secret);
   var dec = decipher.update(str,'hex','utf8');
   dec += decipher.final('utf8');
   return dec;
}