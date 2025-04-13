exports.timeDifferenceValidation = (date, time, differenceHour=24) => {

    const givenDate = new Date(`${date}T${time}`);
    const currentTime = new Date();
    const timeDifference = Math.floor((givenDate.getTime() - currentTime.getTime())/(1000*60*60));

    return timeDifference >= differenceHour;
} 


exports.generatePassword = (name) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#$';
    let password = `${name}_Pass@`;
    for (let i = 0; i < 10; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}


exports.convertDateFormat = (dateStr) => {
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (dateRegex.test(dateStr)) {
        const [day, month, year] = dateStr.split('-');
        return `${year}-${month}-${day}`;
    } else {
        return dateStr;
    }
}