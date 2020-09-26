const { UserInputError } = require(`apollo-server`);
const { MongoClient, ObjectId, Timestamp } = require(`mongodb`);
const { verify } = require(`argon2`);
const { sign } = require(`jsonwebtoken`);

const { jwtConfig, dbName } = require(`../config`);

module.exports = async (_, { username, password }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const student = await client
			.db(dbName)
			.collection(`students`)
			.findOne({ $or: [{ username }, { email: username }] });

		if (student) {
			const verified = await verify(student.password, password);

			if (verified) {
				await client
					.db(dbName)
					.collection(`students`)
					.updateOne({ _id: ObjectId(student._id) }, { $set: { lastLogin: Timestamp.fromNumber(Date.now()) } });
				return sign(
					{
						lastLogin: student.lastLogin,
						_id: student._id,
						username: student.username,
						class: student.class,
						access: `Student`,
					},
					process.env.jwt_secret,
					jwtConfig
				);
			} else {
				throw new UserInputError(`Incorrect Password ⚠`, {
					error: `Please try again. Contact admin if you're locked out.`,
				});
			}
		}

		const [teacher] = await client
			.db(dbName)
			.collection(`teachers`)
			.aggregate([
				{ $match: { $or: [{ username }, { email: username }] } },
				{ $addFields: { _id: { $toString: `$_id` } } },
				{
					$lookup: {
						from: `classes`,
						localField: `_id`,
						foreignField: `classTeacher`,
						as: `classTeacherOf`,
					},
				},
				{ $unwind: { path: `$classTeacherOf`, preserveNullAndEmptyArrays: true } },
			])
			.toArray();

		if (teacher) {
			const verified = await verify(teacher.password, password);

			if (verified) {
				await client
					.db(dbName)
					.collection(`teachers`)
					.updateOne({ _id: ObjectId(teacher._id) }, { $set: { lastLogin: Timestamp.fromNumber(Date.now()) } });
				return sign(
					{
						_id: teacher._id,
						username: teacher.username,
						department: teacher.department,
						access: teacher.designation,
						lastLogin: teacher.lastLogin,
						classTeacherOf: teacher.classTeacherOf && teacher.classTeacherOf._id.toString(),
					},
					process.env.jwt_secret,
					jwtConfig
				);
			} else {
				throw new UserInputError(`Incorrect Password ⚠`, {
					error: `Please try again. Contact admin if you're locked out.`,
				});
			}
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
