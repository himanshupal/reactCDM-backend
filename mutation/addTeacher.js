const { UserInputError, ForbiddenError } = require(`apollo-server`);
const { MongoClient, ObjectId, Timestamp } = require(`mongodb`);
const { blake2bHex } = require(`blakejs`);
const { hash } = require(`argon2`);

const authenticate = require(`../checkAuth`);
const { hashConfig, dbName } = require(`../config`);

const permitted = [`Director`, `Head of Department`];

module.exports = async (_, { data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { _id: loggedInUser, access } = await authenticate(authorization);
		if (!permitted.includes(access)) throw new ForbiddenError(`Access Denied ⚠`);

		const node = client.db(dbName).collection(`teachers`);

		const department = await client
			.db(dbName)
			.collection(`departments`)
			.findOne({ _id: ObjectId(data.department) });
		if (!department)
			throw new UserInputError(`Department not found ⚠`, {
				error: `Couldn't find any department with provided details.`,
			});

		const student = await client.db(dbName).collection(`students`).findOne({ username: data.username });
		if (student)
			throw new UserInputError(`Username not available ⚠`, {
				error: `${data.username} is already assigned to a student. Please choose another username.`,
			});

		const teacher = await node.findOne({ username: data.username });
		if (teacher)
			throw new UserInputError(`Username not available ⚠`, {
				error: `${data.username} is already assigned to another teacher. Please choose another username.`,
			});

		const password = await hash(blake2bHex(data.username), hashConfig);

		const { insertedId } = await node.insertOne({
			...data,
			password,
			createdAt: Timestamp.fromNumber(Date.now()),
			createdBy: loggedInUser,
		});

		const [newTeacher] = await node
			.aggregate([
				{ $match: { _id: insertedId } },
				{
					$addFields: {
						department: { $toObjectId: `$department` },
						createdBy: { $toObjectId: `$createdBy` },
					},
				},
				{
					$lookup: {
						from: `departments`,
						localField: `department`,
						foreignField: `_id`,
						as: `department`,
					},
				},
				{ $unwind: { path: `$department`, preserveNullAndEmptyArrays: true } },
				{
					$lookup: {
						from: `teachers`,
						localField: `createdBy`,
						foreignField: `_id`,
						as: `createdBy`,
					},
				},
				{ $unwind: { path: `$createdBy`, preserveNullAndEmptyArrays: true } },
			])
			.toArray();

		return newTeacher;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
