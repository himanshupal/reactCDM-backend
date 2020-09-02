const { UserInputError } = require(`apollo-server`);
const { MongoClient, ObjectId, Timestamp } = require(`mongodb`);

const authenticate = require(`../checkAuth`);
const { dbName } = require(`../config`);

module.exports = async (_, { _id, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { _id: loggedInUser, access } = await authenticate(authorization);
		if (_id !== loggedInUser && access === `Student`)
			throw new UserInputError(`Not Allowed ⚠`, {
				error: `You do not have enough permission to change other's details.`,
			});

		const node = client.db(dbName).collection(`students`);

		if (data.username) {
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
		}

		const { lastErrorObject, value } = await node.findOneAndUpdate(
			{ _id: ObjectId(_id) },
			{
				$set: {
					...data,
					updatedAt: Timestamp.fromNumber(Date.now()),
					updatedBy: loggedInUser,
				},
			},
			{ returnOriginal: false }
		);

		if (!lastErrorObject.n)
			throw new UserInputError(`Unknown Error ⚠`, {
				error: `Error updating profile. Please try again or contact admin if issue persists.`,
			});

		const [updated] = await node
			.aggregate([
				{ $match: { _id: value._id } },
				{
					$addFields: {
						createdBy: { $toObjectId: `$createdBy` },
						updatedBy: { $toObjectId: `$updatedBy` },
					},
				},
				{
					$lookup: {
						from: `teachers`,
						localField: `createdBy`,
						foreignField: `_id`,
						as: `createdBy`,
					},
				},
				{ $unwind: { path: `$createdBy`, preserveNullAndEmptyArrays: true } },
				{
					$lookup: {
						from: `teachers`,
						localField: `updatedBy`,
						foreignField: `_id`,
						as: `updatedBy`,
					},
				},
				{ $unwind: { path: `$updatedBy`, preserveNullAndEmptyArrays: true } },
			])
			.toArray();

		return updated;
	} catch {
		return error;
	} finally {
		await client.close();
	}
};
