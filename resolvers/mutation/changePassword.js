const { UserInputError, ForbiddenError } = require(`apollo-server`),
	{ verifyPassword, generatePassword } = require(`../../argon`),
	{ MongoClient, ObjectId } = require(`mongodb`),
	{ sign } = require(`jsonwebtoken`);

const tokenConf = require(`../../jwtConfig`);

const authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`, `Associate Professor`, `Assistant Professor`, `Student`];

module.exports = async (_, { oldPassword, newPassword }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();
		const user = await authenticate(authorization);
		if (!accessAllowed.includes(user.access)) throw new ForbiddenError(`Access Denied ⚠`);

		const student = await client
			.db(`RBMI`)
			.collection(`students`)
			.findOne({ _id: ObjectId(user._id) });

		if (student) {
			const verified = await verifyPassword(oldPassword, student.password);
			if (verified) {
				const password = await generatePassword(newPassword);
				await client
					.db(`RBMI`)
					.collection(`students`)
					.updateOne({ _id: ObjectId(user._id) }, { $set: { password } });
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
			} else
				throw new UserInputError(`Old Password Incorrect ⚠`, {
					error: `Please try again. Contact admin if you're locked out.`,
				});
		}

		const teacher = await client
			.db(`RBMI`)
			.collection(`teachers`)
			.findOne({ _id: ObjectId(user._id) });

		if (teacher) {
			const verified = await verifyPassword(oldPassword, teacher.password);
			if (verified) {
				const password = await generatePassword(newPassword);
				await client
					.db(`RBMI`)
					.collection(`teachers`)
					.updateOne({ _id: ObjectId(user._id) }, { $set: { password } });
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
			} else
				throw new UserInputError(`Old Password Incorrect ⚠`, {
					error: `Please try again. Contact admin if you're locked out.`,
				});
		}

		return `UNKNOWN USER !`;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
