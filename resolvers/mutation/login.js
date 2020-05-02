const { client, Error } = require(`../../index`),
	{ sign } = require(`jsonwebtoken`);

const tokenConf = {
	algorithm: `HS512`,
	// expiresIn: `5m`,
};
exports.login = async (_, { input }) => {
	try {
		res = await (await client).db(`RBMI`).collection(`students`).findOne({
			_id: input.username,
			dateOfBirth: input.password,
		});
		if (res)
			return {
				username: res.name.first,
				token: sign(
					{
						username: res._id,
						access: res.role,
					},
					process.env.jwt_secret,
					tokenConf
				),
			};
		res = await (await client).db(`RBMI`).collection(`teachers`).findOne({
			_id: input.username,
			dateOfBirth: input.password,
		});
		if (!res)
			throw new Error(`Not found...`, {
				error: `No user found matching given username`,
			});
		return {
			username: res.name.first,
			token: sign(
				{
					username: res._id,
					access: res.designation,
				},
				process.env.jwt_secret,
				tokenConf
			),
		};
	} catch (error) {
		throw new Error(error);
	}
};
