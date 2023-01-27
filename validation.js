function validateData(amount, description){
    if(amount <= 0 || description === '' || description === ' ' || description != 'undefined'){
        return false
    } else {
        return true;
    }
}

module.exports = {validateData};