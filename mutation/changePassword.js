const { UserInputError } = require(`apollo-server`);
const { MongoClient, ObjectId } = require(`mongodb`);
const { hash, verify } = require(`argon2`);
const { sign } = require(`jsonwebtoken`);

const { jwtConfig, hashConfig } = require(`../config`);

const authenticate = require(`../checkAuth`);

module.exports = async (_, { oldPassword, newPassword }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const user = await authenticate(authorization);

		const student = await client
			.db(`RBMI`)
			.collection(`students`)
			.findOne({ _id: ObjectId(user._id) });

		if (student) {
			const verified = await verify(student.password, oldPassword);

			if (verified) {
				const password = await hash(newPassword, hashConfig);

				const { modifiedCount } = await client
					.db(`RBMI`)
					.collection(`students`)
					.updateOne({ _id: ObjectId(user._id) }, { $set: { password } });

				if (!modifiedCount)
					throw new UserInputError(`Couldn't change Password ⚠`, {
						error: `Couldn't update password due to some unknown error. Please try again.`,
					});

				delete user.exp;
				return sign({ ...user }, process.env.jwt_secret, jwtConfig);
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
			const verified = await verify(teacher.password, oldPassword);

			if (verified) {
				const password = await hash(newPassword, hashConfig);

				const { modifiedCount } = await client
					.db(`RBMI`)
					.collection(`teachers`)
					.updateOne({ _id: ObjectId(user._id) }, { $set: { password } });

				if (!modifiedCount)
					throw new UserInputError(`Couldn't change Password ⚠`, {
						error: `Couldn't update password due to some unknown error. Please try again.`,
					});

				delete user.exp;
				return sign({ ...user }, process.env.jwt_secret, jwtConfig);
			} else
				throw new UserInputError(`Old Password Incorrect ⚠`, {
					error: `Please try again. Contact admin if you're locked out.`,
				});
		}

		throw new UserInputError(`User Not Found ⚠`, {
			error: `Unknown User. If you think this is due to some error. Contact Admin.`,
		});
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
