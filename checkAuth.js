const { UserInputError } = require(`apollo-server`),
	{ verify } = require(`jsonwebtoken`);

exports.CheckAuth = (token) => {
	if (!token)
		throw new UserInputError(`Authorization header not present !!!`, {
			error: `No authorization header sent with request. Connection Aborted.`,
		});
	if (token.split(`#`)[0] !== process.env.auth_head)
		throw new UserInputError(`Invalid token !!!`, {
			error: `Authorization token format error...`,
		});
	return verify(token.split(`#`)[1], process.env.jwt_secret);
};
