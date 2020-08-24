const { UserInputError } = require(`apollo-server`);
const { MongoClient } = require(`mongodb`);
const { verify } = require(`argon2`);
const { sign } = require(`jsonwebtoken`);

const { jwtConfig } = require(`../config`);

module.exports = async (_, { username, password }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const student = await client
			.db(`RBMI`)
			.collection(`students`)
			.findOne({ $or: [{ username }, { email: username }] });

		if (student) {
			const verified = await verify(student.password, password);

			if (verified)
				return sign(
					{
						_id: student._id.toString(),
						username: student.username,
						class: student.class,
						access: `Student`,
					},
					process.env.jwt_secret,
					jwtConfig
				);
			else
				throw new UserInputError(`Incorrect Password ⚠`, {
					error: `Please try again. Contact admin if you're locked out.`,
				});
		}

		const teacher = await client
			.db(`RBMI`)
			.collection(`teachers`)
			.findOne({ $or: [{ username }, { email: username }] });

		if (teacher) {
			const verified = await verify(teacher.password, password);

			if (verified)
				return sign(
					{
						_id: teacher._id.toString(),
						username: teacher.username,
						department: teacher.department,
						access: teacher.designation,
					},
					process.env.jwt_secret,
					jwtConfig
				);
			else
				throw new UserInputError(`Incorrect Password ⚠`, {
					error: `Please try again. Contact admin if you're locked out.`,
				});
		}

		throw new UserInputError(`Not Found ⚠`, {
			error: `No user found with provided username or email.`,
		});
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
