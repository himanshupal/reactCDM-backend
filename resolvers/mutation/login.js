const { client, Error } = require(`../../index`),
	{ sign } = require(`jsonwebtoken`);

const tokenConf = {
	algorithm: `HS512`,
	expiresIn: `6d`,
};
exports.login = async (_, { data }) => {
	try {
		connection = await client;
	} catch {
		throw new Error(`Server error !!!`, {
			error: `There is a problem connecting to database. Contact Admin`,
		});
	}
	res = await connection.db(`RBMI`).collection(`students`).findOne({
		username: data.username,
		dateOfBirth: data.password,
	});
	if (res)
		return sign(
			{
				username: res.username,
				access: `student`,
			},
			process.env.jwt_secret,
			tokenConf
		);
	res = await connection.db(`RBMI`).collection(`teachers`).findOne({
		username: data.username,
		dateOfBirth: data.password,
	});
	if (!res)
		throw new Error(`Not found...`, {
			error: `No user found matching given username`,
		});
	return sign(
		{
			username: res.username,
			access: res.designation,
		},
		process.env.jwt_secret,
		tokenConf
	);
};
