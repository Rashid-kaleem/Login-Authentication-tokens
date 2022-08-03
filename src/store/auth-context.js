import React, { useEffect } from "react";
import { useState } from "react"

const AuthContext = React.createContext({
    token:'',
    isLoggedIn: false,
    login:(token)=>{},
    logout:()=>{}
})

let logoutTimer;

const calculateRemaingTime = (expirationTime) =>{
    const currentTime = new Date().getTime();
    const adjExpirationTime = new Date(expirationTime).getTime();

    const remainingDuration = adjExpirationTime - currentTime;

    return remainingDuration;

}

const retrieveStoredToken = () =>{
    const storedToken = localStorage.getItem('token');
    const storedExpirationDate = localStorage.getItem('expirationTime')
    const remainingTime = calculateRemaingTime(storedExpirationDate)

    if(remainingTime<=6000){
        localStorage.removeItem('token');
        localStorage.removeItem('expirationTime');
        return null;
    }
    return {
        token: storedToken,
        duration: remainingTime
    }
}
 
export const AuthContextProvider = (props) =>{
    const tokenData = retrieveStoredToken();
    let initialToken;
    if(tokenData){
        initialToken = tokenData.token;
    }
   
    const[token,setToken] = useState(initialToken);

    const userIsLoggedIn = !!token;

    const logoutHandler = () =>{
        setToken(null)
        localStorage.removeItem('token');

        if(logoutTimer){
            clearTimeout(logoutTimer)
        }
    }

    const loginHandler = (token, expirationTime) =>{
        setToken(token)
        localStorage.setItem('token', token)

        const remainingTime = calculateRemaingTime(expirationTime)

       logoutTimer = setTimeout(logoutHandler, remainingTime);
    }

    useEffect(()=>{
        if(tokenData){
            console.log('helo')
            logoutTimer = setTimeout(logoutHandler, tokenData.duration)
        }
    },[tokenData])

    const contextValue = {

        token: token,
        isLoggedIn: userIsLoggedIn,
        login: loginHandler,
        logout:logoutHandler

    }
 
    return <AuthContext.Provider value={contextValue}>{props.children}</AuthContext.Provider>;
}

export default AuthContext;