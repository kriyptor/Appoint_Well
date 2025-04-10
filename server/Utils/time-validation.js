exports.timeDifferenceValidation = (date, time, differenceHour=24) => {

    const givenDate = new Date(`${date}T${time}`);
    const currentTime = new Date();
    const timeDifference = Math.round((givenDate.getTime() - currentTime.getTime())/(1000*60*60)) - 6;

    return timeDifference >= differenceHour;
} 
