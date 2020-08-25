const { UserInputError, ForbiddenError } = require(`apollo-server`);
const { MongoClient, Timestamp } = require(`mongodb`);
const { blake2bHex } = require(`blakejs`);
const { hash } = require(`argon2`);

const authenticate = require(`../checkAuth`);
const { hashConfig } = require(`../config`);

const permitted = [`Director`, `Head of Department`, `Associate Professor`];

module.exports = async (_, { data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { _id: loggedInUser, access } = await authenticate(authorization);
		if (!permitted.includes(access))
			throw new ForbiddenError(`Access Denied ⚠`);

		const node = client.db(`RBMI`).collection(`students`);

		const classExist = await client
			.db(`RBMI`)
			.collection(`classes`)
			.findOne({ _id: ObjectId(data.class) });
		if (!classExist)
			throw new UserInputError(`Class not found ⚠`, {
				error: `Couldn't find any class with provided details.`,
			});

		const teacher = await client
			.db(`RBMI`)
			.collection(`teachers`)
			.findOne({ username: data.username });
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

		const {
			ops: [{ _id }],
		} = await node.insertOne({
			...data,
			password,
			createdAt: Timestamp.fromNumber(Date.now()),
			createdBy: loggedInUser,
		});

		const [newStudent] = await node
			.aggregate([
				{ $match: { _id } },
				{
					$lookup: {
						from: `teachers`,
						localField: `createdBy`,
						foreignField: `_id`,
						as: `createdBy`,
					},
				},
				{ $unwind: `$createdBy` },
			])
			.toArray();

		return newStudent;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
