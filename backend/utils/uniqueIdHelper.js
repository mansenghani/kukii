exports.generateUniqueId = () => {
    const random = Math.floor(10000 + Math.random() * 90000);
    return `KUKI${random}`;
};

exports.generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
