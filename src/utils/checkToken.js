import * as msal from "@azure/msal-browser";

const msalConfig = {
    auth: {
        clientId: 'afe7659e-fe98-43d5-bed2-42fce97ed2ea'
    }
};
  
const msalInstance = new msal.PublicClientApplication(msalConfig);

async function checkToken() {
    let account = JSON.parse(localStorage.getItem('account'));
    
    var request = {
        account: account
    };

    let token = await msalInstance.acquireTokenSilent(request).then(tokenResponse => {
        // return access token from acquire silent token
        return tokenResponse.accessToken;
    }).catch(async (error) => {
        console.log(error)
        return msalInstance.acquireTokenPopup(request);
    }).catch(error => {
        return msalInstance.acquireTokenPopup(request);
        // handleError(error);
    });

    return token
}

export default checkToken;