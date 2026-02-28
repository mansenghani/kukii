exports.generateUniqueId = () => {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `RMS-2025-${random}`;
};

exports.generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
