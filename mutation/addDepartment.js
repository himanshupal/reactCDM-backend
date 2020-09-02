const { UserInputError, ForbiddenError } = require(`apollo-server`);
const { MongoClient, Timestamp, ObjectId } = require(`mongodb`);

const authenticate = require(`../checkAuth`);
const { dbName } = require(`../config`);

module.exports = async (_, { data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { _id: loggedInUser, access } = await authenticate(authorization);
		if (access !== `Director`) throw new ForbiddenError(`Access Denied ⚠`);

		const node = client.db(dbName).collection(`departments`);

		if (!data.name)
			throw new UserInputError(`Argument Missing ⚠`, {
				error: `Name is required for creating new department.`,
			});

		const check = await node.findOne({ name: data.name });
		if (check)
			throw new UserInputError(`Already exists ⚠`, {
				error: `There is already a department with same name.`,
			});

		if (data.director) {
			const check = await node.findOne({ director: data.director });
			if (check)
				throw new UserInputError(`Already exists ⚠`, {
					error: `The teacher is already assigned as Director to another department.`,
				});

			await client
				.db(dbName)
				.collection(`teachers`)
				.updateOne({ _id: ObjectId(data.director) }, { $set: { designation: `Director` } });
		}

		const { insertedId } = await node.insertOne({
			...data,
			createdAt: Timestamp.fromNumber(Date.now()),
			createdBy: loggedInUser,
		});

		const [department] = await node
			.aggregate([
				{ $match: { _id: insertedId } },
				{
					$addFields: {
						director: { $toObjectId: `$director` },
						createdBy: { $toObjectId: `$createdBy` },
					},
				},
				{
					$lookup: {
						from: `teachers`,
						localField: `director`,
						foreignField: `_id`,
						as: `director`,
					},
				},
				{ $unwind: { path: `$director`, preserveNullAndEmptyArrays: true } },
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

		return department;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
