const { AuthenticationError } = require(`apollo-server`),
	{ verify } = require(`jsonwebtoken`);

module.exports = async (token) => {
	if (!token) throw new AuthenticationError(`Access denied ⚠`);
	if (token.split(`#`)[0] !== process.env.auth_head) throw new AuthenticationError(`Invalid token ⚠`);
	const decryptedToken = verify(token.split(`#`)[1], process.env.jwt_secret);
	if (decryptedToken.exp <= new Date() / 1000) throw new AuthenticationError(`Token expired ⚠`);
	return decryptedToken;
};
