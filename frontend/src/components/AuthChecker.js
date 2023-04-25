import { serverIp } from "../constants"

const AuthChecker = () => {

  fetch(`${serverIp}/auth/check`, {
      credentials: "include"
    }).then((res)=> {
      if (res.status !== 200) {
        window.open(`${serverIp}/auth/login`, "_self");
      }
    })

}

export default AuthChecker;

