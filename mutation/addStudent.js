const { UserInputError, ForbiddenError } = require(`apollo-server`);
const { MongoClient, Timestamp, ObjectId } = require(`mongodb`);
const { clearObject } = require(`clear-object`);
const { blake2bHex } = require(`blakejs`);
const { hash } = require(`argon2`);

const authenticate = require(`../checkAuth`);
const { hashConfig, dbName } = require(`../config`);

const permitted = [`Director`, `Head of Department`, `Associate Professor`];

module.exports = async (_, { data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		clearObject(data);

		const { _id: loggedInUser, access } = await authenticate(authorization);
		if (!permitted.includes(access)) throw new ForbiddenError(`Access Denied ⚠`);

		const node = client.db(dbName).collection(`students`);

		const classExist = await client
			.db(dbName)
			.collection(`classes`)
			.findOne({ _id: ObjectId(data.class) });
		if (!classExist)
			throw new UserInputError(`Class not found ⚠`, {
				error: `Couldn't find any class with provided details.`,
			});

		const teacher = await client.db(dbName).collection(`teachers`).findOne({ username: data.username });
		if (teacher)
			throw new UserInputError(`Username not available ⚠`, {
				error: `${data.username} is already assigned to a teacher. Please choose another username.`,
			});

		const student = await node.findOne({ username: data.username });
		if (student)
			throw new UserInputError(`Username not available ⚠`, {
				error: `${data.username} is already assigned to another student. Please choose another username.`,
			});

		const password = await hash(blake2bHex(data.username), hashConfig);

		const { insertedId } = await node.insertOne({
			...data,
			password,
			createdAt: Timestamp.fromNumber(Date.now()),
			createdBy: loggedInUser,
		});

		const [newStudent] = await node
			.aggregate([
				{ $match: { _id: insertedId } },
				{ $addFields: { createdBy: { $toObjectId: `$createdBy` } } },
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

		return newStudent;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
