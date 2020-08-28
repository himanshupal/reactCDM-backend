const { UserInputError } = require(`apollo-server`);
const { MongoClient, ObjectId } = require(`mongodb`);

const authenticate = require(`../checkAuth`);

module.exports = async (_, { friends }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { _id, access } = await authenticate(authorization);
		if (access !== `Student`) throw new ForbiddenError(`Access Denied ⚠`);

		const node = client.db(`RBMI`).collection(`students`);

		const { lastErrorObject } = await node.findOneAndUpdate(
			{ _id: ObjectId(_id) },
			{ $set: { friends } },
			{ returnOriginal: false }
		);

		if (!lastErrorObject.n)
			throw new UserInputError(`Unknown Error ⚠`, {
				error: `Error updating profile. Please try again or contact admin if issue persists.`,
			});

		const [{ friends: savedFriends }] = await node
			.aggregate([
				{ $match: { _id: ObjectId(_id) } },
				{ $unwind: { path: `$friends`, preserveNullAndEmptyArrays: true } },
				{ $addFields: { friends: { $toObjectId: `$friends` } } },
				{
					$graphLookup: {
						from: `students`,
						startWith: `$friends`,
						connectFromField: `friends`,
						connectToField: `_id`,
						as: `friends`,
					},
				},
				{ $unwind: { path: `$friends`, preserveNullAndEmptyArrays: true } },
				{ $group: { _id: `$_id`, friends: { $push: `$friends` } } },
			])
			.toArray();

		return savedFriends;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
