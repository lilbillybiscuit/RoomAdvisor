export default function checkAuth () {
    return fetch(`/api/auth/check`, { credentials: 'include' })
        .then((res) => {
            if (res.status === 200) {
                var user = res.json()
                return user.authenticated
            } else {
                return false // user is not logged in
            }
        })
        .catch((err) => {
            console.error(err)
            return false // assume user is not logged in on error
        })
}

