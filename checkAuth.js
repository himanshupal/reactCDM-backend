const { UserInputError, ForbiddenError } = require(`apollo-server`),
	{ verify } = require(`jsonwebtoken`);

module.exports = async (token) => {
	if (!token) throw new ForbiddenError(`Access Denied !!!`);
	if (token.split(`#`)[0] !== process.env.auth_head)
		throw new UserInputError(`Invalid token !`, {
			error: `Authorization token format error`,
		});
	return verify(token.split(`#`)[1], process.env.jwt_secret);
};
