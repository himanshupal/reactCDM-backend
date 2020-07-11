const { UserInputError } = require(`apollo-server`),
	{ MongoClient } = require(`mongodb`),
	{ sign } = require(`jsonwebtoken`),
	tokenConf = {
		algorithm: `HS512`,
		expiresIn: `6d`,
	};

module.exports = async (_, { data: { username, password } }) => {
	const client = new MongoClient(process.env.mongo_local, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const student = await client
			.db(`RBMI`)
			.collection(`students`)
			.findOne({ username, password });
		if (student)
			return sign(
				{
					username: student.username,
					access: `student`,
				},
				process.env.jwt_secret,
				tokenConf
			);
		const teacher = await client
			.db(`RBMI`)
			.collection(`teachers`)
			.findOne({ username, password });
		if (!teacher)
			throw new UserInputError(`Not found !`, {
				error: `No user found matching given username`,
			});
		return sign(
			{
				username: teacher.username,
				access: teacher.designation,
			},
			process.env.jwt_secret,
			tokenConf
		);
	} catch {
		return error;
	} finally {
		await client.close();
	}
};
