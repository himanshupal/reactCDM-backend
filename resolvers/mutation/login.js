const { UserInputError } = require(`apollo-server`),
	{ MongoClient } = require(`mongodb`),
	{ sign } = require(`jsonwebtoken`);

const tokenConf = {
	algorithm: `HS512`,
	expiresIn: `6d`,
};

module.exports = async (_, { username, password }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const student = await client.db(`RBMI`).collection(`students`).findOne({ username, password });

		if (student)
			return sign(
				{
					_id: student._id.toString(),
					username: student.username,
					access: `Student`,
				},
				process.env.jwt_secret,
				tokenConf
			);

		const teacher = await client.db(`RBMI`).collection(`teachers`).findOne({ username, password });

		if (!teacher)
			throw new UserInputError(`Wrong credentials ⚠`, {
				error: `Either username or password provided is Incorrect.`,
			});

		return sign(
			{
				_id: teacher._id.toString(),
				username: teacher.username,
				department: teacher.department,
				access: teacher.designation,
			},
			process.env.jwt_secret,
			tokenConf
		);
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
