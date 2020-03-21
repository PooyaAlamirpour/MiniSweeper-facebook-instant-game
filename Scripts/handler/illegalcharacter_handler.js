function isIllegalCharacter(input){
    if(input.includes(delimeter))
    {
        return true;
    }
    if(input.includes(PosFeedback))
    {
        return true;
    }
    if(input.includes(ConnectTag))
    {
        return true;
    }
    if(input.includes(DisconnectTag))
    {
        return true;
    }
    return false;
}