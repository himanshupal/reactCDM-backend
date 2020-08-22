const { AuthenticationError } = require(`apollo-server`),
	{ verify } = require(`jsonwebtoken`);

module.exports = async (token) => {
	if (!token) throw new AuthenticationError(`Access Denied ⚠`);

	const [header, jwt] = token.split(`#`);

	if (header !== process.env.auth_head) throw new AuthenticationError(`Invalid Token ⚠`);

	const decryptedToken = verify(jwt, process.env.jwt_secret);

	if (decryptedToken.exp <= new Date() / 1000) throw new AuthenticationError(`Login Expired ⚠`);

	return decryptedToken;
};
