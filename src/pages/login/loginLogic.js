import * as msal from "@azure/msal-browser";
import { useNavigate } from "react-router-dom";

function LoginLogic() {
    const navigate = useNavigate();

    const msalConfig = {
        auth: {
            clientId: 'afe7659e-fe98-43d5-bed2-42fce97ed2ea'
        }
    };

    const msalInstance = new msal.PublicClientApplication(msalConfig);

    async function msalLogin() {
        const loginResponse = await msalInstance.loginPopup({}); 
        localStorage.setItem('account', JSON.stringify(loginResponse.account));
        localStorage.setItem('access token', loginResponse.accessToken);
        localStorage.setItem('user', loginResponse.account.name);
        localStorage.setItem('mediaMail', loginResponse.account.username);
        navigate('/projects');
    }

    return {
        msalLogin
    }
}

export default LoginLogic;