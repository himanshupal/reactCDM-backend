const { UserInputError } = require(`apollo-server`),
	{ verifyPassword } = require(`../../argon`),
	{ MongoClient } = require(`mongodb`),
	{ sign } = require(`jsonwebtoken`);

const tokenConf = require(`../../jwtConfig`);

module.exports = async (_, { username, password }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const student = await client.db(`RBMI`).collection(`students`).findOne({ username });

		if (student) {
			const verified = await verifyPassword(password, student.password);
			if (verified)
				return sign(
					{
						_id: student._id.toString(),
						username: student.username,
						class: student.class,
						access: `Student`,
					},
					process.env.jwt_secret,
					tokenConf
				);
			else
				throw new UserInputError(`Incorrect Password ⚠`, {
					error: `Please try again. Contact admin if you're locked out.`,
				});
		}

		const teacher = await client.db(`RBMI`).collection(`teachers`).findOne({ username });

		if (teacher) {
			const verified = await verifyPassword(password, teacher.password);
			if (verified)
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
			else
				throw new UserInputError(`Incorrect Password ⚠`, {
					error: `Please try again. Contact admin if you're locked out.`,
				});
		}

		throw new UserInputError(`Not Found ⚠`, {
			error: `No user found with provided username.`,
		});
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
