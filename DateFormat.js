function getDate(){
    let d = new Date;
    return ([d.getMonth()+1,
            d.getDate(),
            d.getFullYear()].join('-')+' '+
        [d.getHours(),
            d.getMinutes(),
            d.getSeconds()].join('-')).toString();
}

exports.getDate = getDate;